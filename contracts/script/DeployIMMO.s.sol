// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "lib/forge-std/src/Script.sol";
import {console} from "lib/forge-std/src/console.sol";
import {ProjectFactory} from "../src/core/ProjectFactory.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract DeployIMMO is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // For testnet, we deploy MockUSDC
        // For mainnet, we'd use real USDC address
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // Deploy ProjectFactory
        ProjectFactory factory = new ProjectFactory(address(usdc));
        console.log("ProjectFactory deployed at:", address(factory));

        // Mint some USDC to deployer for testing
        usdc.mint(msg.sender, 1_000_000 * 10**6); // 1M USDC
        console.log("Minted 1,000,000 USDC to deployer:", msg.sender);

        vm.stopBroadcast();

        // Save deployment addresses to a file for frontend integration
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "projectFactory": "', vm.toString(address(factory)), '",\n',
            '  "usdc": "', vm.toString(address(usdc)), '",\n',
            '  "deployer": "', vm.toString(msg.sender), '",\n',
            '  "network": "arbitrum-sepolia",\n',
            '  "chainId": 421614\n',
            '}'
        ));
        
        vm.writeFile("./deployments/arbitrum-sepolia.json", json);
        console.log("Deployment info saved to ./deployments/arbitrum-sepolia.json");
    }
}