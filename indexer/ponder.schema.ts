import { onchainTable } from "ponder";

export const project = onchainTable("project", (t) => ({
  address: t.hex().primaryKey(), // Project address
  owner: t.hex().notNull(),
  mode: t.text().notNull(), // "DIRECT_POOL" or "BONDING_CURVE"
  token: t.hex().notNull(),
  tokenName: t.text(),
  tokenSymbol: t.text(),
  tokenDecimals: t.integer(),
  borrowTimeLimit: t.integer().notNull(),
  createdAt: t.integer().notNull(),
  createdBlock: t.bigint().notNull(),
  createdTxHash: t.hex().notNull(),
  
  // DirectPool specific
  totalLiquidity: t.bigint(),
  availableLiquidity: t.bigint(),
  numberOfMMs: t.integer(),
  isFinalized: t.boolean(),
  initialPrice: t.bigint(),
  
  // BondingCurve specific  
  targetMarketCap: t.bigint(),
  currentMarketCap: t.bigint(),
  currentPrice: t.bigint(),
  graduated: t.boolean(),
  tokenReserve: t.bigint(),
  virtualUSDCReserve: t.bigint(),
}));

export const marketMaker = onchainTable("marketMaker", (t) => ({
  id: t.text().primaryKey(), // `${projectAddress}-${mmAddress}`
  projectAddress: t.hex().notNull(),
  address: t.hex().notNull(),
  borrowedAmount: t.bigint().notNull(),
  borrowTimestamp: t.integer().notNull(),
  borrowTimeLimit: t.integer().notNull(),
  isActive: t.boolean().notNull(),
  registeredAt: t.integer().notNull(),
  lastUpdated: t.integer().notNull(),
}));

export const projectOwner = onchainTable("projectOwner", (t) => ({
  address: t.hex().primaryKey(), // Owner address
  projectCount: t.integer().notNull(),
  createdAt: t.integer().notNull(),
  lastUpdated: t.integer().notNull(),
}));
