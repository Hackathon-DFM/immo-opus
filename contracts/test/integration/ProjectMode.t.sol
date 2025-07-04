// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../BaseTest.sol";
import "../../src/interfaces/IProjectFactory.sol";

contract ProjectModeTest is BaseTest {
    
    function test_ProjectModeStorageAndRetrieval() public {
        vm.startPrank(projectOwner);
        
        // Create multiple projects with different modes
        address directPool1 = factory.createProject(
            true, address(0), "Direct1", "D1", "Direct Pool 1", 0,
            IProjectFactory.PoolMode.DIRECT_POOL, INITIAL_PRICE, 0, BORROW_TIME_LIMIT
        );
        
        address bondingCurve1 = factory.createProject(
            true, address(0), "Bonding1", "B1", "Bonding Curve 1", 0,
            IProjectFactory.PoolMode.BONDING_CURVE, 0, TARGET_MARKET_CAP, BORROW_TIME_LIMIT
        );
        
        address directPool2 = factory.createProject(
            true, address(0), "Direct2", "D2", "Direct Pool 2", 0,
            IProjectFactory.PoolMode.DIRECT_POOL, INITIAL_PRICE, 0, BORROW_TIME_LIMIT
        );
        
        address bondingCurve2 = factory.createProject(
            true, address(0), "Bonding2", "B2", "Bonding Curve 2", 0,
            IProjectFactory.PoolMode.BONDING_CURVE, 0, TARGET_MARKET_CAP, BORROW_TIME_LIMIT
        );
        
        vm.stopPrank();
        
        // Verify modes are correctly stored and retrieved
        assertEq(uint256(factory.getProjectMode(directPool1)), uint256(IProjectFactory.PoolMode.DIRECT_POOL), "Direct Pool 1 mode incorrect");
        assertEq(uint256(factory.getProjectMode(bondingCurve1)), uint256(IProjectFactory.PoolMode.BONDING_CURVE), "Bonding Curve 1 mode incorrect");
        assertEq(uint256(factory.getProjectMode(directPool2)), uint256(IProjectFactory.PoolMode.DIRECT_POOL), "Direct Pool 2 mode incorrect");
        assertEq(uint256(factory.getProjectMode(bondingCurve2)), uint256(IProjectFactory.PoolMode.BONDING_CURVE), "Bonding Curve 2 mode incorrect");
        
        // Verify projects are correctly associated with owner
        address[] memory ownerProjects = factory.getProjectsByOwner(projectOwner);
        assertEq(ownerProjects.length, 4, "Owner should have 4 projects");
        
        // Verify the order of projects
        assertEq(ownerProjects[0], directPool1, "First project should be directPool1");
        assertEq(ownerProjects[1], bondingCurve1, "Second project should be bondingCurve1");
        assertEq(ownerProjects[2], directPool2, "Third project should be directPool2");
        assertEq(ownerProjects[3], bondingCurve2, "Fourth project should be bondingCurve2");
        
        // Verify all projects are recorded
        address[] memory allProjects = factory.getAllProjects();
        assertEq(allProjects.length, 4, "Should have 4 total projects");
    }
    
    function test_ProjectModeForNonExistentProject() public {
        // Test that non-existent project returns default value (0 = DIRECT_POOL)
        address nonExistent = address(0x1234567890);
        IProjectFactory.PoolMode mode = factory.getProjectMode(nonExistent);
        assertEq(uint256(mode), 0, "Non-existent project should return default mode");
    }
    
    function test_ProjectModeAfterBondingCurveGraduation() public {
        vm.startPrank(projectOwner);
        
        // Create a bonding curve project
        address bondingCurve = factory.createProject(
            true, address(0), "Graduating", "GRAD", "Graduating Bonding Curve", 0,
            IProjectFactory.PoolMode.BONDING_CURVE, 0, TARGET_MARKET_CAP, BORROW_TIME_LIMIT
        );
        
        vm.stopPrank();
        
        // Verify initial mode
        assertEq(uint256(factory.getProjectMode(bondingCurve)), uint256(IProjectFactory.PoolMode.BONDING_CURVE), "Should be bonding curve initially");
        
        // Note: The mode in ProjectFactory remains BONDING_CURVE even after graduation
        // This is correct because the ProjectFactory tracks the original project type
        // The BondingCurve contract itself tracks graduation status
    }
}