// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../BaseTest.sol";

contract HappyPathTest is BaseTest {
    
    function test_CompleteDirectPoolFlow() public {
        // 1. Project Owner creates Direct Pool project
        vm.startPrank(projectOwner);
        address projectAddress = createDirectPoolProject();
        DirectPool pool = DirectPool(projectAddress);
        ERC20Token token = ERC20Token(pool.token());
        vm.stopPrank();
        
        // 2. Project Owner registers Market Makers
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.registerMM(marketMaker2);
        
        // 3. Project Owner finalizes MMs
        pool.finalizeMMs();
        vm.stopPrank();
        
        // Verify state
        assertTrue(pool.isFinalized());
        uint256 allocation = pool.getMMAllocation();
        assertEq(allocation, TOKEN_SUPPLY / 2); // 2 MMs
        
        // 4. MM1 borrows tokens
        uint256 borrowAmount1 = 100_000e18;
        vm.prank(marketMaker1);
        pool.borrowTokens(borrowAmount1);
        
        // Verify MM1's CLOB adapter received tokens
        address adapter1 = pool.mmToCLOBAdapter(marketMaker1);
        assertEq(token.balanceOf(adapter1), borrowAmount1);
        
        // 5. MM2 borrows tokens
        uint256 borrowAmount2 = 200_000e18;
        vm.prank(marketMaker2);
        pool.borrowTokens(borrowAmount2);
        
        // 6. Simulate MM1 trading (profit scenario)
        vm.prank(adapter1);
        token.transfer(marketMaker1, borrowAmount1 + 10_000e18); // 10k profit
        
        // 7. MM1 repays with profit
        vm.startPrank(marketMaker1);
        token.approve(address(pool), borrowAmount1);
        pool.repayTokens(borrowAmount1);
        vm.stopPrank();
        
        // Verify MM1 keeps profit
        assertEq(token.balanceOf(marketMaker1), 10_000e18);
        assertEq(pool.borrowedAmount(marketMaker1), 0);
        
        // 8. Time passes, MM2 doesn't repay
        skipTime(BORROW_TIME_LIMIT + 1);
        
        // 9. Project Owner emergency withdraws from MM2
        vm.prank(projectOwner);
        pool.emergencyWithdraw(marketMaker2);
        
        // Verify PO recovered remaining tokens
        uint256 remainingInPool = token.balanceOf(address(pool));
        uint256 remainingWithPO = token.balanceOf(projectOwner);
        assertEq(remainingInPool + remainingWithPO, TOKEN_SUPPLY - borrowAmount2 - 10_000e18);
    }
    
    function test_CompleteBondingCurveToDirectPoolFlow() public {
        // 1. Project Owner creates Bonding Curve project
        vm.startPrank(projectOwner);
        address projectAddress = createBondingCurveProject();
        BondingCurve curve = BondingCurve(projectAddress);
        ERC20Token token = ERC20Token(curve.token());
        address directPoolAddress = curve.directPool();
        DirectPool pool = DirectPool(directPoolAddress);
        vm.stopPrank();
        
        // 2. Users buy tokens on bonding curve
        uint256 totalBuyAmount = 0;
        
        // User1 buys
        vm.startPrank(user1);
        approveUSDC(address(curve), 2000e6); // $2000
        uint256 user1Tokens = curve.buy(2000e6);
        totalBuyAmount += 2000e6;
        vm.stopPrank();
        
        // User2 buys
        vm.startPrank(user2);
        approveUSDC(address(curve), 3000e6); // $3000
        uint256 user2Tokens = curve.buy(3000e6);
        totalBuyAmount += 3000e6;
        vm.stopPrank();
        
        // Price should have increased
        uint256 currentPrice = curve.getCurrentPrice();
        assertGt(currentPrice, curve.virtualUSDCReserve() / TOKEN_SUPPLY);
        
        // 3. User1 sells some tokens back
        vm.startPrank(user1);
        uint256 sellAmount = user1Tokens / 2;
        token.approve(address(curve), sellAmount);
        uint256 usdcReceived = curve.sell(sellAmount);
        vm.stopPrank();
        
        // 4. More users buy until graduation
        vm.startPrank(user1);
        approveUSDC(address(curve), 10_000e6); // Large buy to trigger graduation
        curve.buy(10_000e6);
        vm.stopPrank();
        
        // 5. Graduate bonding curve
        assertTrue(curve.canGraduate());
        curve.graduate();
        assertTrue(curve.graduated());
        
        // Verify tokens and USDC moved to Direct Pool
        assertGt(token.balanceOf(directPoolAddress), 0);
        assertGt(usdc.balanceOf(directPoolAddress), 0);
        
        // 6. Project Owner registers MMs on Direct Pool
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        // 7. MM borrows from Direct Pool
        uint256 mmBorrowAmount = 50_000e18;
        vm.prank(marketMaker1);
        pool.borrowTokens(mmBorrowAmount);
        
        // Verify complete flow worked
        assertEq(pool.borrowedAmount(marketMaker1), mmBorrowAmount);
        assertTrue(curve.graduated());
    }
    
    function test_MultipleMMs_PartialRepayments() public {
        // Setup Direct Pool with 3 MMs
        vm.startPrank(projectOwner);
        address projectAddress = createDirectPoolProject();
        DirectPool pool = DirectPool(projectAddress);
        ERC20Token token = ERC20Token(pool.token());
        
        pool.registerMM(marketMaker1);
        pool.registerMM(marketMaker2);
        pool.registerMM(user1); // user1 acts as MM3
        pool.finalizeMMs();
        vm.stopPrank();
        
        uint256 allocation = pool.getMMAllocation();
        assertEq(allocation, TOKEN_SUPPLY / 3); // 3 MMs
        
        // Each MM borrows different amounts
        vm.prank(marketMaker1);
        pool.borrowTokens(allocation / 2); // 50% of allocation
        
        vm.prank(marketMaker2);
        pool.borrowTokens(allocation); // 100% of allocation
        
        vm.prank(user1);
        pool.borrowTokens(allocation / 4); // 25% of allocation
        
        // Simulate trading and partial repayments
        address adapter1 = pool.mmToCLOBAdapter(marketMaker1);
        address adapter2 = pool.mmToCLOBAdapter(marketMaker2);
        address adapter3 = pool.mmToCLOBAdapter(user1);
        
        // MM1 makes profit and repays in full
        vm.prank(adapter1);
        token.transfer(marketMaker1, pool.borrowedAmount(marketMaker1) + 5_000e18);
        
        vm.startPrank(marketMaker1);
        token.approve(address(pool), pool.borrowedAmount(marketMaker1));
        pool.repayTokens(pool.borrowedAmount(marketMaker1));
        vm.stopPrank();
        
        // MM2 loses money and can only repay 70%
        uint256 mm2Borrowed = pool.borrowedAmount(marketMaker2);
        uint256 mm2Repay = (mm2Borrowed * 70) / 100;
        
        vm.prank(adapter2);
        token.transfer(marketMaker2, mm2Repay);
        
        vm.startPrank(marketMaker2);
        token.approve(address(pool), mm2Repay);
        pool.repayTokens(mm2Repay);
        vm.stopPrank();
        
        // MM3 repays in multiple installments
        uint256 mm3Borrowed = pool.borrowedAmount(user1);
        
        // First repayment: 30%
        uint256 firstRepay = (mm3Borrowed * 30) / 100;
        vm.prank(adapter3);
        token.transfer(user1, firstRepay);
        
        vm.startPrank(user1);
        token.approve(address(pool), firstRepay);
        pool.repayTokens(firstRepay);
        vm.stopPrank();
        
        // Second repayment: 40%
        uint256 secondRepay = (mm3Borrowed * 40) / 100;
        vm.prank(adapter3);
        token.transfer(user1, secondRepay);
        
        vm.startPrank(user1);
        token.approve(address(pool), secondRepay);
        pool.repayTokens(secondRepay);
        vm.stopPrank();
        
        // Verify final states
        assertEq(pool.borrowedAmount(marketMaker1), 0);
        assertEq(pool.borrowedAmount(marketMaker2), mm2Borrowed - mm2Repay);
        assertEq(pool.borrowedAmount(user1), mm3Borrowed - firstRepay - secondRepay);
    }
    
    function test_CLOBAdapter_TradingSimulation() public {
        // Setup
        vm.startPrank(projectOwner);
        address projectAddress = createDirectPoolProject();
        DirectPool pool = DirectPool(projectAddress);
        ERC20Token token = ERC20Token(pool.token());
        
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        // MM borrows
        uint256 borrowAmount = 100_000e18;
        vm.prank(marketMaker1);
        pool.borrowTokens(borrowAmount);
        
        address adapterAddress = pool.mmToCLOBAdapter(marketMaker1);
        CLOBAdapter adapter = CLOBAdapter(adapterAddress);
        
        // Simulate CLOB trading
        vm.startPrank(marketMaker1);
        
        // Place limit orders
        uint256 orderId1 = adapter.placeLimitOrder(
            INITIAL_PRICE + 10, // Price slightly above initial
            10_000e18, // Amount
            false // Sell order
        );
        
        uint256 orderId2 = adapter.placeLimitOrder(
            INITIAL_PRICE - 10, // Price slightly below initial
            10_000e18, // Amount
            true // Buy order
        );
        
        // Cancel an order
        adapter.cancelOrder(orderId1);
        
        // Place market order
        adapter.placeMarketOrder(5_000e18, false); // Market sell
        
        vm.stopPrank();
        
        // Verify adapter has tokens
        assertEq(token.balanceOf(adapterAddress), borrowAmount);
    }
}