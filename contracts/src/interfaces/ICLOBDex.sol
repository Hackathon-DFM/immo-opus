// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ICLOBDex {
    struct Order {
        uint256 orderId;
        address trader;
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 priceInB;
        bool isBuy;
        bool isActive;
        uint256 filledAmount;
    }

    function deposit(address token, uint256 amount) external;
    function withdraw(address token, uint256 amount) external;
    
    function placeLimitOrder(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 priceInB,
        bool isBuy
    ) external returns (uint256 orderId);
    
    function placeMarketOrder(
        address tokenA,
        address tokenB,
        uint256 amountA,
        bool isBuy
    ) external returns (uint256 executedAmount);
    
    function cancelOrder(uint256 orderId) external;
    function getBalance(address trader, address token) external view returns (uint256);
    function getOrder(uint256 orderId) external view returns (Order memory);
}