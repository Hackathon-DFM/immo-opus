// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ICLOBAdapter} from "../interfaces/ICLOBAdapter.sol";
import {ICLOBDex} from "../interfaces/ICLOBDex.sol";
import {IERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract CLOBAdapter is ICLOBAdapter, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public immutable mm;
    address public immutable directPool;
    address public immutable token;
    address public immutable usdc;
    address public immutable clobDex;

    mapping(uint256 => Order) public orders;
    uint256[] public orderIds;
    uint256 public nextOrderId;

    modifier onlyMM() {
        if (msg.sender != mm) revert Unauthorized();
        _;
    }

    modifier onlyMMOrPool() {
        if (msg.sender != mm && msg.sender != directPool) revert Unauthorized();
        _;
    }

    constructor(
        address _mm,
        address _directPool,
        address _token,
        address _usdc,
        address _clobDex
    ) {
        mm = _mm;
        directPool = _directPool;
        token = _token;
        usdc = _usdc;
        clobDex = _clobDex;
    }

    // Order Management Functions
    function placeLimitOrder(
        uint256 price,
        uint256 amount,
        bool isBuy
    ) external onlyMM nonReentrant returns (uint256 orderId) {
        if (amount == 0 || price == 0) revert InvalidAmount();

        // Check balance based on order type
        if (isBuy) {
            uint256 requiredUsdc = (amount * price) / 1e18; // Adjust for decimals
            uint256 availableUsdc = ICLOBDex(clobDex).getBalance(address(this), usdc);
            if (requiredUsdc > availableUsdc) revert InsufficientBalance();
        } else {
            uint256 availableTokens = ICLOBDex(clobDex).getBalance(address(this), token);
            if (amount > availableTokens) revert InsufficientBalance();
        }

        // Place order on CLOB DEX
        orderId = ICLOBDex(clobDex).placeLimitOrder(
            isBuy ? usdc : token,
            isBuy ? token : usdc,
            amount,
            price,
            isBuy
        );

        // Store order info
        orders[orderId] = Order({
            orderId: orderId,
            price: price,
            amount: amount,
            isBuy: isBuy,
            isActive: true,
            timestamp: block.timestamp
        });
        orderIds.push(orderId);
        nextOrderId++;

        emit OrderPlaced(orderId, price, amount, isBuy);
    }

    function placeMarketOrder(
        uint256 amount,
        bool isBuy
    ) external onlyMM nonReentrant returns (uint256 executedAmount) {
        if (amount == 0) revert InvalidAmount();

        // Check balance
        address fromToken = isBuy ? usdc : token;
        uint256 availableBalance = ICLOBDex(clobDex).getBalance(address(this), fromToken);
        if (amount > availableBalance) revert InsufficientBalance();

        // Execute market order
        executedAmount = ICLOBDex(clobDex).placeMarketOrder(
            fromToken,
            isBuy ? token : usdc,
            amount,
            isBuy
        );

        // Create a record for tracking
        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            orderId: orderId,
            price: 0, // Market order
            amount: amount,
            isBuy: isBuy,
            isActive: false, // Already executed
            timestamp: block.timestamp
        });
        orderIds.push(orderId);

        emit OrderExecuted(orderId, executedAmount);
    }

    function cancelOrder(uint256 orderId) external onlyMM nonReentrant {
        Order storage order = orders[orderId];
        if (!order.isActive) revert InvalidOrder();

        // Cancel on CLOB DEX
        ICLOBDex(clobDex).cancelOrder(orderId);

        // Update local state
        order.isActive = false;

        emit OrderCancelled(orderId);
    }

    // Balance Management Functions
    function depositTokens(uint256 amount) external onlyMMOrPool nonReentrant {
        if (amount == 0) revert InvalidAmount();

        // Transfer tokens from sender to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Approve CLOB DEX to spend tokens
        IERC20(token).forceApprove(clobDex, amount);

        // Deposit to CLOB DEX
        ICLOBDex(clobDex).deposit(token, amount);

        emit TokensDeposited(token, amount);
    }

    function withdrawTokens(uint256 amount) external onlyMM nonReentrant {
        if (amount == 0) revert InvalidAmount();

        // Check CLOB balance
        uint256 clobBalance = ICLOBDex(clobDex).getBalance(address(this), token);
        if (amount > clobBalance) revert InsufficientBalance();

        // Withdraw from CLOB DEX
        ICLOBDex(clobDex).withdraw(token, amount);

        // Transfer to MM
        IERC20(token).safeTransfer(mm, amount);

        emit TokensWithdrawn(token, amount);
    }

    function withdrawProfits() external onlyMM nonReentrant returns (uint256 usdcAmount) {
        // Get USDC balance from CLOB
        usdcAmount = ICLOBDex(clobDex).getBalance(address(this), usdc);
        
        if (usdcAmount == 0) revert InsufficientBalance();

        // Withdraw all USDC from CLOB
        ICLOBDex(clobDex).withdraw(usdc, usdcAmount);

        // Transfer to MM
        IERC20(usdc).safeTransfer(mm, usdcAmount);

        emit ProfitWithdrawn(usdcAmount);
    }

    // Function to receive tokens directly from DirectPool
    function receiveTokens(uint256 amount) external {
        if (msg.sender != directPool) revert Unauthorized();
        // Tokens are already transferred, just need to deposit to CLOB
        
        // Approve CLOB DEX
        IERC20(token).forceApprove(clobDex, amount);
        
        // Deposit to CLOB DEX
        ICLOBDex(clobDex).deposit(token, amount);
        
        emit TokensDeposited(token, amount);
    }

    // View Functions
    function getBalance() external view returns (uint256 tokenBalance, uint256 usdcBalance) {
        // Local balances
        tokenBalance = IERC20(token).balanceOf(address(this));
        usdcBalance = IERC20(usdc).balanceOf(address(this));
    }

    function getCLOBBalance() external view returns (uint256 tokenBalance, uint256 usdcBalance) {
        // CLOB DEX balances
        tokenBalance = ICLOBDex(clobDex).getBalance(address(this), token);
        usdcBalance = ICLOBDex(clobDex).getBalance(address(this), usdc);
    }

    function getOrders() external view returns (Order[] memory) {
        Order[] memory activeOrders = new Order[](orderIds.length);
        uint256 count = 0;

        for (uint256 i = 0; i < orderIds.length; i++) {
            if (orders[orderIds[i]].isActive) {
                activeOrders[count] = orders[orderIds[i]];
                count++;
            }
        }

        // Resize array to actual count
        assembly {
            mstore(activeOrders, count)
        }

        return activeOrders;
    }

    function getActiveOrdersCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < orderIds.length; i++) {
            if (orders[orderIds[i]].isActive) {
                count++;
            }
        }
        return count;
    }
}