// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IBondingCurve} from "../interfaces/IBondingCurve.sol";
import {IDirectPool} from "../interfaces/IDirectPool.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract BondingCurve is IBondingCurve, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public projectOwner;
    address public token;
    address public directPool;
    address public usdc;
    uint256 public targetMarketCap;
    uint256 public virtualUSDCReserve;
    uint256 public tokenReserve;
    uint256 public collectedUSDC; // Actual USDC collected from sales
    bool public graduated;
    bool private initialized;

    uint256 private constant INITIAL_PRICE = 0.0001e6; // $0.0001 in USDC (6 decimals)
    uint256 private constant PRECISION = 1e18;

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
        // virtualUSDCReserve = tokenReserve * initialPrice / token decimals adjustment
        // Since token has 18 decimals and USDC has 6, we need to adjust
        virtualUSDCReserve = (_tokenAmount * INITIAL_PRICE) / 1e18;

        // TODO: Set USDC address based on deployment network
        // For now, we'll set it during deployment

        initialized = true;
    }

    // Set USDC address (temporary function for deployment flexibility)
    function setUSDC(address _usdc) external {
        if (usdc == address(0)) {
            usdc = _usdc;
        }
    }

    // Buy tokens with USDC
    function buy(uint256 usdcAmount) external returns (uint256 tokensReceived) {
        tokensReceived = _buyWithSlippage(usdcAmount, 0);
    }

    function buyWithSlippage(uint256 usdcAmount, uint256 minTokensOut)
        external
        nonReentrant
        returns (uint256 tokensReceived)
    {
        tokensReceived = _buyWithSlippage(usdcAmount, minTokensOut);
    }

    function _buyWithSlippage(uint256 usdcAmount, uint256 minTokensOut) internal returns (uint256 tokensReceived) {
        if (graduated) revert AlreadyGraduated();
        if (usdcAmount == 0) revert InvalidAmount();

        // Calculate tokens to receive using x*y=k formula
        tokensReceived = calculateBuyReturn(usdcAmount);

        if (tokensReceived < minTokensOut) revert SlippageExceeded();
        if (tokensReceived > tokenReserve) revert InsufficientLiquidity();

        // Transfer USDC from buyer
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), usdcAmount);

        // Update reserves
        tokenReserve -= tokensReceived;
        virtualUSDCReserve += usdcAmount;
        collectedUSDC += usdcAmount;

        // Transfer tokens to buyer
        IERC20(token).safeTransfer(msg.sender, tokensReceived);

        emit TokensPurchased(msg.sender, usdcAmount, tokensReceived);

        // Check for graduation
        if (canGraduate()) {
            _graduate();
        }
    }

    // Sell tokens for USDC
    function sell(uint256 tokenAmount) external returns (uint256 usdcReceived) {
        usdcReceived = _sellWithSlippage(tokenAmount, 0);
    }

    function sellWithSlippage(uint256 tokenAmount, uint256 minUsdcOut)
        external
        nonReentrant
        returns (uint256 usdcReceived)
    {
        usdcReceived = _sellWithSlippage(tokenAmount, minUsdcOut);
    }

    function _sellWithSlippage(uint256 tokenAmount, uint256 minUsdcOut) internal returns (uint256 usdcReceived) {
        if (graduated) revert AlreadyGraduated();
        if (tokenAmount == 0) revert InvalidAmount();

        // Calculate USDC to receive using x*y=k formula
        usdcReceived = calculateSellReturn(tokenAmount);

        if (usdcReceived < minUsdcOut) revert SlippageExceeded();
        if (usdcReceived > collectedUSDC) revert InsufficientLiquidity();

        // Transfer tokens from seller
        IERC20(token).safeTransferFrom(msg.sender, address(this), tokenAmount);

        // Update reserves
        tokenReserve += tokenAmount;
        virtualUSDCReserve -= usdcReceived;
        collectedUSDC -= usdcReceived;

        // Transfer USDC to seller
        IERC20(usdc).safeTransfer(msg.sender, usdcReceived);

        emit TokensSold(msg.sender, tokenAmount, usdcReceived);
    }

    // Graduate to DirectPool
    function graduate() external {
        if (graduated) revert AlreadyGraduated();
        if (!canGraduate()) revert CannotGraduateYet();

        _graduate();
    }

    function _graduate() internal {
        graduated = true;

        uint256 finalMarketCap = getCurrentMarketCap();
        emit Graduated(finalMarketCap);

        // Transfer all remaining tokens to DirectPool
        uint256 remainingTokens = IERC20(token).balanceOf(address(this));
        if (remainingTokens > 0) {
            IERC20(token).safeTransfer(directPool, remainingTokens);
        }

        // Transfer all collected USDC to DirectPool
        uint256 remainingUSDC = IERC20(usdc).balanceOf(address(this));
        if (remainingUSDC > 0) {
            IERC20(usdc).safeTransfer(directPool, remainingUSDC);
        }

        // Update DirectPool ownership and total liquidity
        IDirectPool(directPool).handleGraduation(projectOwner, remainingTokens);
    }

    // View Functions
    function getCurrentPrice() external view returns (uint256) {
        if (tokenReserve == 0) return 0;
        // Price = virtualUSDCReserve / tokenReserve
        // Adjust for decimals: USDC has 6, token has 18
        // Return price in USDC per token (6 decimals)
        return (virtualUSDCReserve * PRECISION) / tokenReserve;
    }

    function getCurrentMarketCap() public view returns (uint256) {
        uint256 totalSupply = IERC20(token).totalSupply();
        if (tokenReserve == 0) return 0;

        // Current price in USDC (6 decimals) per token
        uint256 currentPrice = (virtualUSDCReserve * PRECISION) / tokenReserve;

        // Market cap = total supply * price
        // totalSupply has 18 decimals, price has 6 decimals precision
        // Result should be in USDC (6 decimals)
        return (totalSupply * currentPrice) / PRECISION;
    }

    function canGraduate() public view returns (bool) {
        return getCurrentMarketCap() >= targetMarketCap;
    }

    function getReserves() external view returns (uint256 _tokenReserve, uint256 _virtualUsdcReserve) {
        return (tokenReserve, virtualUSDCReserve);
    }

    // Calculate expected tokens from USDC amount using x*y=k
    function calculateBuyReturn(uint256 usdcAmount) public view returns (uint256) {
        if (usdcAmount == 0) return 0;

        // Current k = tokenReserve * virtualUSDCReserve
        uint256 k = tokenReserve * virtualUSDCReserve;

        // New USDC reserve after buy
        uint256 newUsdcReserve = virtualUSDCReserve + usdcAmount;

        // New token reserve to maintain k constant
        uint256 newTokenReserve = k / newUsdcReserve;

        // Tokens to send = current reserve - new reserve
        return tokenReserve - newTokenReserve;
    }

    // Calculate expected USDC from token amount using x*y=k
    function calculateSellReturn(uint256 tokenAmount) public view returns (uint256) {
        if (tokenAmount == 0) return 0;

        // Current k = tokenReserve * virtualUSDCReserve
        uint256 k = tokenReserve * virtualUSDCReserve;

        // New token reserve after sell
        uint256 newTokenReserve = tokenReserve + tokenAmount;

        // New USDC reserve to maintain k constant
        uint256 newUsdcReserve = k / newTokenReserve;

        // USDC to send = current reserve - new reserve
        return virtualUSDCReserve - newUsdcReserve;
    }
}
