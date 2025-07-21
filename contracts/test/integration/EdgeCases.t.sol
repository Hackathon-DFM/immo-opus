// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../BaseTest.sol";
import "../../src/interfaces/IDirectPool.sol";
import "../../src/interfaces/IBondingCurve.sol";
import "../../src/adapters/CLOBAdapter.sol";

contract EdgeCasesTest is BaseTest {
    
    function test_BondingCurve_GraduationAtExactTarget() public {
        vm.startPrank(projectOwner);
        address projectAddress = createBondingCurveProject();
        BondingCurve curve = BondingCurve(projectAddress);
        vm.stopPrank();
        
        // Buy in larger increments to avoid gas issues
        vm.startPrank(user1);
        usdc.approve(address(curve), 100_000_000e6); // Approve plenty
        
        // Keep buying until graduated
        while (!curve.graduated()) {
            // Use larger amounts initially, smaller near the end
            if (curve.getCurrentMarketCap() < TARGET_MARKET_CAP * 80 / 100) {
                curve.buy(1_000_000e6); // $1M chunks when far from target
            } else if (curve.getCurrentMarketCap() < TARGET_MARKET_CAP * 95 / 100) {
                curve.buy(100_000e6); // $100k chunks when closer
            } else {
                curve.buy(10_000e6); // $10k chunks when very close
            }
        }
        vm.stopPrank();
        
        // Verify graduation happened
        assertTrue(curve.graduated());
        assertTrue(curve.canGraduate());
        
        // Verify we're at or above target market cap
        assertGe(curve.getCurrentMarketCap(), TARGET_MARKET_CAP);
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
        
        // Set CLOB config before borrowing
        pool.setCLOBConfig(address(clobDex), address(usdc));
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
        
        // Set CLOB config before borrowing
        pool.setCLOBConfig(address(clobDex), address(usdc));
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
        
        // Set CLOB config before borrowing
        pool.setCLOBConfig(address(clobDex), address(usdc));
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
        
        // Set CLOB config before borrowing
        pool.setCLOBConfig(address(clobDex), address(usdc));
        vm.stopPrank();
        
        // MM borrows
        uint256 borrowAmount = 10_000e18;
        vm.prank(marketMaker1);
        pool.borrowTokens(borrowAmount);
        
        // Get CLOBAdapter address
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        
        // Withdraw from CLOB first
        vm.prank(marketMaker1);
        CLOBAdapter(adapter).withdrawTokens(borrowAmount);
        
        // MM now has tokens, give them extra tokens using deal
        deal(address(token), marketMaker1, borrowAmount * 3); // 3x the borrowed amount
        
        // Try to repay more than borrowed
        vm.startPrank(marketMaker1);
        token.approve(address(pool), borrowAmount * 2);
        
        // Should revert when trying to repay more than borrowed
        vm.expectRevert(IDirectPool.InsufficientBalance.selector);
        pool.repayTokens(borrowAmount * 2);
        
        // Now repay exact amount
        pool.repayTokens(borrowAmount);
        vm.stopPrank();
        
        // Borrowed amount should be 0
        assertEq(pool.borrowedAmount(marketMaker1), 0);
        
        // MM should keep excess tokens
        assertGt(token.balanceOf(marketMaker1), borrowAmount);
    }
    
    function test_ZeroAllocation_NoMMs() public {
        vm.startPrank(projectOwner);
        address projectAddress = createDirectPoolProject();
        DirectPool pool = DirectPool(projectAddress);
        
        // Should revert when trying to finalize without any MMs
        vm.expectRevert(); // Expecting NoMMsRegistered error
        pool.finalizeMMs();
        vm.stopPrank();
    }
}