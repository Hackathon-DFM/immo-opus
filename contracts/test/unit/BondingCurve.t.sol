// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../BaseTest.sol";

contract BondingCurveTest is BaseTest {
    BondingCurve public curve;
    ERC20Token public token;
    address public directPoolAddress;
    
    function setUp() public override {
        super.setUp();
        
        // Create a bonding curve project with proper caller
        vm.prank(projectOwner);
        address projectAddress = createBondingCurveProject();
        curve = BondingCurve(projectAddress);
        token = ERC20Token(curve.token());
        directPoolAddress = curve.directPool();
    }
    
    function test_InitialState() public {
        assertEq(curve.projectOwner(), projectOwner);
        assertEq(curve.targetMarketCap(), TARGET_MARKET_CAP);
        assertFalse(curve.graduated());
        assertEq(token.balanceOf(address(curve)), TOKEN_SUPPLY);
        
        // Check initial reserves
        uint256 initialVirtualUsdc = curve.virtualUSDCReserve();
        assertGt(initialVirtualUsdc, 0);
        assertEq(curve.tokenReserve(), TOKEN_SUPPLY);
    }
    
    function test_Buy() public {
        uint256 buyAmount = 100e6; // $100 USDC
        
        // Approve USDC
        vm.startPrank(user1);
        usdc.approve(address(curve), buyAmount);
        
        // Calculate expected tokens
        uint256 expectedTokens = curve.calculateBuyReturn(buyAmount);
        
        // Buy tokens
        uint256 tokensReceived = curve.buy(buyAmount);
        vm.stopPrank();
        
        // Verify
        assertEq(tokensReceived, expectedTokens);
        assertEq(token.balanceOf(user1), tokensReceived);
        assertEq(usdc.balanceOf(address(curve)), buyAmount);
        
        // Verify reserves updated
        assertEq(curve.tokenReserve(), TOKEN_SUPPLY - tokensReceived);
        assertEq(curve.collectedUSDC(), buyAmount);
    }
    
    function test_BuyWithSlippage() public {
        uint256 buyAmount = 100e6; // $100 USDC
        uint256 minTokens = 1000e18; // Minimum expected tokens
        
        vm.startPrank(user1);
        usdc.approve(address(curve), buyAmount);
        
        uint256 tokensReceived = curve.buyWithSlippage(buyAmount, minTokens);
        vm.stopPrank();
        
        assertGe(tokensReceived, minTokens);
    }
    
    function test_RevertWhen_BuyWithExcessiveSlippage() public {
        uint256 buyAmount = 100e6;
        uint256 minTokens = 1_000_000e18; // Unrealistic expectation
        
        vm.startPrank(user1);
        usdc.approve(address(curve), buyAmount);
        vm.expectRevert();
        curve.buyWithSlippage(buyAmount, minTokens);
        vm.stopPrank();
    }
    
    function test_Sell() public {
        // First buy some tokens
        uint256 buyAmount = 100e6;
        vm.startPrank(user1);
        usdc.approve(address(curve), buyAmount);
        uint256 tokensBought = curve.buy(buyAmount);
        
        // Now sell half
        uint256 sellAmount = tokensBought / 2;
        token.approve(address(curve), sellAmount);
        
        uint256 usdcReceived = curve.sell(sellAmount);
        vm.stopPrank();
        
        // Verify
        assertGt(usdcReceived, 0);
        assertLt(usdcReceived, buyAmount); // Due to slippage
        assertEq(token.balanceOf(user1), tokensBought - sellAmount);
    }
    
    function test_PriceIncreasesWithBuys() public {
        uint256 initialPrice = curve.getCurrentPrice();
        
        // Buy tokens (larger amount to see price impact)
        vm.startPrank(user1);
        usdc.approve(address(curve), 1000e6);
        curve.buy(1000e6);
        vm.stopPrank();
        
        uint256 newPrice = curve.getCurrentPrice();
        
        assertGt(newPrice, initialPrice);
    }
    
    function test_PriceDecreasesWithSells() public {
        // First buy (larger amount)
        vm.startPrank(user1);
        usdc.approve(address(curve), 1000e6);
        uint256 tokensBought = curve.buy(1000e6);
        
        uint256 priceAfterBuy = curve.getCurrentPrice();
        
        // Then sell
        token.approve(address(curve), tokensBought);
        curve.sell(tokensBought);
        vm.stopPrank();
        
        uint256 priceAfterSell = curve.getCurrentPrice();
        
        assertLt(priceAfterSell, priceAfterBuy);
    }
    
    function test_MarketCapCalculation() public {
        uint256 initialMarketCap = curve.getCurrentMarketCap();
        
        // Buy tokens to increase market cap
        vm.startPrank(user1);
        usdc.approve(address(curve), 1000e6);
        curve.buy(1000e6);
        vm.stopPrank();
        
        uint256 newMarketCap = curve.getCurrentMarketCap();
        
        assertGt(newMarketCap, initialMarketCap);
    }
    
    function test_Graduation() public {
        // Buy enough to reach target market cap
        uint256 largeBuyAmount = 1_000_000e6; // $1M
        
        vm.startPrank(user1);
        usdc.approve(address(curve), largeBuyAmount);
        curve.buy(largeBuyAmount);
        vm.stopPrank();
        
        // Check if can graduate
        assertTrue(curve.canGraduate());
        
        // Graduate
        curve.graduate();
        
        // Verify graduation
        assertTrue(curve.graduated());
        
        // Verify tokens and USDC transferred to DirectPool
        DirectPool directPool = DirectPool(directPoolAddress);
        assertEq(token.balanceOf(directPoolAddress), curve.tokenReserve());
        assertEq(usdc.balanceOf(directPoolAddress), curve.collectedUSDC());
    }
    
    function test_RevertWhen_GraduateBeforeTarget() public {
        // Try to graduate without reaching target
        vm.expectRevert();
        curve.graduate();
    }
    
    function test_RevertWhen_BuyAfterGraduation() public {
        // Graduate first
        vm.startPrank(user1);
        usdc.approve(address(curve), 1_000_000e6);
        curve.buy(1_000_000e6);
        vm.stopPrank();
        
        curve.graduate();
        
        // Try to buy after graduation
        vm.startPrank(user2);
        usdc.approve(address(curve), 100e6);
        vm.expectRevert();
        curve.buy(100e6);
        vm.stopPrank();
    }
    
    function test_ConstantProductFormula() public {
        uint256 initialTokenReserve = curve.tokenReserve();
        uint256 initialVirtualUSDC = curve.virtualUSDCReserve();
        uint256 k = initialTokenReserve * initialVirtualUSDC;
        
        // Buy tokens
        vm.startPrank(user1);
        usdc.approve(address(curve), 100e6);
        curve.buy(100e6);
        vm.stopPrank();
        
        // Check k remains constant (tokenReserve * virtualUSDCReserve = k)
        uint256 newTokenReserve = curve.tokenReserve();
        uint256 newVirtualUSDC = curve.virtualUSDCReserve();
        uint256 newK = newTokenReserve * newVirtualUSDC;
        
        // Allow small rounding differences (within 0.01%)
        uint256 tolerance = k / 10000; // 0.01% tolerance
        assertTrue(newK >= k - tolerance && newK <= k + tolerance, "K not approximately constant");
    }
    
    function test_Fuzz_BuySell(uint256 buyAmount, uint256 sellRatio) public {
        buyAmount = bound(buyAmount, 1e6, 1000e6); // $1 to $1000
        sellRatio = bound(sellRatio, 1, 100); // Sell 1% to 100% of bought tokens
        
        vm.startPrank(user1);
        usdc.approve(address(curve), buyAmount);
        
        uint256 tokensBought = curve.buy(buyAmount);
        uint256 sellAmount = (tokensBought * sellRatio) / 100;
        
        token.approve(address(curve), sellAmount);
        uint256 usdcReceived = curve.sell(sellAmount);
        
        vm.stopPrank();
        
        // Basic sanity checks
        assertGt(tokensBought, 0);
        assertGt(usdcReceived, 0);
        assertLe(usdcReceived, buyAmount);
    }
}