// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IBondingCurve {
    function initialize(
        address _projectOwner,
        address _token,
        address _directPool,
        uint256 _targetMarketCap,
        uint256 _tokenAmount
    ) external;
}