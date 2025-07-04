// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IBondingCurve} from "../interfaces/IBondingCurve.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

contract BondingCurve is IBondingCurve {
    using SafeERC20 for IERC20;

    address public projectOwner;
    address public token;
    address public directPool;
    uint256 public targetMarketCap;
    uint256 public virtualUSDCReserve;
    uint256 public tokenReserve;
    bool public graduated;
    bool private initialized;

    uint256 private constant INITIAL_PRICE = 0.0001e6; // $0.0001 in USDC (6 decimals)

    event TokensPurchased(address indexed buyer, uint256 usdcAmount, uint256 tokensReceived);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 usdcReceived);
    event Graduated(uint256 finalMarketCap);

    error AlreadyGraduated();
    error CannotGraduateYet();
    error InsufficientLiquidity();
    error AlreadyInitialized();

    function initialize(
        address _projectOwner,
        address _token,
        address _directPool,
        uint256 _targetMarketCap,
        uint256 _tokenAmount
    ) external {
        if (initialized) revert AlreadyInitialized();
        
        projectOwner = _projectOwner;
        token = _token;
        directPool = _directPool;
        targetMarketCap = _targetMarketCap;
        tokenReserve = _tokenAmount;
        
        // Calculate initial virtual USDC reserve based on initial price
        // virtualUSDCReserve = tokenReserve * initialPrice
        virtualUSDCReserve = (_tokenAmount * INITIAL_PRICE) / 1e18;
        
        initialized = true;
    }

    // Placeholder implementations
    function buy(uint256 usdcAmount) external returns (uint256 tokensReceived) {
        if (graduated) revert AlreadyGraduated();
        // Placeholder implementation
        emit TokensPurchased(msg.sender, usdcAmount, tokensReceived);
    }

    function sell(uint256 tokenAmount) external returns (uint256 usdcReceived) {
        if (graduated) revert AlreadyGraduated();
        // Placeholder implementation
        emit TokensSold(msg.sender, tokenAmount, usdcReceived);
    }

    function graduate() external {
        if (graduated) revert AlreadyGraduated();
        if (!canGraduate()) revert CannotGraduateYet();
        
        graduated = true;
        emit Graduated(getCurrentMarketCap());
        
        // Transfer remaining tokens and USDC to DirectPool
        // Placeholder implementation
    }

    function getCurrentPrice() external view returns (uint256) {
        if (tokenReserve == 0) return 0;
        return (virtualUSDCReserve * 1e18) / tokenReserve;
    }

    function getCurrentMarketCap() public view returns (uint256) {
        uint256 totalSupply = IERC20(token).totalSupply();
        uint256 currentPrice = (virtualUSDCReserve * 1e18) / tokenReserve;
        return (totalSupply * currentPrice) / 1e18;
    }

    function canGraduate() public view returns (bool) {
        return getCurrentMarketCap() >= targetMarketCap;
    }
}