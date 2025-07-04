// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ICLOBAdapter {
    struct Order {
        uint256 orderId;
        uint256 price;
        uint256 amount;
        bool isBuy;
        bool isActive;
        uint256 timestamp;
    }

    // Events
    event OrderPlaced(uint256 orderId, uint256 price, uint256 amount, bool isBuy);
    event OrderCancelled(uint256 orderId);
    event OrderExecuted(uint256 orderId, uint256 executedAmount);
    event TokensDeposited(address token, uint256 amount);
    event TokensWithdrawn(address token, uint256 amount);
    event ProfitWithdrawn(uint256 amount);

    // Errors
    error Unauthorized();
    error InvalidAmount();
    error InvalidOrder();
    error InsufficientBalance();
    error TransferFailed();

    // Order Management
    function placeLimitOrder(
        uint256 price,
        uint256 amount,
        bool isBuy
    ) external returns (uint256 orderId);

    function placeMarketOrder(
        uint256 amount,
        bool isBuy
    ) external returns (uint256 executedAmount);

    function cancelOrder(uint256 orderId) external;

    // Balance Management
    function depositTokens(uint256 amount) external;
    function withdrawTokens(uint256 amount) external;
    function withdrawProfits() external returns (uint256 usdcAmount);

    // View Functions
    function getBalance() external view returns (uint256 tokenBalance, uint256 usdcBalance);
    function getOrders() external view returns (Order[] memory);
    function getActiveOrdersCount() external view returns (uint256);
    function getCLOBBalance() external view returns (uint256 tokenBalance, uint256 usdcBalance);
}