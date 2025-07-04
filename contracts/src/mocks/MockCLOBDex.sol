// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ICLOBDex} from "../interfaces/ICLOBDex.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockCLOBDex is ICLOBDex {
    using SafeERC20 for IERC20;

    mapping(address => mapping(address => uint256)) public balances; // trader => token => balance
    mapping(uint256 => Order) public orders;
    uint256 public nextOrderId = 1;

    // Simple price oracle for market orders (in production, this would be from actual order book)
    mapping(address => mapping(address => uint256)) public marketPrices; // tokenA => tokenB => price

    event Deposited(address indexed trader, address indexed token, uint256 amount);
    event Withdrawn(address indexed trader, address indexed token, uint256 amount);
    event OrderPlaced(uint256 indexed orderId, address indexed trader);
    event OrderCancelled(uint256 indexed orderId);
    event OrderExecuted(uint256 indexed orderId, uint256 executedAmount);

    function deposit(address token, uint256 amount) external {
        require(amount > 0, "Invalid amount");
        
        // Transfer tokens from trader to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update balance
        balances[msg.sender][token] += amount;
        
        emit Deposited(msg.sender, token, amount);
    }

    function withdraw(address token, uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        
        // Update balance
        balances[msg.sender][token] -= amount;
        
        // Transfer tokens to trader
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, token, amount);
    }

    function placeLimitOrder(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 priceInB,
        bool isBuy
    ) external returns (uint256 orderId) {
        require(amountA > 0 && priceInB > 0, "Invalid parameters");
        
        // Check balance
        address fromToken = isBuy ? tokenB : tokenA;
        uint256 requiredAmount = isBuy ? (amountA * priceInB) / 1e18 : amountA;
        require(balances[msg.sender][fromToken] >= requiredAmount, "Insufficient balance");
        
        // Create order
        orderId = nextOrderId++;
        orders[orderId] = Order({
            orderId: orderId,
            trader: msg.sender,
            tokenA: tokenA,
            tokenB: tokenB,
            amountA: amountA,
            priceInB: priceInB,
            isBuy: isBuy,
            isActive: true,
            filledAmount: 0
        });
        
        // Lock funds
        balances[msg.sender][fromToken] -= requiredAmount;
        
        emit OrderPlaced(orderId, msg.sender);
        
        // Mock: Simulate partial fill (50% for testing)
        _mockExecuteOrder(orderId, amountA / 2);
    }

    function placeMarketOrder(
        address tokenA,
        address tokenB,
        uint256 amountA,
        bool isBuy
    ) external returns (uint256 executedAmount) {
        require(amountA > 0, "Invalid amount");
        
        // Get mock market price
        uint256 price = getMarketPrice(tokenA, tokenB);
        require(price > 0, "No market price available");
        
        // Check balance
        address fromToken = isBuy ? tokenB : tokenA;
        uint256 requiredAmount = isBuy ? (amountA * price) / 1e18 : amountA;
        require(balances[msg.sender][fromToken] >= requiredAmount, "Insufficient balance");
        
        // Execute immediately
        balances[msg.sender][fromToken] -= requiredAmount;
        
        // Give tokens
        address toToken = isBuy ? tokenA : tokenB;
        uint256 receiveAmount = isBuy ? amountA : (amountA * price) / 1e18;
        balances[msg.sender][toToken] += receiveAmount;
        
        executedAmount = amountA;
        
        emit OrderExecuted(nextOrderId++, executedAmount);
    }

    function cancelOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.trader == msg.sender, "Not order owner");
        require(order.isActive, "Order not active");
        
        // Return locked funds
        address fromToken = order.isBuy ? order.tokenB : order.tokenA;
        uint256 remainingAmount = order.amountA - order.filledAmount;
        uint256 refundAmount = order.isBuy 
            ? (remainingAmount * order.priceInB) / 1e18 
            : remainingAmount;
        
        balances[msg.sender][fromToken] += refundAmount;
        
        order.isActive = false;
        
        emit OrderCancelled(orderId);
    }

    function getBalance(address trader, address token) external view returns (uint256) {
        return balances[trader][token];
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    // Mock functions for testing
    function setMarketPrice(address tokenA, address tokenB, uint256 price) external {
        marketPrices[tokenA][tokenB] = price;
        marketPrices[tokenB][tokenA] = 1e36 / price; // Inverse price
    }

    function getMarketPrice(address tokenA, address tokenB) public view returns (uint256) {
        uint256 price = marketPrices[tokenA][tokenB];
        if (price == 0) {
            // Default prices for testing
            return 1e18; // 1:1 ratio
        }
        return price;
    }

    function _mockExecuteOrder(uint256 orderId, uint256 fillAmount) internal {
        Order storage order = orders[orderId];
        if (!order.isActive || fillAmount == 0) return;
        
        uint256 toFill = fillAmount > (order.amountA - order.filledAmount) 
            ? order.amountA - order.filledAmount 
            : fillAmount;
        
        if (toFill > 0) {
            // Update filled amount
            order.filledAmount += toFill;
            
            // Transfer tokens
            address toToken = order.isBuy ? order.tokenA : order.tokenB;
            uint256 receiveAmount = order.isBuy ? toFill : (toFill * order.priceInB) / 1e18;
            balances[order.trader][toToken] += receiveAmount;
            
            // Mark as inactive if fully filled
            if (order.filledAmount == order.amountA) {
                order.isActive = false;
            }
            
            emit OrderExecuted(orderId, toFill);
        }
    }

    // Helper function to simulate market movements
    function simulateMarketMovement(uint256 orderId, uint256 fillAmount) external {
        _mockExecuteOrder(orderId, fillAmount);
    }
}