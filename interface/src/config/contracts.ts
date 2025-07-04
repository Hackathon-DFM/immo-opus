// Contract addresses for different networks
export interface ContractAddresses {
  projectFactory: `0x${string}`;
  usdc: `0x${string}`;
  deployer?: `0x${string}`;
}

// Default addresses (will be overridden when deployed)
const DEFAULT_ADDRESSES: ContractAddresses = {
  projectFactory: '0x0000000000000000000000000000000000000000',
  usdc: '0x0000000000000000000000000000000000000000',
};

// Network-specific addresses
const ARBITRUM_SEPOLIA_ADDRESSES: ContractAddresses = DEFAULT_ADDRESSES;

// Load addresses from deployment file if available
let deployedAddresses: ContractAddresses = DEFAULT_ADDRESSES;
try {
  // This will be populated after deployment
  const deployment = require('./arbitrum-sepolia.json');
  deployedAddresses = {
    projectFactory: deployment.projectFactory,
    usdc: deployment.usdc,
    deployer: deployment.deployer,
  };
} catch (error) {
  console.log('No deployment file found, using mock mode or default addresses');
}

export const getContractAddresses = (chainId: number): ContractAddresses => {
  switch (chainId) {
    case 421614: // Arbitrum Sepolia
      return deployedAddresses.projectFactory !== DEFAULT_ADDRESSES.projectFactory 
        ? deployedAddresses 
        : ARBITRUM_SEPOLIA_ADDRESSES;
    default:
      return DEFAULT_ADDRESSES;
  }
};

// Environment-based configuration
export const isProduction = process.env.NODE_ENV === 'production';
export const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Export deployed addresses for direct access
export const CONTRACT_ADDRESSES = deployedAddresses;