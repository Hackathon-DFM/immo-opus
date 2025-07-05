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
      address: "0x01ebD170A7D3eCb6d105Cea1f37f34F89BE4dc97",
      startBlock: 170213392, 
    },
    DirectPoolTemplate: {
      chain: "arbitrumSepolia", 
      abi: DirectPoolABI,
      address: "0x41DBC5C299A9C31F0A0A32aaE8B7c4dd76bB5014",
      startBlock: 170213364,
    },
    BondingCurveTemplate: {
      chain: "arbitrumSepolia",
      abi: BondingCurveABI, 
      address: "0x4FcFc18A2215cEBDfBd1AC30A1576E267237983B",
      startBlock: 170213378,
    },
  },
});
