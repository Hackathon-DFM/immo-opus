// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/core/ProjectFactory.sol";
import "../src/core/DirectPool.sol";
import "../src/core/BondingCurve.sol";
import "../src/tokens/ERC20Token.sol";
import "../src/adapters/CLOBAdapter.sol";
import "../src/mocks/MockUSDC.sol";
import "../src/mocks/MockCLOBDex.sol";
import "../src/interfaces/IProjectFactory.sol";

contract BaseTest is Test {
    // Core contracts
    ProjectFactory public factory;
    DirectPool public directPoolTemplate;
    BondingCurve public bondingCurveTemplate;
    MockUSDC public usdc;
    MockCLOBDex public clobDex;
    
    // Test addresses
    address public projectOwner = address(0x1);
    address public marketMaker1 = address(0x2);
    address public marketMaker2 = address(0x3);
    address public user1 = address(0x4);
    address public user2 = address(0x5);
    
    // Test parameters
    uint256 public constant INITIAL_PRICE = 0.0001e6; // $0.0001 in USDC (6 decimals)
    uint256 public constant TARGET_MARKET_CAP = 10000000e6; // $10,000,000 in USDC
    uint256 public constant BORROW_TIME_LIMIT = 7 days;
    uint256 public constant TOKEN_SUPPLY = 1_000_000_000e18; // 1B tokens
    
    function setUp() public virtual {
        // Deploy mock USDC
        usdc = new MockUSDC();
        
        // Deploy mock CLOB DEX
        clobDex = new MockCLOBDex();
        
        // Deploy template contracts
        directPoolTemplate = new DirectPool();
        bondingCurveTemplate = new BondingCurve();
        
        // Deploy project factory
        factory = new ProjectFactory(address(usdc));
        
        // Set templates in factory
        factory.setTemplates(address(directPoolTemplate), address(bondingCurveTemplate));
        
        // Fund test accounts with USDC (increase amounts for higher target market cap)
        usdc.mint(projectOwner, 100_000_000e6); // $100M
        usdc.mint(marketMaker1, 100_000_000e6);
        usdc.mint(marketMaker2, 100_000_000e6);
        usdc.mint(user1, 20_000_000e6); // $20M
        usdc.mint(user2, 20_000_000e6);
        
        // Label addresses for better trace
        vm.label(address(factory), "ProjectFactory");
        vm.label(address(directPoolTemplate), "DirectPoolTemplate");
        vm.label(address(bondingCurveTemplate), "BondingCurveTemplate");
        vm.label(address(usdc), "USDC");
        vm.label(address(clobDex), "CLOBDex");
        vm.label(projectOwner, "ProjectOwner");
        vm.label(marketMaker1, "MarketMaker1");
        vm.label(marketMaker2, "MarketMaker2");
        vm.label(user1, "User1");
        vm.label(user2, "User2");
    }
    
    // Helper functions
    function createDirectPoolProject() public returns (address) {
        address project = factory.createProject(
            true, // isNewToken
            address(0), // existingToken
            "Test Token",
            "TEST",
            "Test token for Direct Pool",
            0, // tokenAmount (not used for new token)
            IProjectFactory.PoolMode.DIRECT_POOL,
            INITIAL_PRICE,
            0, // targetMarketCap (not used for Direct Pool)
            BORROW_TIME_LIMIT
        );
        return project;
    }
    
    function createBondingCurveProject() public returns (address) {
        address project = factory.createProject(
            true, // isNewToken
            address(0), // existingToken
            "Bonding Token",
            "BOND",
            "Test token for Bonding Curve",
            0, // tokenAmount (not used for new token)
            IProjectFactory.PoolMode.BONDING_CURVE,
            0, // initialPrice (calculated by bonding curve)
            TARGET_MARKET_CAP,
            BORROW_TIME_LIMIT
        );
        return project;
    }
    
    function approveUSDC(address spender, uint256 amount) public {
        usdc.approve(spender, amount);
    }
    
    function approveUSDCAs(address user, address spender, uint256 amount) public {
        vm.prank(user);
        usdc.approve(spender, amount);
    }
    
    function skipTime(uint256 time) public {
        vm.warp(block.timestamp + time);
    }
    
    function setCLOBConfig(DirectPool pool) internal {
        vm.prank(pool.projectOwner());
        pool.setCLOBConfig(address(clobDex), address(usdc));
    }
}