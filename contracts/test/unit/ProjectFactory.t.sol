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
            "", // name not used
            "", // symbol not used  
            "", // description not used
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
    
    function testFail_CreateWithInvalidInitialPrice() public {
        vm.prank(projectOwner);
        
        // Price too low (< 0.1x of default)
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
    
    function testFail_CreateWithInvalidBorrowTime() public {
        vm.prank(projectOwner);
        
        // Time too short (< 1 day)
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
    
    function testFail_CreateBondingCurveWithZeroTargetMarketCap() public {
        vm.prank(projectOwner);
        
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
        
        // Create 3 projects
        address project1 = createDirectPoolProject();
        address project2 = createBondingCurveProject();
        address project3 = createDirectPoolProject();
        
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
        
        // Expect event
        vm.expectEmit(true, true, true, true);
        emit IProjectFactory.ProjectCreated(
            address(0), // We don't know the address yet
            projectOwner,
            IProjectFactory.PoolMode.DIRECT_POOL
        );
        
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
            BORROW_TIME_LIMIT
        );
        
        vm.stopPrank();
    }
}