// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IDirectPool} from "../interfaces/IDirectPool.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

contract DirectPool is IDirectPool {
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

    event MMRegistered(address indexed mm);
    event MMUnregistered(address indexed mm);
    event MMsFinalized();
    event TokensBorrowed(address indexed mm, uint256 amount);
    event TokensRepaid(address indexed mm, uint256 amount);
    event EmergencyWithdraw(address indexed mm, uint256 amount);

    error NotProjectOwner();
    error NotRegisteredMM();
    error AlreadyFinalized();
    error BorrowExceedsAllocation();
    error BorrowNotExpired();
    error AlreadyInitialized();

    modifier onlyPO() {
        if (msg.sender != projectOwner) revert NotProjectOwner();
        _;
    }

    modifier onlyRegisteredMM() {
        if (!registeredMMs[msg.sender]) revert NotRegisteredMM();
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

    // Placeholder implementations for other functions
    function registerMM(address mm) external onlyPO {
        if (isFinalized) revert AlreadyFinalized();
        registeredMMs[mm] = true;
        mmList.push(mm);
        emit MMRegistered(mm);
    }

    function unregisterMM(address mm) external onlyPO {
        if (isFinalized) revert AlreadyFinalized();
        registeredMMs[mm] = false;
        emit MMUnregistered(mm);
    }

    function finalizeMMs() external onlyPO {
        if (isFinalized) revert AlreadyFinalized();
        isFinalized = true;
        emit MMsFinalized();
    }

    function borrowTokens(uint256 amount) external onlyRegisteredMM {
        // Placeholder implementation
        borrowedAmount[msg.sender] += amount;
        borrowTimestamp[msg.sender] = block.timestamp;
        emit TokensBorrowed(msg.sender, amount);
    }

    function repayTokens(uint256 amount) external onlyRegisteredMM {
        // Placeholder implementation
        borrowedAmount[msg.sender] -= amount;
        emit TokensRepaid(msg.sender, amount);
    }

    function emergencyWithdraw(address mm) external onlyPO {
        // Placeholder implementation
        uint256 amount = borrowedAmount[mm];
        borrowedAmount[mm] = 0;
        emit EmergencyWithdraw(mm, amount);
    }

    function getMaxBorrowAmount(address mm) external view returns (uint256) {
        if (!registeredMMs[mm] || mmList.length == 0) return 0;
        return totalLiquidity / mmList.length;
    }

    function getBorrowedAmount(address mm) external view returns (uint256) {
        return borrowedAmount[mm];
    }

    function getMMAllocation() external view returns (uint256) {
        if (mmList.length == 0) return 0;
        return totalLiquidity / mmList.length;
    }
}