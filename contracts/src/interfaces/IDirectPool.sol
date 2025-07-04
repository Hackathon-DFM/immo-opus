// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDirectPool {
    function initialize(
        address _projectOwner,
        address _token,
        uint256 _initialPrice,
        uint256 _borrowTimeLimit,
        uint256 _tokenAmount
    ) external;
}