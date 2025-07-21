
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
      chain: 'arbitrumSepolia',
      abi: ProjectFactoryABI,
      address: '0x403D2A5800C285f0dd047fD36e420E19B0439641',
      startBlock: 175946746,
    },

    DirectPool: {
      chain: "arbitrumSepolia", 
      abi: DirectPoolABI,
      address: factory({
        address: "0x403D2A5800C285f0dd047fD36e420E19B0439641",
        event: parseAbiItem("event ProjectCreated(address project, address owner, address token, uint8 mode)"),
        parameter: "project",
      }),
      startBlock: 175946746, // Same as factory start block
    },
    BondingCurve: {
      chain: "arbitrumSepolia",
      abi: BondingCurveABI, 
      address: factory({
        address: "0x403D2A5800C285f0dd047fD36e420E19B0439641",
        event: parseAbiItem("event ProjectCreated(address project, address owner, address token, uint8 mode)"),
        parameter: "project",
      }),
      startBlock: 175946746, // Same as factory start block

    },
  },
});
