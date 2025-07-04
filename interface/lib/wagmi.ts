import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'IMMO - Initial Market Making Offering',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [arbitrumSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

// Export chains for use in other parts of the app
export const chains = [arbitrumSepolia];
export const defaultChain = arbitrumSepolia;