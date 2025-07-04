// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../BaseTest.sol";

contract DirectPoolTest is BaseTest {
    DirectPool public pool;
    ERC20Token public token;
    
    function setUp() public override {
        super.setUp();
        
        // Create a direct pool project with proper caller
        vm.prank(projectOwner);
        address projectAddress = createDirectPoolProject();
        pool = DirectPool(projectAddress);
        token = ERC20Token(pool.token());
    }
    
    function test_InitialState() public {
        assertEq(pool.projectOwner(), projectOwner);
        assertEq(pool.initialPrice(), INITIAL_PRICE);
        assertEq(pool.borrowTimeLimit(), BORROW_TIME_LIMIT);
        assertFalse(pool.isFinalized());
        assertEq(token.balanceOf(address(pool)), TOKEN_SUPPLY);
    }
    
    function test_RegisterMM() public {
        vm.startPrank(projectOwner);
        
        pool.registerMM(marketMaker1);
        assertTrue(pool.registeredMMs(marketMaker1));
        
        pool.registerMM(marketMaker2);
        assertTrue(pool.registeredMMs(marketMaker2));
        
        vm.stopPrank();
    }
    
    function test_UnregisterMM() public {
        vm.startPrank(projectOwner);
        
        pool.registerMM(marketMaker1);
        assertTrue(pool.registeredMMs(marketMaker1));
        
        pool.unregisterMM(marketMaker1);
        assertFalse(pool.registeredMMs(marketMaker1));
        
        vm.stopPrank();
    }
    
    function testFail_RegisterMMNotOwner() public {
        vm.prank(user1);
        pool.registerMM(marketMaker1);
    }
    
    function test_FinalizeMMs() public {
        vm.startPrank(projectOwner);
        
        pool.registerMM(marketMaker1);
        pool.registerMM(marketMaker2);
        
        pool.finalizeMMs();
        assertTrue(pool.isFinalized());
        
        vm.stopPrank();
    }
    
    function testFail_RegisterAfterFinalized() public {
        vm.startPrank(projectOwner);
        
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        
        // Should fail
        pool.registerMM(marketMaker2);
        
        vm.stopPrank();
    }
    
    function test_MMAllocation() public {
        vm.startPrank(projectOwner);
        
        pool.registerMM(marketMaker1);
        pool.registerMM(marketMaker2);
        pool.finalizeMMs();
        
        vm.stopPrank();
        
        // Each MM should get half of total supply
        uint256 expectedAllocation = TOKEN_SUPPLY / 2;
        assertEq(pool.getMMAllocation(), expectedAllocation);
    }
    
    function test_BorrowTokens() public {
        // Setup
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        uint256 borrowAmount = 1000e18;
        
        vm.startPrank(marketMaker1);
        pool.borrowTokens(borrowAmount);
        vm.stopPrank();
        
        // Verify borrowed amount recorded
        assertEq(pool.borrowedAmount(marketMaker1), borrowAmount);
        
        // Verify tokens transferred to CLOB adapter
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        assertEq(token.balanceOf(adapter), borrowAmount);
    }
    
    function test_MaxBorrowAmount() public {
        // Setup with 2 MMs
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.registerMM(marketMaker2);
        pool.finalizeMMs();
        vm.stopPrank();
        
        uint256 allocation = pool.getMMAllocation();
        uint256 partialBorrow = allocation / 2;
        
        // MM1 borrows partial allocation
        vm.prank(marketMaker1);
        pool.borrowTokens(partialBorrow);
        
        // Verify max borrow amount
        assertEq(pool.getMaxBorrowAmount(marketMaker1), allocation - partialBorrow);
    }
    
    function testFail_BorrowExceedsAllocation() public {
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        uint256 allocation = pool.getMMAllocation();
        
        vm.prank(marketMaker1);
        pool.borrowTokens(allocation + 1);
    }
    
    function test_RepayTokens() public {
        // Setup and borrow
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        uint256 borrowAmount = 1000e18;
        
        vm.prank(marketMaker1);
        pool.borrowTokens(borrowAmount);
        
        // Get tokens for repayment (simulate profit)
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        vm.prank(adapter);
        token.transfer(marketMaker1, borrowAmount);
        
        // Repay
        vm.startPrank(marketMaker1);
        token.approve(address(pool), borrowAmount);
        pool.repayTokens(borrowAmount);
        vm.stopPrank();
        
        // Verify repayment
        assertEq(pool.borrowedAmount(marketMaker1), 0);
        assertEq(token.balanceOf(address(pool)), TOKEN_SUPPLY);
    }
    
    function test_PartialRepay() public {
        // Setup and borrow
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        uint256 borrowAmount = 1000e18;
        uint256 repayAmount = 400e18;
        
        vm.prank(marketMaker1);
        pool.borrowTokens(borrowAmount);
        
        // Get tokens for repayment
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        vm.prank(adapter);
        token.transfer(marketMaker1, repayAmount);
        
        // Partial repay
        vm.startPrank(marketMaker1);
        token.approve(address(pool), repayAmount);
        pool.repayTokens(repayAmount);
        vm.stopPrank();
        
        // Verify partial repayment
        assertEq(pool.borrowedAmount(marketMaker1), borrowAmount - repayAmount);
    }
    
    function test_EmergencyWithdraw() public {
        // Setup and borrow
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        uint256 borrowAmount = 1000e18;
        
        vm.prank(marketMaker1);
        pool.borrowTokens(borrowAmount);
        
        // Skip past borrow time limit
        skipTime(BORROW_TIME_LIMIT + 1);
        
        // Emergency withdraw
        vm.prank(projectOwner);
        pool.emergencyWithdraw(marketMaker1);
        
        // Verify tokens returned to PO
        assertEq(token.balanceOf(projectOwner), TOKEN_SUPPLY - borrowAmount);
    }
    
    function testFail_EmergencyWithdrawBeforeExpiry() public {
        // Setup and borrow
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        vm.prank(marketMaker1);
        pool.borrowTokens(1000e18);
        
        // Try emergency withdraw before expiry
        vm.prank(projectOwner);
        pool.emergencyWithdraw(marketMaker1);
    }
    
    function test_CLOBAdapterCreation() public {
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        vm.prank(marketMaker1);
        pool.borrowTokens(1000e18);
        
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        assertTrue(adapter != address(0));
        
        // Verify adapter configuration
        CLOBAdapter clobAdapter = CLOBAdapter(adapter);
        assertEq(clobAdapter.mm(), marketMaker1);
        assertEq(clobAdapter.directPool(), address(pool));
        assertEq(clobAdapter.token(), address(token));
    }
}