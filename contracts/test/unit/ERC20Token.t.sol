// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../BaseTest.sol";

contract ERC20TokenTest is BaseTest {
    ERC20Token public token;
    
    function setUp() public override {
        super.setUp();
        token = new ERC20Token("Test Token", "TEST");
    }
    
    function test_TokenDeployment() public {
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), TOKEN_SUPPLY);
    }
    
    function test_InitialSupplyToDeployer() public {
        assertEq(token.balanceOf(address(this)), TOKEN_SUPPLY);
    }
    
    function test_Transfer() public {
        uint256 amount = 1000e18;
        
        assertTrue(token.transfer(user1, amount));
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(address(this)), TOKEN_SUPPLY - amount);
    }
    
    function test_TransferFrom() public {
        uint256 amount = 1000e18;
        
        // First approve
        token.approve(user1, amount);
        assertEq(token.allowance(address(this), user1), amount);
        
        // Then transfer from
        vm.prank(user1);
        assertTrue(token.transferFrom(address(this), user2, amount));
        
        assertEq(token.balanceOf(user2), amount);
        assertEq(token.balanceOf(address(this)), TOKEN_SUPPLY - amount);
        assertEq(token.allowance(address(this), user1), 0);
    }
    
    function test_RevertWhen_TransferInsufficientBalance() public {
        uint256 amount = TOKEN_SUPPLY + 1;
        vm.expectRevert();
        token.transfer(user1, amount);
    }
    
    function test_RevertWhen_TransferFromInsufficientAllowance() public {
        uint256 amount = 1000e18;
        token.approve(user1, amount - 1);
        
        vm.expectRevert();
        vm.prank(user1);
        token.transferFrom(address(this), user2, amount);
    }
    
    function test_ApproveAndAllowance() public {
        uint256 amount = 1000e18;
        
        assertTrue(token.approve(user1, amount));
        assertEq(token.allowance(address(this), user1), amount);
        
        // Update approval
        assertTrue(token.approve(user1, amount * 2));
        assertEq(token.allowance(address(this), user1), amount * 2);
    }
    
    function test_Fuzz_Transfer(address to, uint256 amount) public {
        vm.assume(to != address(0));
        vm.assume(amount <= TOKEN_SUPPLY);
        
        assertTrue(token.transfer(to, amount));
        assertEq(token.balanceOf(to), amount);
        assertEq(token.balanceOf(address(this)), TOKEN_SUPPLY - amount);
    }
}