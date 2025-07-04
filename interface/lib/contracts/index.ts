// Auto-generated contract types
export { default as ProjectFactoryABI } from './ProjectFactory.json';
export { default as DirectPoolABI } from './DirectPool.json';
export { default as BondingCurveABI } from './BondingCurve.json';
export { default as ERC20TokenABI } from './ERC20Token.json';
export { default as CLOBAdapterABI } from './CLOBAdapter.json';
export { default as MockUSDCABI } from './MockUSDC.json';

// Import contract addresses from config
import { getContractAddresses } from '@/src/config/contracts';

export const getContractAddressesForChain = (chainId: number) => {
  return getContractAddresses(chainId);
};
