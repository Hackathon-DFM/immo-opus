// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IProjectFactory {
    enum PoolMode {
        DIRECT_POOL,
        BONDING_CURVE
    }

    event ProjectCreated(address indexed project, address indexed owner, address indexed token, PoolMode mode);
    event TemplatesSet(address indexed directPoolTemplate, address indexed bondingCurveTemplate);

    error InvalidTokenAmount();
    error InvalidInitialPrice();
    error InvalidTimeLimit();
    error InvalidTargetMarketCap();
    error ZeroAddress();
    error InvalidDescription();
    error TemplatesNotSet();
    error TemplatesAlreadySet();

    function createProject(
        bool isNewToken,
        address existingToken,
        string memory name,
        string memory symbol,
        string memory description,
        uint256 tokenAmount,
        PoolMode mode,
        uint256 initialPrice,
        uint256 targetMarketCap,
        uint256 borrowTimeLimit
    ) external returns (address projectAddress);

    function getProjectsByOwner(address owner) external view returns (address[] memory);
    function getAllProjects() external view returns (address[] memory);
    function getProjectCount() external view returns (uint256);
    function getProjectMode(address project) external view returns (PoolMode);
}