// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../BaseTest.sol";
import "../../src/interfaces/IProjectFactory.sol";

contract ProjectFactoryTest is BaseTest {
    
    function test_CreateDirectPoolWithNewToken() public {
        vm.startPrank(projectOwner);
        
        address project = factory.createProject(
            true, // isNewToken
            address(0),
            "Test Token",
            "TEST",
            "Test description",
            0,
            IProjectFactory.PoolMode.DIRECT_POOL,
            INITIAL_PRICE,
            0,
            BORROW_TIME_LIMIT
        );
        
        vm.stopPrank();
        
        // Verify project was created
        assertTrue(project != address(0));
        
        // Verify project is in factory records
        address[] memory projects = factory.getAllProjects();
        assertEq(projects.length, 1);
        assertEq(projects[0], project);
        
        // Verify project by owner
        address[] memory ownerProjects = factory.getProjectsByOwner(projectOwner);
        assertEq(ownerProjects.length, 1);
        assertEq(ownerProjects[0], project);
    }
    
    function test_CreateBondingCurveWithNewToken() public {
        vm.startPrank(projectOwner);
        
        address project = factory.createProject(
            true, // isNewToken
            address(0),
            "Bonding Token",
            "BOND",
            "Bonding curve test",
            0,
            IProjectFactory.PoolMode.BONDING_CURVE,
            0, // initialPrice not used for bonding curve
            TARGET_MARKET_CAP,
            BORROW_TIME_LIMIT
        );
        
        vm.stopPrank();
        
        // Verify project was created
        assertTrue(project != address(0));
        
        // Verify it's a bonding curve
        BondingCurve bc = BondingCurve(project);
        assertEq(bc.targetMarketCap(), TARGET_MARKET_CAP);
    }
    
    function test_CreateDirectPoolWithExistingToken() public {
        // First deploy a token
        ERC20Token existingToken = new ERC20Token("Existing", "EXIST");
        uint256 depositAmount = 100_000e18;
        
        vm.startPrank(address(this));
        existingToken.approve(address(factory), depositAmount);
        
        address project = factory.createProject(
            false, // isNewToken
            address(existingToken),
            "Existing Token", // name 
            "EXIST", // symbol
            "Project using existing token", // description
            depositAmount,
            IProjectFactory.PoolMode.DIRECT_POOL,
            INITIAL_PRICE,
            0,
            BORROW_TIME_LIMIT
        );
        
        vm.stopPrank();
        
        // Verify token was transferred
        DirectPool pool = DirectPool(project);
        assertEq(existingToken.balanceOf(project), depositAmount);
        assertEq(pool.token(), address(existingToken));
    }
    
    function test_RevertWhen_CreateWithInvalidInitialPrice() public {
        vm.prank(projectOwner);
        
        // Price too low (< 0.1x of default)
        vm.expectRevert();
        factory.createProject(
            true,
            address(0),
            "Test",
            "TEST",
            "Test",
            0,
            IProjectFactory.PoolMode.DIRECT_POOL,
            0.000009e6, // $0.000009 < $0.00001
            0,
            BORROW_TIME_LIMIT
        );
    }
    
    function test_RevertWhen_CreateWithInvalidBorrowTime() public {
        vm.prank(projectOwner);
        
        // Time too short (< 1 day)
        vm.expectRevert();
        factory.createProject(
            true,
            address(0),
            "Test",
            "TEST", 
            "Test",
            0,
            IProjectFactory.PoolMode.DIRECT_POOL,
            INITIAL_PRICE,
            0,
            12 hours
        );
    }
    
    function test_RevertWhen_CreateBondingCurveWithZeroTargetMarketCap() public {
        vm.prank(projectOwner);
        
        vm.expectRevert();
        factory.createProject(
            true,
            address(0),
            "Test",
            "TEST",
            "Test",
            0,
            IProjectFactory.PoolMode.BONDING_CURVE,
            0,
            0, // Invalid target market cap
            BORROW_TIME_LIMIT
        );
    }
    
    function test_MultipleProjectsByOwner() public {
        vm.startPrank(projectOwner);
        
        // Create 3 projects directly (without additional pranks)
        address project1 = factory.createProject(
            true, address(0), "Test1", "T1", "Test1", 0,
            IProjectFactory.PoolMode.DIRECT_POOL, INITIAL_PRICE, 0, BORROW_TIME_LIMIT
        );
        address project2 = factory.createProject(
            true, address(0), "Test2", "T2", "Test2", 0,
            IProjectFactory.PoolMode.BONDING_CURVE, 0, TARGET_MARKET_CAP, BORROW_TIME_LIMIT
        );
        address project3 = factory.createProject(
            true, address(0), "Test3", "T3", "Test3", 0,
            IProjectFactory.PoolMode.DIRECT_POOL, INITIAL_PRICE, 0, BORROW_TIME_LIMIT
        );
        
        vm.stopPrank();
        
        // Verify all projects recorded
        address[] memory projects = factory.getAllProjects();
        assertEq(projects.length, 3);
        
        // Verify owner's projects
        address[] memory ownerProjects = factory.getProjectsByOwner(projectOwner);
        assertEq(ownerProjects.length, 3);
        assertEq(ownerProjects[0], project1);
        assertEq(ownerProjects[1], project2);
        assertEq(ownerProjects[2], project3);
    }
    
    function test_EventEmission() public {
        vm.startPrank(projectOwner);
        
        // We'll check event emission by checking if event was emitted with correct parameters
        vm.recordLogs();
        
        address project = factory.createProject(
            true,
            address(0),
            "Test",
            "TEST",
            "Test",
            0,
            IProjectFactory.PoolMode.DIRECT_POOL,
            INITIAL_PRICE,
            0,
            BORROW_TIME_LIMIT
        );
        
        // Check that an event was emitted
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertGt(logs.length, 0, "No events emitted");
        
        vm.stopPrank();
    }
    
    function test_GetProjectMode() public {
        vm.startPrank(projectOwner);
        
        // Create Direct Pool project
        address directProject = factory.createProject(
            true, address(0), "Direct", "DIR", "Direct Pool", 0,
            IProjectFactory.PoolMode.DIRECT_POOL, INITIAL_PRICE, 0, BORROW_TIME_LIMIT
        );
        
        // Create Bonding Curve project
        address bondingProject = factory.createProject(
            true, address(0), "Bonding", "BOND", "Bonding Curve", 0,
            IProjectFactory.PoolMode.BONDING_CURVE, 0, TARGET_MARKET_CAP, BORROW_TIME_LIMIT
        );
        
        vm.stopPrank();
        
        // Verify modes are stored correctly
        assertEq(uint256(factory.getProjectMode(directProject)), uint256(IProjectFactory.PoolMode.DIRECT_POOL));
        assertEq(uint256(factory.getProjectMode(bondingProject)), uint256(IProjectFactory.PoolMode.BONDING_CURVE));
        
        // Verify mode for non-existent project returns 0 (DIRECT_POOL)
        assertEq(uint256(factory.getProjectMode(address(0x1234))), 0);
    }
}