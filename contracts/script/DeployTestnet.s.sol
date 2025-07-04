// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "lib/forge-std/src/Script.sol";
import {console} from "lib/forge-std/src/console.sol";
import {ERC20Token} from "../src/tokens/ERC20Token.sol";
import {ProjectFactory} from "../src/core/ProjectFactory.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract DeployTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Mock USDC for testnet
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // Deploy ProjectFactory
        ProjectFactory factory = new ProjectFactory(address(usdc));
        console.log("ProjectFactory deployed at:", address(factory));

        // Deploy a test token
        ERC20Token immoToken = new ERC20Token("IMMO Test Token", "IMMO");

        console.log("=== IMMO Testnet Deployment Complete ===");
        console.log("MockUSDC:", address(usdc));
        console.log("ProjectFactory:", address(factory));
        console.log("IMMO Test Token:", address(immoToken));
        console.log("Deployer Address:", msg.sender);
        console.log("Deployer IMMO Balance:", immoToken.balanceOf(msg.sender));
        console.log("Deployer USDC Balance:", usdc.balanceOf(msg.sender));
        console.log("Network: Arbitrum Sepolia");

        vm.stopBroadcast();
    }
}