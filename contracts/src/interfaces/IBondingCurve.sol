// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IBondingCurve {
    // Events
    event TokensPurchased(address indexed buyer, uint256 usdcAmount, uint256 tokensReceived);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 usdcReceived);
    event Graduated(uint256 finalMarketCap);

    // Errors
    error AlreadyGraduated();
    error CannotGraduateYet();
    error InsufficientLiquidity();
    error AlreadyInitialized();
    error InvalidAmount();
    error TransferFailed();
    error SlippageExceeded();

    // Initialization
    function initialize(
        address _projectOwner,
        address _token,
        address _directPool,
        uint256 _targetMarketCap,
        uint256 _tokenAmount
    ) external;
    
    function setUSDC(address _usdc) external;

    // User Operations
    function buy(uint256 usdcAmount) external returns (uint256 tokensReceived);
    function buyWithSlippage(uint256 usdcAmount, uint256 minTokensOut) external returns (uint256 tokensReceived);
    function sell(uint256 tokenAmount) external returns (uint256 usdcReceived);
    function sellWithSlippage(uint256 tokenAmount, uint256 minUsdcOut) external returns (uint256 usdcReceived);

    // Graduation
    function graduate() external;

    // View Functions
    function getCurrentPrice() external view returns (uint256);
    function getCurrentMarketCap() external view returns (uint256);
    function canGraduate() external view returns (bool);
    function getReserves() external view returns (uint256 tokenReserve, uint256 virtualUsdcReserve);
    function calculateBuyReturn(uint256 usdcAmount) external view returns (uint256);
    function calculateSellReturn(uint256 tokenAmount) external view returns (uint256);
}