import { ponder } from "ponder:registry";
import { project, projectOwner, registeredMM, borrow, tradingActivity } from "ponder:schema";

// Handle ProjectCreated events from ProjectFactory
ponder.on("ProjectFactory:ProjectCreated", async ({ event, context }) => {
  const { project: projectAddress, owner, token: tokenAddress, mode } = event.args;
  const { block, transaction } = event;
  
  // Convert mode enum to string
  const modeString = mode === 0 ? "DIRECT_POOL" : "BONDING_CURVE";
  
  // Insert or update project owner
  await context.db
    .insert(projectOwner)
    .values({
      id: owner, // id is same as address
      address: owner,
      projectCount: 1,
      createdAt: Number(block.timestamp),
      lastUpdated: Number(block.timestamp),
    })
    .onConflictDoUpdate((row) => ({
      projectCount: row.projectCount + 1,
      lastUpdated: Number(block.timestamp),
    }));
  
  // Do NOT create token record - frontend will fetch all token data in real-time
  
  // Fetch pool-specific properties based on mode
  let projectData: any = {
    id: projectAddress,
    address: projectAddress,
    owner,
    mode: modeString,
    tokenAddress,
    createdAt: Number(block.timestamp),
    createdBlock: block.number,
    createdTxHash: transaction.hash,
    lastUpdated: Number(block.timestamp),
    // Default values for nullable fields
    borrowTimeLimit: 0,
    initialPrice: null,
    totalLiquidity: null,
    availableLiquidity: null,
    numberOfMMs: null,
    isFinalized: null,
    targetMarketCap: null,
    currentMarketCap: null,
    currentPrice: null,
    graduated: null,
    tokenReserve: null,
    virtualUSDCReserve: null,
  };

  // Mode-specific default values - frontend will fetch actual values
  if (mode === 0) { // DIRECT_POOL
    projectData.borrowTimeLimit = 86400; // Default 1 day, frontend will fetch actual
    projectData.initialPrice = 0n; // Frontend will fetch
    projectData.totalLiquidity = 0n; // Frontend will fetch
    projectData.availableLiquidity = 0n; // Frontend will fetch
    projectData.isFinalized = false; // Frontend will fetch
    projectData.numberOfMMs = 0; // Will be updated by MM events
  } else if (mode === 1) { // BONDING_CURVE
    projectData.targetMarketCap = 0n; // Frontend will fetch
    projectData.virtualUSDCReserve = 0n; // Frontend will fetch  
    projectData.tokenReserve = 0n; // Frontend will fetch
    projectData.graduated = false; // Will be updated by Graduated event
    projectData.currentPrice = 0n; // Frontend will fetch
  }

  // Create the project record with all fetched data
  await context.db
    .insert(project)
    .values(projectData);
  
  console.log(`📦 New ${modeString} project created: ${projectAddress} by ${owner}, token: ${tokenAddress}`);
});

// NOTE: BondingCurve and DirectPool event handlers are commented out
// because the factory pattern is not supported in Ponder 0.11.24
// These will need to be enabled when upgrading to a newer version of Ponder
// that supports the factory pattern for dynamically created contracts

