// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IProjectFactory} from "../interfaces/IProjectFactory.sol";
import {IDirectPool} from "../interfaces/IDirectPool.sol";
import {IBondingCurve} from "../interfaces/IBondingCurve.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {Clones} from "lib/openzeppelin-contracts/contracts/proxy/Clones.sol";
import {ERC20Token} from "../tokens/ERC20Token.sol";

contract ProjectFactory is IProjectFactory {
    using SafeERC20 for IERC20;

    uint256 private constant DEFAULT_INITIAL_PRICE = 0.0001e6; // $0.0001 in USDC (6 decimals)
    uint256 private constant MIN_PRICE_MULTIPLIER = 0.1e18; // 0.1x
    uint256 private constant MAX_PRICE_MULTIPLIER = 10e18; // 10x
    uint256 private constant MIN_BORROW_TIME = 1 days;
    uint256 private constant MAX_BORROW_TIME = 30 days;

    mapping(address => address[]) public projectsByOwner;
    address[] public allProjects;
    mapping(address => PoolMode) public projectModes; // Track the mode of each project
    
    address public usdc; // USDC address for the network
    address public directPoolTemplate; // Template contract for DirectPool clones
    address public bondingCurveTemplate; // Template contract for BondingCurve clones
    
    bool private templatesSet;

    constructor(address _usdc) {
        usdc = _usdc;
    }
    
    // Set template contracts (can only be called once after deployment)
    function setTemplates(address _directPoolTemplate, address _bondingCurveTemplate) external {
        if (templatesSet) revert TemplatesAlreadySet();
        if (_directPoolTemplate == address(0) || _bondingCurveTemplate == address(0)) revert ZeroAddress();
        
        directPoolTemplate = _directPoolTemplate;
        bondingCurveTemplate = _bondingCurveTemplate;
        templatesSet = true;
        
        emit TemplatesSet(_directPoolTemplate, _bondingCurveTemplate);
    }

    function createProject(
        bool isNewToken,
        address existingToken,
        string memory name,
        string memory symbol,
        string memory description,
        uint256 tokenAmount,
        PoolMode mode,
        uint256 initialPrice,
        uint256 targetMarketCap,
        uint256 borrowTimeLimit
    ) external returns (address projectAddress) {
        // Validate inputs
        _validateInputs(
            isNewToken,
            existingToken,
            tokenAmount,
            mode,
            initialPrice,
            targetMarketCap,
            borrowTimeLimit,
            description
        );

        // Create or get token
        address token;
        uint256 actualTokenAmount;
        
        if (isNewToken) {
            // Deploy new token
            token = address(new ERC20Token(name, symbol));
            actualTokenAmount = IERC20(token).totalSupply();
        } else {
            // Use existing token
            token = existingToken;
            actualTokenAmount = tokenAmount;
            
            // Transfer tokens from user to this contract
            IERC20(token).safeTransferFrom(msg.sender, address(this), tokenAmount);
        }

        // Create project based on mode
        if (mode == PoolMode.DIRECT_POOL) {
            projectAddress = _createDirectPool(
                token,
                actualTokenAmount,
                initialPrice,
                borrowTimeLimit
            );
        } else {
            projectAddress = _createBondingCurve(
                token,
                actualTokenAmount,
                targetMarketCap,
                borrowTimeLimit
            );
        }

        // Update mappings
        projectsByOwner[msg.sender].push(projectAddress);
        allProjects.push(projectAddress);
        projectModes[projectAddress] = mode;

        // Transfer tokens to the project
        IERC20(token).safeTransfer(projectAddress, actualTokenAmount);

        emit ProjectCreated(projectAddress, msg.sender, mode);
    }

    function _validateInputs(
        bool isNewToken,
        address existingToken,
        uint256 tokenAmount,
        PoolMode mode,
        uint256 initialPrice,
        uint256 targetMarketCap,
        uint256 borrowTimeLimit,
        string memory description
    ) private pure {
        // Validate description
        if (bytes(description).length == 0) revert InvalidDescription();

        // Validate token inputs
        if (!isNewToken) {
            if (existingToken == address(0)) revert ZeroAddress();
            if (tokenAmount == 0) revert InvalidTokenAmount();
        }

        // Validate borrow time limit
        if (borrowTimeLimit < MIN_BORROW_TIME || borrowTimeLimit > MAX_BORROW_TIME) {
            revert InvalidTimeLimit();
        }

        // Mode-specific validations
        if (mode == PoolMode.DIRECT_POOL) {
            // Validate initial price (between 0.1x and 10x of default)
            uint256 minPrice = (DEFAULT_INITIAL_PRICE * MIN_PRICE_MULTIPLIER) / 1e18;
            uint256 maxPrice = (DEFAULT_INITIAL_PRICE * MAX_PRICE_MULTIPLIER) / 1e18;
            
            if (initialPrice < minPrice || initialPrice > maxPrice) {
                revert InvalidInitialPrice();
            }
        } else {
            // Bonding curve mode
            if (targetMarketCap == 0) revert InvalidTargetMarketCap();
        }
    }

    function _createDirectPool(
        address token,
        uint256 tokenAmount,
        uint256 initialPrice,
        uint256 borrowTimeLimit
    ) private returns (address) {
        if (!templatesSet) revert TemplatesNotSet();
        
        // Clone the DirectPool template
        address poolClone = Clones.clone(directPoolTemplate);
        
        // Initialize the clone
        IDirectPool(poolClone).initialize(
            msg.sender,
            token,
            initialPrice,
            borrowTimeLimit,
            tokenAmount
        );
        
        return poolClone;
    }

    function _createBondingCurve(
        address token,
        uint256 tokenAmount,
        uint256 targetMarketCap,
        uint256 borrowTimeLimit
    ) private returns (address) {
        if (!templatesSet) revert TemplatesNotSet();
        
        // First create the DirectPool clone that will receive funds after graduation
        address directPoolClone = Clones.clone(directPoolTemplate);
        
        // Create BondingCurve clone
        address curveClone = Clones.clone(bondingCurveTemplate);
        
        // Initialize BondingCurve
        IBondingCurve(curveClone).initialize(
            msg.sender,
            token,
            directPoolClone,
            targetMarketCap,
            tokenAmount
        );
        
        // Set USDC address
        IBondingCurve(curveClone).setUSDC(usdc);

        // Initialize DirectPool with bonding curve as temporary owner
        // Will be transferred to project owner after graduation
        IDirectPool(directPoolClone).initialize(
            curveClone,
            token,
            DEFAULT_INITIAL_PRICE, // Use default price for bonding curve graduation
            borrowTimeLimit,
            0 // No initial tokens, will receive after graduation
        );

        return curveClone;
    }

    function getProjectsByOwner(address owner) external view returns (address[] memory) {
        return projectsByOwner[owner];
    }

    function getAllProjects() external view returns (address[] memory) {
        return allProjects;
    }

    function getProjectCount() external view returns (uint256) {
        return allProjects.length;
    }

    function getProjectMode(address project) external view returns (PoolMode) {
        return projectModes[project];
    }
}