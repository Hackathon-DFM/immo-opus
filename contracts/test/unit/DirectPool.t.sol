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
        
        // Set CLOB configuration for the pool
        setCLOBConfig(pool);
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
        
        // Verify CLOBAdapter was created and tokens are in MockCLOBDex
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        assertTrue(adapter != address(0), "CLOBAdapter should be created");
        assertEq(token.balanceOf(marketMaker1), 0, "MM should have no tokens in wallet");
        assertEq(token.balanceOf(adapter), 0, "CLOBAdapter should have no tokens (deposited to CLOB)");
        
        // Check tokens are in MockCLOBDex
        assertEq(clobDex.balances(adapter, address(token)), borrowAmount, "Tokens should be in MockCLOBDex");
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
        
        // Get CLOBAdapter address
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        assertTrue(adapter != address(0), "CLOBAdapter should exist");
        
        // Verify tokens are in CLOB, not MM wallet
        assertEq(token.balanceOf(marketMaker1), 0, "MM should have no tokens in wallet");
        assertEq(clobDex.balances(adapter, address(token)), borrowAmount, "Tokens should be in CLOB");
        
        // Withdraw tokens from CLOB to MM wallet
        vm.prank(marketMaker1);
        CLOBAdapter(adapter).withdrawTokens(borrowAmount);
        
        // Now MM has tokens in wallet
        assertEq(token.balanceOf(marketMaker1), borrowAmount, "MM should have tokens after withdrawal");
        
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
        
        // Get CLOBAdapter address
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        
        // Verify tokens are in CLOB
        assertEq(token.balanceOf(marketMaker1), 0, "MM should have no tokens in wallet");
        assertEq(clobDex.balances(adapter, address(token)), borrowAmount, "Tokens should be in CLOB");
        
        // Withdraw only the amount needed for partial repay
        vm.prank(marketMaker1);
        CLOBAdapter(adapter).withdrawTokens(repayAmount);
        
        // Now MM has partial tokens in wallet
        assertEq(token.balanceOf(marketMaker1), repayAmount, "MM should have repay amount");
        
        // Partial repay
        vm.startPrank(marketMaker1);
        token.approve(address(pool), repayAmount);
        pool.repayTokens(repayAmount);
        vm.stopPrank();
        
        // Verify partial repayment
        assertEq(pool.borrowedAmount(marketMaker1), borrowAmount - repayAmount);
        // Verify remaining tokens still in CLOB
        assertEq(clobDex.balances(adapter, address(token)), borrowAmount - repayAmount, "Remaining tokens in CLOB");
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
        
        // Get CLOBAdapter address
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        
        // Verify tokens are in CLOB
        assertEq(clobDex.balances(adapter, address(token)), borrowAmount, "Tokens should be in CLOB");
        assertEq(token.balanceOf(marketMaker1), 0, "MM wallet should be empty");
        
        // Skip past borrow time limit
        skipTime(BORROW_TIME_LIMIT + 1);
        
        // Calculate remaining pool balance
        uint256 poolBalanceBefore = token.balanceOf(address(pool));
        uint256 projectOwnerBalanceBefore = token.balanceOf(projectOwner);
        
        // Emergency withdraw
        vm.prank(projectOwner);
        pool.emergencyWithdraw(marketMaker1);
        
        // Emergency withdraw transfers min(borrowed, poolBalance) to PO
        // In this case, it should transfer the borrowed amount since pool has enough
        uint256 expectedTransfer = borrowAmount < poolBalanceBefore ? borrowAmount : poolBalanceBefore;
        assertEq(token.balanceOf(projectOwner), projectOwnerBalanceBefore + expectedTransfer, "PO should receive borrowed amount");
        
        // Pool balance should be reduced by the transferred amount
        assertEq(token.balanceOf(address(pool)), poolBalanceBefore - expectedTransfer, "Pool balance should be reduced");
        
        // MM keeps their borrowed tokens (they're in CLOB, emergency withdraw doesn't claw back)
        assertEq(clobDex.balances(adapter, address(token)), borrowAmount, "Tokens should remain in CLOB");
        
        // Verify borrowed amount is reset
        assertEq(pool.borrowedAmount(marketMaker1), 0, "Borrowed amount should be reset");
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
        vm.stopPrank();
        
        // CLOB config is already set in setUp
        
        // Verify no adapter exists initially
        assertEq(pool.mmToCLOBAdapter(marketMaker1), address(0), "No adapter should exist initially");
        
        // Borrow triggers adapter creation
        vm.prank(marketMaker1);
        pool.borrowTokens(100e18);
        
        // Verify adapter was created
        address adapter = pool.mmToCLOBAdapter(marketMaker1);
        assertTrue(adapter != address(0), "CLOBAdapter should be created");
        
        // Verify adapter is properly configured
        CLOBAdapter clobAdapter = CLOBAdapter(adapter);
        assertEq(clobAdapter.mm(), marketMaker1, "MM address should match");
        assertEq(clobAdapter.directPool(), address(pool), "DirectPool address should match");
        assertEq(clobAdapter.token(), address(token), "Token address should match");
        assertEq(clobAdapter.clobDex(), address(clobDex), "CLOB DEX address should match");
        
        // Verify tokens went to CLOB
        assertEq(clobDex.balances(adapter, address(token)), 100e18, "Tokens should be in CLOB");
    }
}