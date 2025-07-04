// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../BaseTest.sol";
import "../../src/interfaces/IDirectPool.sol";
import "../../src/interfaces/IBondingCurve.sol";

contract EdgeCasesTest is BaseTest {
    
    function test_BondingCurve_GraduationAtExactTarget() public {
        vm.startPrank(projectOwner);
        address projectAddress = createBondingCurveProject();
        BondingCurve curve = BondingCurve(projectAddress);
        vm.stopPrank();
        
        // Buy exactly enough to reach target
        uint256 currentMarketCap = curve.getCurrentMarketCap();
        uint256 needed = TARGET_MARKET_CAP - currentMarketCap;
        
        // Calculate buy amount needed (approximate)
        uint256 buyAmount = (needed * curve.virtualUSDCReserve()) / currentMarketCap;
        
        vm.startPrank(user1);
        usdc.approve(address(curve), buyAmount * 2); // Extra for safety
        
        // Buy in small increments to get close to target
        while (curve.getCurrentMarketCap() < TARGET_MARKET_CAP && !curve.canGraduate()) {
            curve.buy(10e6); // $10 increments
        }
        vm.stopPrank();
        
        // Should be able to graduate
        assertTrue(curve.canGraduate());
        curve.graduate();
        assertTrue(curve.graduated());
    }
    
    function test_DirectPool_AllMMsMaxBorrow() public {
        vm.startPrank(projectOwner);
        address projectAddress = createDirectPoolProject();
        DirectPool pool = DirectPool(projectAddress);
        ERC20Token token = ERC20Token(pool.token());
        
        // Register 5 MMs
        address[] memory mms = new address[](5);
        for (uint i = 0; i < 5; i++) {
            mms[i] = address(uint160(0x100 + i));
            pool.registerMM(mms[i]);
        }
        pool.finalizeMMs();
        vm.stopPrank();
        
        uint256 allocation = pool.getMMAllocation();
        
        // All MMs borrow max allocation
        for (uint i = 0; i < 5; i++) {
            vm.prank(mms[i]);
            pool.borrowTokens(allocation);
        }
        
        // Pool should be empty
        assertEq(token.balanceOf(address(pool)), 0);
        
        // No MM can borrow more
        vm.prank(mms[0]);
        vm.expectRevert(IDirectPool.BorrowExceedsAllocation.selector);
        pool.borrowTokens(1);
    }
    
    function test_DirectPool_SingleMM() public {
        vm.startPrank(projectOwner);
        address projectAddress = createDirectPoolProject();
        DirectPool pool = DirectPool(projectAddress);
        
        // Register only 1 MM
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        // MM should get entire allocation
        uint256 allocation = pool.getMMAllocation();
        assertEq(allocation, TOKEN_SUPPLY);
        
        // MM can borrow everything
        vm.prank(marketMaker1);
        pool.borrowTokens(TOKEN_SUPPLY);
        
        assertEq(pool.borrowedAmount(marketMaker1), TOKEN_SUPPLY);
    }
    
    function test_BondingCurve_MinimumBuyAmount() public {
        vm.startPrank(projectOwner);
        address projectAddress = createBondingCurveProject();
        BondingCurve curve = BondingCurve(projectAddress);
        vm.stopPrank();
        
        // Try very small buy
        uint256 tinyAmount = 1; // 1 USDC unit (0.000001 USDC)
        
        vm.startPrank(user1);
        usdc.approve(address(curve), tinyAmount);
        
        uint256 tokensReceived = curve.buy(tinyAmount);
        vm.stopPrank();
        
        // Should receive some tokens even for tiny amount
        assertGt(tokensReceived, 0);
    }
    
    function test_EmergencyWithdraw_MultipleExpiredMMs() public {
        vm.startPrank(projectOwner);
        address projectAddress = createDirectPoolProject();
        DirectPool pool = DirectPool(projectAddress);
        
        pool.registerMM(marketMaker1);
        pool.registerMM(marketMaker2);
        pool.registerMM(user1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        // All MMs borrow
        uint256 borrowAmount = 50_000e18;
        
        vm.prank(marketMaker1);
        pool.borrowTokens(borrowAmount);
        
        vm.prank(marketMaker2);
        pool.borrowTokens(borrowAmount * 2);
        
        vm.prank(user1);
        pool.borrowTokens(borrowAmount / 2);
        
        // Skip time past limit
        skipTime(BORROW_TIME_LIMIT + 1);
        
        // PO can emergency withdraw from all
        vm.startPrank(projectOwner);
        pool.emergencyWithdraw(marketMaker1);
        pool.emergencyWithdraw(marketMaker2);
        pool.emergencyWithdraw(user1);
        vm.stopPrank();
        
        // Verify all borrows cleared
        assertEq(pool.borrowedAmount(marketMaker1), 0);
        assertEq(pool.borrowedAmount(marketMaker2), 0);
        assertEq(pool.borrowedAmount(user1), 0);
    }
    
    function test_RepayMoreThanBorrowed() public {
        vm.startPrank(projectOwner);
        address projectAddress = createDirectPoolProject();
        DirectPool pool = DirectPool(projectAddress);
        ERC20Token token = ERC20Token(pool.token());
        
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        // MM borrows
        uint256 borrowAmount = 10_000e18;
        vm.prank(marketMaker1);
        pool.borrowTokens(borrowAmount);
        
        // Get extra tokens
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        vm.prank(adapter);
        token.transfer(marketMaker1, borrowAmount * 2);
        
        // Try to repay more than borrowed
        vm.startPrank(marketMaker1);
        token.approve(address(pool), borrowAmount * 2);
        
        // Should only repay exact borrowed amount
        pool.repayTokens(borrowAmount * 2);
        vm.stopPrank();
        
        // Borrowed amount should be 0
        assertEq(pool.borrowedAmount(marketMaker1), 0);
        
        // MM should keep excess
        assertGt(token.balanceOf(marketMaker1), borrowAmount);
    }
    
    function test_RaceCondition_GraduationWhileBuying() public {
        vm.startPrank(projectOwner);
        address projectAddress = createBondingCurveProject();
        BondingCurve curve = BondingCurve(projectAddress);
        vm.stopPrank();
        
        // User1 buys close to graduation
        vm.startPrank(user1);
        usdc.approve(address(curve), 9_000e6);
        curve.buy(9_000e6);
        vm.stopPrank();
        
        // User2 prepares to buy
        vm.startPrank(user2);
        usdc.approve(address(curve), 2_000e6);
        
        // User1 graduates in between
        vm.stopPrank();
        curve.graduate();
        
        // User2's buy should fail
        vm.startPrank(user2);
        vm.expectRevert(IBondingCurve.AlreadyGraduated.selector);
        curve.buy(2_000e6);
        vm.stopPrank();
    }
    
    function test_ZeroAllocation_NoMMs() public {
        vm.startPrank(projectOwner);
        address projectAddress = createDirectPoolProject();
        DirectPool pool = DirectPool(projectAddress);
        
        // Finalize without registering any MMs
        pool.finalizeMMs();
        vm.stopPrank();
        
        // Allocation should be 0
        assertEq(pool.getMMAllocation(), 0);
        
        // PO can still withdraw tokens
        vm.prank(projectOwner);
        pool.emergencyWithdraw(address(0)); // No specific MM
    }
}