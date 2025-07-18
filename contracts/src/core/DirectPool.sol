// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IDirectPool} from "../interfaces/IDirectPool.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {CLOBAdapter} from "../adapters/CLOBAdapter.sol";

contract DirectPool is IDirectPool, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public projectOwner;
    address public token;
    uint256 public initialPrice; // in USDC (6 decimals)
    uint256 public borrowTimeLimit;
    uint256 public totalLiquidity;
    bool public isFinalized;
    bool private initialized;

    mapping(address => bool) public registeredMMs;
    mapping(address => uint256) public borrowedAmount;
    mapping(address => uint256) public borrowTimestamp;
    mapping(address => address) public mmToCLOBAdapter;
    address[] public mmList;
    
    // Track active MMs (registered and not removed)
    uint256 public activeMMs;
    
    // CLOB DEX and USDC addresses
    address public clobDex;
    address public usdc;

    modifier onlyPO() {
        if (msg.sender != projectOwner) revert NotProjectOwner();
        _;
    }

    modifier onlyRegisteredMM() {
        if (!registeredMMs[msg.sender]) revert NotRegisteredMM();
        _;
    }

    modifier whenFinalized() {
        if (!isFinalized) revert NotFinalized();
        _;
    }

    function initialize(
        address _projectOwner,
        address _token,
        uint256 _initialPrice,
        uint256 _borrowTimeLimit,
        uint256 _tokenAmount
    ) external {
        if (initialized) revert AlreadyInitialized();
        
        projectOwner = _projectOwner;
        token = _token;
        initialPrice = _initialPrice;
        borrowTimeLimit = _borrowTimeLimit;
        totalLiquidity = _tokenAmount;
        initialized = true;
    }

    // Set CLOB DEX and USDC addresses (call after deployment)
    function setCLOBConfig(address _clobDex, address _usdc) external onlyPO {
        require(clobDex == address(0) && usdc == address(0), "Already configured");
        clobDex = _clobDex;
        usdc = _usdc;
    }

    // MM Management Functions
    function registerMM(address mm) external onlyPO {
        if (isFinalized) revert AlreadyFinalized();
        if (mm == address(0)) revert TransferFailed();
        if (registeredMMs[mm]) revert MMAlreadyRegistered();
        
        registeredMMs[mm] = true;
        mmList.push(mm);
        activeMMs++;
        
        emit MMRegistered(mm);
    }

    function unregisterMM(address mm) external onlyPO {
        if (isFinalized) revert AlreadyFinalized();
        if (!registeredMMs[mm]) revert MMNotRegistered();
        
        // Check if MM has borrowed tokens
        if (borrowedAmount[mm] > 0) revert InsufficientBalance();
        
        registeredMMs[mm] = false;
        activeMMs--;
        
        emit MMUnregistered(mm);
    }

    function finalizeMMs() external onlyPO {
        if (isFinalized) revert AlreadyFinalized();
        if (activeMMs == 0) revert NoMMsRegistered();
        
        isFinalized = true;
        emit MMsFinalized();
    }

    // Create CLOB adapter for MM (optional, can be called by PO or MM)
    function createCLOBAdapter(address mm) public {
        if (!registeredMMs[mm]) revert NotRegisteredMM();
        if (mmToCLOBAdapter[mm] != address(0)) revert TransferFailed(); // Already has adapter
        require(clobDex != address(0) && usdc != address(0), "CLOB config not set");
        
        // Deploy new CLOB adapter for this MM
        CLOBAdapter adapter = new CLOBAdapter(
            mm,
            address(this),
            token,
            usdc,
            clobDex
        );
        
        mmToCLOBAdapter[mm] = address(adapter);
    }

    // MM Operations
    function borrowTokens(uint256 amount) external onlyRegisteredMM whenFinalized nonReentrant {
        if (amount == 0) revert TransferFailed();
        
        uint256 allocation = _getMMAllocation();
        uint256 currentBorrowed = borrowedAmount[msg.sender];
        
        if (currentBorrowed + amount > allocation) revert BorrowExceedsAllocation();
        
        // Check available liquidity
        uint256 availableTokens = IERC20(token).balanceOf(address(this));
        if (amount > availableTokens) revert InsufficientBalance();
        
        // Update state
        borrowedAmount[msg.sender] += amount;
        borrowTimestamp[msg.sender] = block.timestamp;
        
        // Ensure CLOBAdapter exists before borrowing
        if (mmToCLOBAdapter[msg.sender] == address(0)) {
            require(clobDex != address(0) && usdc != address(0), "CLOB not configured");
            createCLOBAdapter(msg.sender);
        }
        
        // Always send to CLOBAdapter (never to MM directly)
        address adapter = mmToCLOBAdapter[msg.sender];
        IERC20(token).safeTransfer(adapter, amount);
        
        // Notify adapter to deposit to CLOB
        CLOBAdapter(adapter).receiveTokens(amount);
        
        emit TokensBorrowed(msg.sender, amount);
    }

    function repayTokens(uint256 amount) external nonReentrant {
        if (amount == 0) revert TransferFailed();
        
        uint256 currentBorrowed = borrowedAmount[msg.sender];
        if (amount > currentBorrowed) revert InsufficientBalance();
        
        // Transfer tokens back to pool
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update borrowed amount
        borrowedAmount[msg.sender] -= amount;
        
        emit TokensRepaid(msg.sender, amount);
    }

    function emergencyWithdraw(address mm) external onlyPO nonReentrant {
        uint256 borrowed = borrowedAmount[mm];
        if (borrowed == 0) revert InsufficientBalance();
        
        // Check if borrow time has expired
        if (block.timestamp < borrowTimestamp[mm] + borrowTimeLimit) {
            revert BorrowNotExpired();
        }
        
        // Get current token balance in pool
        uint256 poolBalance = IERC20(token).balanceOf(address(this));
        uint256 withdrawAmount = poolBalance > borrowed ? borrowed : poolBalance;
        
        // Reset borrowed amount
        borrowedAmount[mm] = 0;
        
        // Transfer remaining tokens to project owner
        if (withdrawAmount > 0) {
            IERC20(token).safeTransfer(projectOwner, withdrawAmount);
        }
        
        emit EmergencyWithdraw(mm, withdrawAmount);
    }

    // View Functions
    function getMaxBorrowAmount(address mm) external view returns (uint256) {
        if (!registeredMMs[mm] || !isFinalized || activeMMs == 0) return 0;
        
        uint256 allocation = _getMMAllocation();
        uint256 currentBorrowed = borrowedAmount[mm];
        
        return allocation > currentBorrowed ? allocation - currentBorrowed : 0;
    }

    function getBorrowedAmount(address mm) external view returns (uint256) {
        return borrowedAmount[mm];
    }

    function getMMAllocation() external view returns (uint256) {
        return _getMMAllocation();
    }

    function getPoolInfo() external view returns (
        uint256 _totalLiquidity,
        uint256 availableLiquidity,
        uint256 numberOfMMs,
        bool _isFinalized,
        uint256[] memory borrowedAmounts
    ) {
        _totalLiquidity = totalLiquidity;
        availableLiquidity = IERC20(token).balanceOf(address(this));
        numberOfMMs = activeMMs;
        _isFinalized = isFinalized;
        
        // Collect borrowed amounts for all MMs
        borrowedAmounts = new uint256[](mmList.length);
        for (uint256 i = 0; i < mmList.length; i++) {
            if (registeredMMs[mmList[i]]) {
                borrowedAmounts[i] = borrowedAmount[mmList[i]];
            }
        }
    }

    // Graduation handler - only callable by BondingCurve (current owner)
    function handleGraduation(address newOwner, uint256 tokenAmount) external {
        // Security: Only callable by current owner (BondingCurve)
        require(msg.sender == projectOwner, "Only owner can graduate");
        
        // Update total liquidity to match incoming tokens
        totalLiquidity = tokenAmount;
        
        // Transfer ownership from BondingCurve to original project owner
        projectOwner = newOwner;
        
        emit Graduated(newOwner, totalLiquidity);
    }

    // Internal Functions
    function _getMMAllocation() internal view returns (uint256) {
        if (activeMMs == 0) return 0;
        return totalLiquidity / activeMMs;
    }
}