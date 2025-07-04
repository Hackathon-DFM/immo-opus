// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "lib/forge-std/src/Script.sol";
import {console} from "lib/forge-std/src/console.sol";
import {ERC20Token} from "../src/tokens/ERC20Token.sol";

contract DeployTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ERC20Token immoToken = new ERC20Token("IMMO Test Token", "IMMO");

        console.log("=== IMMO Test Token Deployment ===");
        console.log("ERC20Token deployed at:", address(immoToken));
        console.log("Token Name:", immoToken.name());
        console.log("Token Symbol:", immoToken.symbol());
        console.log("Total Supply:", immoToken.totalSupply());
        console.log("Deployer Address:", msg.sender);
        console.log("Deployer Balance:", immoToken.balanceOf(msg.sender));
        console.log("Network: Arbitrum Sepolia");

        vm.stopBroadcast();
    }
}