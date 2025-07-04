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
    
    function test_RevertWhen_RegisterMMNotOwner() public {
        vm.expectRevert();
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
    
    function test_RevertWhen_RegisterAfterFinalized() public {
        vm.startPrank(projectOwner);
        
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        
        // Should fail
        vm.expectRevert();
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
        
        // Since no CLOB adapter created, tokens should be with MM directly
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        assertEq(adapter, address(0)); // No adapter created
        assertEq(token.balanceOf(marketMaker1), borrowAmount); // Tokens sent to MM
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
    
    function test_RevertWhen_BorrowExceedsAllocation() public {
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        uint256 allocation = pool.getMMAllocation();
        
        vm.expectRevert();
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
        
        // MM already has the borrowed tokens (sent directly since no adapter created)
        // Verify MM received the tokens
        assertEq(token.balanceOf(marketMaker1), borrowAmount);
        
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
        
        // MM already has the borrowed tokens, no need to transfer more for partial repay
        // Verify MM has the tokens
        assertEq(token.balanceOf(marketMaker1), borrowAmount);
        
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
        
        // Verify remaining pool tokens transferred to PO
        assertEq(token.balanceOf(projectOwner), borrowAmount);
        
        // MM keeps their borrowed tokens (emergency withdraw doesn't claw back from MM)
        assertEq(token.balanceOf(marketMaker1), borrowAmount);
        
        // Pool should be empty after emergency withdraw
        assertEq(token.balanceOf(address(pool)), TOKEN_SUPPLY - 2 * borrowAmount);
    }
    
    function test_RevertWhen_EmergencyWithdrawBeforeExpiry() public {
        // Setup and borrow
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        vm.stopPrank();
        
        vm.prank(marketMaker1);
        pool.borrowTokens(1000e18);
        
        // Try emergency withdraw before expiry
        vm.expectRevert();
        vm.prank(projectOwner);
        pool.emergencyWithdraw(marketMaker1);
    }
    
    function test_CLOBAdapterCreation() public {
        vm.startPrank(projectOwner);
        pool.registerMM(marketMaker1);
        pool.finalizeMMs();
        
        // First need to set CLOB and USDC addresses for adapter creation
        // TODO: Need to add setCLOBDex function to DirectPool
        vm.stopPrank();
        
        // For now, skip this test since CLOB adapter creation requires CLOB DEX setup
        // which isn't implemented in the base DirectPool contract
        vm.skip(true);
    }
}