/*
// Handle BondingCurve TokensPurchased event
ponder.on("BondingCurve:TokensPurchased", async ({ event, context }) => {
  const { buyer, usdcAmount, tokensReceived } = event.args;
  const { block, transaction, log } = event;
  const projectAddress = event.log.address;
  
  // Calculate price at time of trade (usdcAmount / tokensReceived * 10^18)
  const price = tokensReceived > 0n ? (usdcAmount * BigInt(1e18)) / tokensReceived : 0n;
  
  // Create trading activity record
  await context.db
    .insert(tradingActivity)
    .values({
      id: `${projectAddress}-${transaction.hash}-${log.logIndex}`,
      projectAddress,
      trader: buyer,
      type: "BUY",
      tokenAmount: tokensReceived,
      usdcAmount,
      price,
      timestamp: Number(block.timestamp),
      txHash: transaction.hash,
      blockNumber: block.number,
    });
  
  // Update project lastUpdated
  await context.db
    .update(project, { id: projectAddress })
    .set({ lastUpdated: Number(block.timestamp) });
  
  console.log(`🛒 Tokens purchased on ${projectAddress}: ${tokensReceived} tokens for ${usdcAmount} USDC by ${buyer}`);
});

// Handle BondingCurve TokensSold event
ponder.on("BondingCurve:TokensSold", async ({ event, context }) => {
  const { seller, tokenAmount, usdcReceived } = event.args;
  const { block, transaction, log } = event;
  const projectAddress = event.log.address;
  
  // Calculate price at time of trade (usdcReceived / tokenAmount * 10^18)
  const price = tokenAmount > 0n ? (usdcReceived * BigInt(1e18)) / tokenAmount : 0n;
  
  // Create trading activity record
  await context.db
    .insert(tradingActivity)
    .values({
      id: `${projectAddress}-${transaction.hash}-${log.logIndex}`,
      projectAddress,
      trader: seller,
      type: "SELL",
      tokenAmount,
      usdcAmount: usdcReceived,
      price,
      timestamp: Number(block.timestamp),
      txHash: transaction.hash,
      blockNumber: block.number,
    });
  
  // Update project lastUpdated
  await context.db
    .update(project, { id: projectAddress })
    .set({ lastUpdated: Number(block.timestamp) });
  
  console.log(`💰 Tokens sold on ${projectAddress}: ${tokenAmount} tokens for ${usdcReceived} USDC by ${seller}`);
});

// Handle BondingCurve Graduated event
ponder.on("BondingCurve:Graduated", async ({ event, context }) => {
  const { finalMarketCap } = event.args;
  const { block } = event;
  const projectAddress = event.log.address;
  
  // Update project graduated status and final market cap
  await context.db
    .update(project, { id: projectAddress })
    .set({ 
      graduated: true,
      currentMarketCap: finalMarketCap,
      lastUpdated: Number(block.timestamp),
    });
  
  console.log(`🎓 BondingCurve graduated at ${projectAddress} with final market cap: ${finalMarketCap}`);
});

// Handle DirectPool MMRegistered event
ponder.on("DirectPool:MMRegistered", async ({ event, context }) => {
  const { mm } = event.args;
  const { block } = event;
  const projectAddress = event.log.address;
  
  // Create or update registeredMM record
  await context.db
    .insert(registeredMM)
    .values({
      id: `${projectAddress}-${mm}`,
      projectAddress,
      mmAddress: mm,
      registeredAt: Number(block.timestamp),
      isActive: true,
      lastUpdated: Number(block.timestamp),
    })
    .onConflictDoUpdate({
      isActive: true,
      lastUpdated: Number(block.timestamp),
    });
  
  // Update project lastUpdated (numberOfMMs will be tracked by counting registeredMM records)
  await context.db
    .update(project, { id: projectAddress })
    .set({ 
      lastUpdated: Number(block.timestamp),
    });
  
  console.log(`🤝 MM registered at ${projectAddress}: ${mm}`);
});

// Handle DirectPool MMsFinalized event
ponder.on("DirectPool:MMsFinalized", async ({ event, context }) => {
  const { block } = event;
  const projectAddress = event.log.address;
  
  // Update project finalization status
  await context.db
    .update(project, { id: projectAddress })
    .set({ 
      isFinalized: true,
      lastUpdated: Number(block.timestamp),
    });
  
  console.log(`✅ Pool finalized at ${projectAddress}`);
});

// Handle DirectPool TokensBorrowed event
ponder.on("DirectPool:TokensBorrowed", async ({ event, context }) => {
  const { mm, amount } = event.args;
  const { block, transaction } = event;
  const projectAddress = event.log.address;
  
  // Get project to fetch borrowTimeLimit
  const projectData = await context.db.find(project, { id: projectAddress });
  
  // Create borrow record
  await context.db
    .insert(borrow)
    .values({
      id: `${projectAddress}-${mm}-${block.timestamp}`,
      projectAddress,
      mmAddress: mm,
      borrowedAmount: amount,
      borrowTimestamp: Number(block.timestamp),
      borrowTimeLimit: projectData?.borrowTimeLimit || 0,
      repaidAmount: null,
      repaidAt: null,
      isRepaid: false,
      txHash: transaction.hash,
    });
  
  // Update project available liquidity (subtract borrowed amount)
  if (projectData && projectData.availableLiquidity !== null) {
    await context.db
      .update(project, { id: projectAddress })
      .set({ 
        availableLiquidity: projectData.availableLiquidity - amount,
        lastUpdated: Number(block.timestamp),
      });
  }
  
  console.log(`📤 Tokens borrowed from ${projectAddress}: ${amount} by ${mm}`);
});

// Handle DirectPool TokensRepaid event  
ponder.on("DirectPool:TokensRepaid", async ({ event, context }) => {
  const { mm, amount } = event.args;
  const { block } = event;
  const projectAddress = event.log.address;
  
  // Note: In a real implementation, we'd need to track which specific borrow is being repaid
  // For now, we'll create a new borrow record for the repayment
  // This is a limitation of not having a proper borrow ID tracking system
  
  // Update project available liquidity (add repaid amount)
  const projectData = await context.db.find(project, { id: projectAddress });
  if (projectData && projectData.availableLiquidity !== null) {
    await context.db
      .update(project, { id: projectAddress })
      .set({ 
        availableLiquidity: projectData.availableLiquidity + amount,
        lastUpdated: Number(block.timestamp),
      });
  }
  
  console.log(`📥 Tokens returned to ${projectAddress}: ${amount} by ${mm}`);
});
*/