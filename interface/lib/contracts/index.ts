// Auto-generated contract types
export { default as ProjectFactoryABI } from './ProjectFactory.json';
export { default as DirectPoolABI } from './DirectPool.json';
export { default as BondingCurveABI } from './BondingCurve.json';
export { default as ERC20TokenABI } from './ERC20Token.json';
export { default as CLOBAdapterABI } from './CLOBAdapter.json';
export { default as MockUSDCABI } from './MockUSDC.json';

export const contractAddresses = {
  ProjectFactory: process.env.NEXT_PUBLIC_PROJECT_FACTORY_ADDRESS || '',
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
} as const;
