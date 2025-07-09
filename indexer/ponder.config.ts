import { createConfig, factory } from "ponder";
import { parseAbiItem } from "viem";

import { ProjectFactoryABI, DirectPoolABI, BondingCurveABI, ERC20TokenABI } from "./abis/index.js";

export default createConfig({
  chains: {
    arbitrumSepolia: {
      id: 421614,
      rpc: process.env.PONDER_RPC_URL_421614!,
    },
  },
  contracts: {
    ProjectFactory: {
      chain: "arbitrumSepolia",
      abi: ProjectFactoryABI,
      address: "0x01ebD170A7D3eCb6d105Cea1f37f34F89BE4dc97",
      startBlock: 170213392, 
    },
    DirectPool: {
      chain: "arbitrumSepolia", 
      abi: DirectPoolABI,
      address: factory({
        address: "0x01ebD170A7D3eCb6d105Cea1f37f34F89BE4dc97",
        event: parseAbiItem("event ProjectCreated(address project, address owner, address token, uint8 mode)"),
        parameter: "project",
      }),
      startBlock: 170213392, // Same as factory start block
    },
    BondingCurve: {
      chain: "arbitrumSepolia",
      abi: BondingCurveABI, 
      address: factory({
        address: "0x01ebD170A7D3eCb6d105Cea1f37f34F89BE4dc97",
        event: parseAbiItem("event ProjectCreated(address project, address owner, address token, uint8 mode)"),
        parameter: "project",
      }),
      startBlock: 170213392, // Same as factory start block
    },
  },
});
