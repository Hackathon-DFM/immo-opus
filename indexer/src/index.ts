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
  
  // Fetch token metadata from the ERC20 contract
  let tokenName = "Unknown";
  let tokenSymbol = "UNK";
  let tokenDecimals = 18;
  let tokenTotalSupply = 0n;

  try {
    // Read token metadata from the blockchain
    const nameResult = await context.client.readContract({
      address: tokenAddress,
      abi: [
        {
          name: "name",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "string" }],
        },
      ],
      functionName: "name",
    });
    tokenName = nameResult as string;

    const symbolResult = await context.client.readContract({
      address: tokenAddress,
      abi: [
        {
          name: "symbol",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "string" }],
        },
      ],
      functionName: "symbol",
    });
    tokenSymbol = symbolResult as string;

    const decimalsResult = await context.client.readContract({
      address: tokenAddress,
      abi: [
        {
          name: "decimals",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "uint8" }],
        },
      ],
      functionName: "decimals",
    });
    tokenDecimals = Number(decimalsResult);

    const totalSupplyResult = await context.client.readContract({
      address: tokenAddress,
      abi: [
        {
          name: "totalSupply",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "uint256" }],
        },
      ],
      functionName: "totalSupply",
    });
    tokenTotalSupply = BigInt(totalSupplyResult as string);

    console.log(`📊 Token metadata fetched: ${tokenName} (${tokenSymbol}), decimals: ${tokenDecimals}, totalSupply: ${tokenTotalSupply}`);
  } catch (error) {
    console.error(`Failed to fetch token metadata for ${tokenAddress}:`, error);
  }

  // Create token record with fetched metadata
  await context.db
    .insert(token)
    .values({
      id: tokenAddress, // id is same as address
      address: tokenAddress,
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      totalSupply: tokenTotalSupply,
      isNewlyCreated: true, // Assume newly created for now, can be refined
      createdAt: Number(block.timestamp),
    })
    .onConflictDoNothing();
  
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

  if (mode === 0) { // DIRECT_POOL
    try {
      // Read borrowTimeLimit
      const borrowTimeLimitResult = await context.client.readContract({
        address: projectAddress,
        abi: [
          {
            name: "borrowTimeLimit",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "borrowTimeLimit",
      });
      projectData.borrowTimeLimit = Number(borrowTimeLimitResult);

      // Read initialPrice
      const initialPriceResult = await context.client.readContract({
        address: projectAddress,
        abi: [
          {
            name: "initialPrice",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "initialPrice",
      });
      projectData.initialPrice = BigInt(initialPriceResult as string);

      // Read totalLiquidity
      const totalLiquidityResult = await context.client.readContract({
        address: projectAddress,
        abi: [
          {
            name: "totalLiquidity",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "totalLiquidity",
      });
      projectData.totalLiquidity = BigInt(totalLiquidityResult as string);

      // Read isFinalized
      const isFinalizedResult = await context.client.readContract({
        address: projectAddress,
        abi: [
          {
            name: "isFinalized",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "bool" }],
          },
        ],
        functionName: "isFinalized",
      });
      projectData.isFinalized = Boolean(isFinalizedResult);

      console.log(`📊 DirectPool properties: borrowTimeLimit=${projectData.borrowTimeLimit}s, initialPrice=${projectData.initialPrice}, totalLiquidity=${projectData.totalLiquidity}`);
    } catch (error) {
      console.error(`Failed to fetch DirectPool properties for ${projectAddress}:`, error);
    }
  } else if (mode === 1) { // BONDING_CURVE
    try {
      // Read targetMarketCap
      const targetMarketCapResult = await context.client.readContract({
        address: projectAddress,
        abi: [
          {
            name: "targetMarketCap",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "targetMarketCap",
      });
      projectData.targetMarketCap = BigInt(targetMarketCapResult as string);

      // Read virtualUSDCReserve
      const virtualUSDCReserveResult = await context.client.readContract({
        address: projectAddress,
        abi: [
          {
            name: "virtualUSDCReserve",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "virtualUSDCReserve",
      });
      projectData.virtualUSDCReserve = BigInt(virtualUSDCReserveResult as string);

      // Read tokenReserve
      const tokenReserveResult = await context.client.readContract({
        address: projectAddress,
        abi: [
          {
            name: "tokenReserve",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "tokenReserve",
      });
      projectData.tokenReserve = BigInt(tokenReserveResult as string);

      // Read graduated status
      const graduatedResult = await context.client.readContract({
        address: projectAddress,
        abi: [
          {
            name: "graduated",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "bool" }],
          },
        ],
        functionName: "graduated",
      });
      projectData.graduated = Boolean(graduatedResult);

      // Calculate current price (virtualUSDCReserve / tokenReserve * 10^18)
      if (projectData.tokenReserve > 0n) {
        projectData.currentPrice = (projectData.virtualUSDCReserve * BigInt(1e18)) / projectData.tokenReserve;
      }

      console.log(`📊 BondingCurve properties: targetMarketCap=${projectData.targetMarketCap}, graduated=${projectData.graduated}`);
    } catch (error) {
      console.error(`Failed to fetch BondingCurve properties for ${projectAddress}:`, error);
    }
  }

  // Create the project record with all fetched data
  await context.db
    .insert(project)
    .values(projectData);
  
  console.log(`📦 New ${modeString} project created: ${projectAddress} by ${owner}, token: ${tokenAddress}`);
});