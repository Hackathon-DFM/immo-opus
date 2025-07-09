import { GraphQLClient } from 'graphql-request';

// Default to local Ponder instance, can be overridden via environment variable
const PONDER_URL = process.env.NEXT_PUBLIC_PONDER_URL || 'http://localhost:42069';

export const graphqlClient = new GraphQLClient(PONDER_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type definitions for Ponder schema
export interface ProjectOwner {
  id: string;
  address: string;
  projectCount: number;
  projects: {
    items: Project[];
  };
}

// Token interface removed - token data is fetched directly from blockchain

export interface Project {
  id: string;
  address: string;
  tokenAddress: string;
  owner: string;
  mode: 'DIRECT_POOL' | 'BONDING_CURVE';
  initialPrice?: string;
  targetMarketCap?: string;
  borrowTimeLimit: number;
  createdBlock: string;
  createdAt: number;
  createdTxHash: string;
  totalLiquidity?: string;
  availableLiquidity?: string;
  numberOfMMs?: number;
  isFinalized?: boolean;
  graduated?: boolean;
  currentMarketCap?: string;
  currentPrice?: string;
  tokenReserve?: string;
  virtualUSDCReserve?: string;
  lastUpdated?: number;
  registeredMMs: {
    items: RegisteredMM[];
  };
  borrows?: {
    items: Borrow[];
  };
}

export interface RegisteredMM {
  id: string;
  projectAddress: string;
  mmAddress: string;
  registeredAt: number;
  isActive: boolean;
  lastUpdated: number;
}

export interface Borrow {
  id: string;
  projectId: string;
  mmAddress: string;
  clob: string;
  borrowedAmount: string;
  borrowedTimestamp: string;
  repaidAmount?: string;
  repaidTimestamp?: string;
  status: 'ACTIVE' | 'REPAID' | 'EMERGENCY_WITHDRAWN';
}