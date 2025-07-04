import { ponder } from "ponder:registry";
import { project, projectOwner } from "ponder:schema";

// Handle ProjectCreated events from ProjectFactory
ponder.on("ProjectFactory:ProjectCreated", async ({ event, context }) => {
  const { project: projectAddress, owner, mode } = event.args;
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
  
  // Create the project record
  await context.db
    .insert(project)
    .values({
      address: projectAddress,
      owner,
      mode: modeString,
      token: "0x0000000000000000000000000000000000000000", // Will be updated later
      borrowTimeLimit: 0, // Will be updated later
      createdAt: Number(block.timestamp),
      createdBlock: block.number,
      createdTxHash: transaction.hash,
    });
  
  console.log(`📦 New ${modeString} project created: ${projectAddress} by ${owner}`);
});