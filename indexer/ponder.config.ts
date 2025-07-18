import { createConfig } from 'ponder';

import {
  ProjectFactoryABI,
  DirectPoolABI,
  BondingCurveABI,
} from './abis/index.js';

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
      address: '0x234cb50e97ceada09a8df492160d8202dedc9a4c',
      startBlock: 173367709,
    },
    DirectPoolTemplate: {
      chain: 'arbitrumSepolia',
      abi: DirectPoolABI,
      address: '0x191f2e3425c2c3ab0a93d6fbfd0ea2408551c8f4',
      startBlock: 170213364,
    },
    BondingCurveTemplate: {
      chain: 'arbitrumSepolia',
      abi: BondingCurveABI,
      address: '0xd92e69d56c839d50ebc3e1424b12f514e7fea168',
      startBlock: 170213378,
    },
  },
});
