import { ponder } from "ponder:registry";
import { project, projectOwner, token } from "ponder:schema";

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
      address: owner,
      projectCount: 1,
      createdAt: Number(block.timestamp),
      lastUpdated: Number(block.timestamp),
    })
    .onConflictDoUpdate((row) => ({
      projectCount: row.projectCount + 1,
      lastUpdated: Number(block.timestamp),
    }));
  
  // Create token record if it doesn't exist
  // We'll need to get token details from the contract later
  await context.db
    .insert(token)
    .values({
      address: tokenAddress,
      name: "Unknown", // Will be updated later
      symbol: "UNK", // Will be updated later
      decimals: 18, // Will be updated later
      totalSupply: 0n, // Will be updated later
      isNewlyCreated: true, // Assume newly created for now, can be refined
      createdAt: Number(block.timestamp),
    })
    .onConflictDoNothing();
  
  // Create the project record
  await context.db
    .insert(project)
    .values({
      address: projectAddress,
      owner,
      mode: modeString,
      tokenAddress,
      borrowTimeLimit: 0, // Will be updated later when we fetch from contract
      createdAt: Number(block.timestamp),
      createdBlock: block.number,
      createdTxHash: transaction.hash,
    });
  
  console.log(`📦 New ${modeString} project created: ${projectAddress} by ${owner}, token: ${tokenAddress}`);
});