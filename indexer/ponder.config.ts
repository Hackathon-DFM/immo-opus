import { createConfig } from "ponder";

import { ProjectFactoryABI, DirectPoolABI, BondingCurveABI } from "./abis/index.js";

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
      address: "0xD9948702FF4a56EfD553Dab9b266225Dc5FBc9C2",
      startBlock: 170171022, 
    },
    DirectPoolTemplate: {
      chain: "arbitrumSepolia", 
      abi: DirectPoolABI,
      address: "0x782b3ad3bAE6E12389cDa5C004C05967f2DEC55b",
      startBlock: 170170991,
    },
    BondingCurveTemplate: {
      chain: "arbitrumSepolia",
      abi: BondingCurveABI, 
      address: "0xA3976D0bDd4714f91027c2d589B7F9419373Be60",
      startBlock: 170171007,
    },
  },
});
