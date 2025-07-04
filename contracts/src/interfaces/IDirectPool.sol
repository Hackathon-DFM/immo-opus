// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDirectPool {
    // Events
    event MMRegistered(address indexed mm);
    event MMUnregistered(address indexed mm);
    event MMsFinalized();
    event TokensBorrowed(address indexed mm, uint256 amount);
    event TokensRepaid(address indexed mm, uint256 amount);
    event EmergencyWithdraw(address indexed mm, uint256 amount);

    // Errors
    error NotProjectOwner();
    error NotRegisteredMM();
    error AlreadyFinalized();
    error BorrowExceedsAllocation();
    error BorrowNotExpired();
    error AlreadyInitialized();
    error NotFinalized();
    error MMAlreadyRegistered();
    error MMNotRegistered();
    error NoMMsRegistered();
    error InsufficientBalance();
    error TransferFailed();

    // Initialization
    function initialize(
        address _projectOwner,
        address _token,
        uint256 _initialPrice,
        uint256 _borrowTimeLimit,
        uint256 _tokenAmount
    ) external;

    // MM Management (only PO)
    function registerMM(address mm) external;
    function unregisterMM(address mm) external;
    function finalizeMMs() external;
    function emergencyWithdraw(address mm) external;

    // MM Operations (only registered MMs)
    function borrowTokens(uint256 amount) external;
    function repayTokens(uint256 amount) external;

    // View Functions
    function getMaxBorrowAmount(address mm) external view returns (uint256);
    function getBorrowedAmount(address mm) external view returns (uint256);
    function getMMAllocation() external view returns (uint256);
    function getPoolInfo() external view returns (
        uint256 totalLiquidity,
        uint256 availableLiquidity,
        uint256 numberOfMMs,
        bool isFinalized,
        uint256[] memory borrowedAmounts
    );
}