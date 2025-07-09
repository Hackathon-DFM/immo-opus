import { onchainTable, relations } from "ponder";

export const projectOwner = onchainTable("projectOwner", (t) => ({
  id: t.hex().primaryKey(), // Same as address for projectOwner
  address: t.hex().notNull(), // PO address
  projectCount: t.integer().notNull(),
  createdAt: t.integer().notNull(),
  lastUpdated: t.integer().notNull(),
}));

export const token = onchainTable("token", (t) => ({
  id: t.hex().primaryKey(), // Same as address for token
  address: t.hex().notNull(), // Token address
  name: t.text().notNull(),
  symbol: t.text().notNull(),
  decimals: t.integer().notNull(),
  totalSupply: t.bigint().notNull(),
  isNewlyCreated: t.boolean().notNull(), // true for newly created, false for existing
  createdAt: t.integer().notNull(),
}));

export const project = onchainTable("project", (t) => ({
  id: t.hex().primaryKey(), // Same as address for project
  address: t.hex().notNull(), // Project address (DirectPool or BondingCurve)
  owner: t.hex().notNull(),
  mode: t.text().notNull(), // "DIRECT_POOL" or "BONDING_CURVE"
  tokenAddress: t.hex().notNull(),
  borrowTimeLimit: t.integer().notNull(),
  createdAt: t.integer().notNull(),
  createdBlock: t.bigint().notNull(),
  createdTxHash: t.hex().notNull(),
  lastUpdated: t.integer().notNull(),
  
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

export const registeredMM = onchainTable("registeredMM", (t) => ({
  id: t.text().primaryKey(), // `${projectAddress}-${mmAddress}`
  projectAddress: t.hex().notNull(),
  mmAddress: t.hex().notNull(),
  registeredAt: t.integer().notNull(),
  isActive: t.boolean().notNull(),
  lastUpdated: t.integer().notNull(),
}));

export const borrow = onchainTable("borrow", (t) => ({
  id: t.text().primaryKey(), // `${projectAddress}-${mmAddress}-${timestamp}`
  projectAddress: t.hex().notNull(),
  mmAddress: t.hex().notNull(),
  borrowedAmount: t.bigint().notNull(),
  borrowTimestamp: t.integer().notNull(),
  borrowTimeLimit: t.integer().notNull(),
  repaidAmount: t.bigint(),
  repaidAt: t.integer(),
  isRepaid: t.boolean().notNull(),
  txHash: t.hex().notNull(),
}));

export const supportedClob = onchainTable("supportedClob", (t) => ({
  id: t.text().primaryKey(), // `${projectAddress}-${clobAddress}`
  projectAddress: t.hex().notNull(),
  clobAddress: t.hex().notNull(),
  addedAt: t.integer().notNull(),
  isActive: t.boolean().notNull(),
}));

export const clob = onchainTable("clob", (t) => ({
  id: t.hex().primaryKey(), // Same as address for CLOB
  address: t.hex().notNull(), // CLOB exchange address
  name: t.text().notNull(),
  isActive: t.boolean().notNull(),
  addedAt: t.integer().notNull(),
}));

export const tradingActivity = onchainTable("tradingActivity", (t) => ({
  id: t.text().primaryKey(), // `${projectAddress}-${txHash}-${logIndex}`
  projectAddress: t.hex().notNull(),
  trader: t.hex().notNull(),
  type: t.text().notNull(), // "BUY" or "SELL"
  tokenAmount: t.bigint().notNull(),
  usdcAmount: t.bigint().notNull(),
  price: t.bigint().notNull(), // Price at time of trade
  timestamp: t.integer().notNull(),
  txHash: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
}));

// Define relations
export const projectOwnerRelations = relations(projectOwner, ({ many }) => ({
  projects: many(project),
}));

export const tokenRelations = relations(token, ({ many }) => ({
  projects: many(project), // N:1 from project to token (multiple projects can use same token)
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  owner: one(projectOwner, {
    fields: [project.owner],
    references: [projectOwner.id],
  }),
  token: one(token, {
    fields: [project.tokenAddress],
    references: [token.id],
  }),
  registeredMMs: many(registeredMM),
  borrows: many(borrow),
  supportedClobs: many(supportedClob),
  tradingActivities: many(tradingActivity),
}));

export const registeredMMRelations = relations(registeredMM, ({ one, many }) => ({
  project: one(project, {
    fields: [registeredMM.projectAddress],
    references: [project.id],
  }),
  borrows: many(borrow),
}));

export const borrowRelations = relations(borrow, ({ one }) => ({
  project: one(project, {
    fields: [borrow.projectAddress],
    references: [project.id],
  }),
  registeredMM: one(registeredMM, {
    fields: [borrow.projectAddress, borrow.mmAddress],
    references: [registeredMM.projectAddress, registeredMM.mmAddress],
  }),
}));

export const supportedClobRelations = relations(supportedClob, ({ one }) => ({
  project: one(project, {
    fields: [supportedClob.projectAddress],
    references: [project.id],
  }),
  clob: one(clob, {
    fields: [supportedClob.clobAddress],
    references: [clob.id],
  }),
}));

export const clobRelations = relations(clob, ({ many }) => ({
  supportedProjects: many(supportedClob),
}));

export const tradingActivityRelations = relations(tradingActivity, ({ one }) => ({
  project: one(project, {
    fields: [tradingActivity.projectAddress],
    references: [project.id],
  }),
}));
