import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { useMemo } from 'react';
import DirectPoolABI from '../contracts/DirectPool.json';
import BondingCurveABI from '../contracts/BondingCurve.json';
import { erc20Abi } from 'viem';

export interface ProjectDetails {
  address: `0x${string}`;
  mode: 'DIRECT_POOL' | 'BONDING_CURVE';
  
  // Common properties
  projectOwner: `0x${string}`;
  token: `0x${string}`;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  borrowTimeLimit: number; // in seconds
  
  // DirectPool specific
  totalLiquidity?: bigint;
  availableLiquidity?: bigint;
  borrowedAmount?: bigint;
  numberOfMMs?: number;
  isFinalized?: boolean;
  initialPrice?: bigint;
  
  // BondingCurve specific
  targetMarketCap?: bigint;
  currentMarketCap?: bigint;
  currentPrice?: bigint;
  graduated?: boolean;
  tokenReserve?: bigint;
  virtualUSDCReserve?: bigint;
}

export function useProjectDetails(projectAddress: `0x${string}`, mode: 'DIRECT_POOL' | 'BONDING_CURVE') {
  const chainId = useChainId();

  // First, get basic project info to determine token address
  const { data: basicInfo } = useReadContracts({
    contracts: [
      {
        address: projectAddress,
        abi: mode === 'DIRECT_POOL' ? DirectPoolABI : BondingCurveABI,
        functionName: 'projectOwner',
      },
      {
        address: projectAddress,
        abi: mode === 'DIRECT_POOL' ? DirectPoolABI : BondingCurveABI,
        functionName: 'token',
      },
      {
        address: projectAddress,
        abi: mode === 'DIRECT_POOL' ? DirectPoolABI : BondingCurveABI,
        functionName: 'borrowTimeLimit',
      },
    ],
    query: {
      enabled: !!projectAddress,
    },
  });

  const tokenAddress = basicInfo?.[1]?.result as `0x${string}` | undefined;

  // Get token details if we have the address
  const { data: tokenInfo } = useReadContracts({
    contracts: tokenAddress ? [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ] : [],
    query: {
      enabled: !!tokenAddress,
    },
  });

  // Get mode-specific details
  const { data: poolInfo } = useReadContract({
    address: projectAddress,
    abi: DirectPoolABI,
    functionName: 'getPoolInfo',
    query: {
      enabled: !!projectAddress && mode === 'DIRECT_POOL',
    },
  });

  const { data: directPoolDetails } = useReadContracts({
    contracts: mode === 'DIRECT_POOL' ? [
      {
        address: projectAddress,
        abi: DirectPoolABI,
        functionName: 'initialPrice',
      },
      {
        address: projectAddress,
        abi: DirectPoolABI,
        functionName: 'totalLiquidity',
      },
    ] : [],
    query: {
      enabled: !!projectAddress && mode === 'DIRECT_POOL',
    },
  });

  const { data: bondingCurveDetails } = useReadContracts({
    contracts: mode === 'BONDING_CURVE' ? [
      {
        address: projectAddress,
        abi: BondingCurveABI,
        functionName: 'targetMarketCap',
      },
      {
        address: projectAddress,
        abi: BondingCurveABI,
        functionName: 'getCurrentMarketCap',
      },
      {
        address: projectAddress,
        abi: BondingCurveABI,
        functionName: 'getCurrentPrice',
      },
      {
        address: projectAddress,
        abi: BondingCurveABI,
        functionName: 'graduated',
      },
      {
        address: projectAddress,
        abi: BondingCurveABI,
        functionName: 'tokenReserve',
      },
      {
        address: projectAddress,
        abi: BondingCurveABI,
        functionName: 'virtualUSDCReserve',
      },
    ] : [],
    query: {
      enabled: !!projectAddress && mode === 'BONDING_CURVE',
    },
  });

  const projectDetails: ProjectDetails | null = useMemo(() => {
    if (!basicInfo || !basicInfo[0]?.result || !basicInfo[1]?.result || !basicInfo[2]?.result) {
      return null;
    }

    const base: ProjectDetails = {
      address: projectAddress,
      mode,
      projectOwner: basicInfo[0].result as `0x${string}`,
      token: basicInfo[1].result as `0x${string}`,
      borrowTimeLimit: Number(basicInfo[2].result),
      tokenName: tokenInfo?.[0]?.result as string,
      tokenSymbol: tokenInfo?.[1]?.result as string,
      tokenDecimals: tokenInfo?.[2]?.result as number,
    };

    if (mode === 'DIRECT_POOL' && poolInfo) {
      return {
        ...base,
        totalLiquidity: (poolInfo as any)[0] as bigint,
        availableLiquidity: (poolInfo as any)[1] as bigint,
        numberOfMMs: Number((poolInfo as any)[2]),
        isFinalized: (poolInfo as any)[3] as boolean,
        borrowedAmount: ((poolInfo as any)[0] as bigint) - ((poolInfo as any)[1] as bigint), // total - available
        initialPrice: directPoolDetails?.[0]?.result as bigint,
      };
    }

    if (mode === 'BONDING_CURVE' && bondingCurveDetails) {
      return {
        ...base,
        targetMarketCap: bondingCurveDetails[0]?.result as bigint,
        currentMarketCap: bondingCurveDetails[1]?.result as bigint,
        currentPrice: bondingCurveDetails[2]?.result as bigint,
        graduated: bondingCurveDetails[3]?.result as boolean,
        tokenReserve: bondingCurveDetails[4]?.result as bigint,
        virtualUSDCReserve: bondingCurveDetails[5]?.result as bigint,
      };
    }

    return base;
  }, [basicInfo, tokenInfo, poolInfo, directPoolDetails, bondingCurveDetails, projectAddress, mode]);

  return {
    projectDetails,
    isLoading: !basicInfo || (mode === 'DIRECT_POOL' && !poolInfo) || (mode === 'BONDING_CURVE' && !bondingCurveDetails),
    error: null, // Could add error handling here
  };
}

// Hook to get multiple project details at once using batch queries
export function useMultipleProjectDetails(projects: Array<{ address: `0x${string}`; mode: 'DIRECT_POOL' | 'BONDING_CURVE' }>) {
  // Prepare batch contracts for basic info (3 calls per project)
  const basicInfoContracts = useMemo(() => {
    return projects.flatMap(({ address, mode }) => [
      {
        address,
        abi: (mode === 'DIRECT_POOL' ? DirectPoolABI : BondingCurveABI) as any,
        functionName: 'projectOwner',
      },
      {
        address,
        abi: (mode === 'DIRECT_POOL' ? DirectPoolABI : BondingCurveABI) as any,
        functionName: 'token',
      },
      {
        address,
        abi: (mode === 'DIRECT_POOL' ? DirectPoolABI : BondingCurveABI) as any,
        functionName: 'borrowTimeLimit',
      },
    ]);
  }, [projects]);

  const { data: basicInfoResults, isLoading: isLoadingBasic } = useReadContracts({
    contracts: basicInfoContracts,
    query: {
      enabled: projects.length > 0,
    },
  });

  // Extract token addresses from basic info results
  const tokenAddresses = useMemo(() => {
    if (!basicInfoResults) return [];
    const addresses: `0x${string}`[] = [];
    for (let i = 1; i < basicInfoResults.length; i += 3) {
      if (basicInfoResults[i]?.result) {
        addresses.push(basicInfoResults[i].result as `0x${string}`);
      }
    }
    return addresses;
  }, [basicInfoResults]);

  // Prepare batch contracts for token info
  const tokenInfoContracts = useMemo(() => {
    return tokenAddresses.flatMap(address => [
      {
        address,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ]);
  }, [tokenAddresses]);

  const { data: tokenInfoResults, isLoading: isLoadingTokens } = useReadContracts({
    contracts: tokenInfoContracts,
    query: {
      enabled: tokenAddresses.length > 0,
    },
  });

  // Prepare batch contracts for pool-specific info
  const poolInfoContracts = useMemo(() => {
    return projects.flatMap(({ address, mode }) => {
      if (mode === 'DIRECT_POOL') {
        return [
          {
            address,
            abi: DirectPoolABI as any,
            functionName: 'getPoolInfo',
          },
          {
            address,
            abi: DirectPoolABI as any,
            functionName: 'initialPrice',
          },
        ];
      } else {
        return [
          {
            address,
            abi: BondingCurveABI as any,
            functionName: 'targetMarketCap',
          },
          {
            address,
            abi: BondingCurveABI as any,
            functionName: 'getCurrentMarketCap',
          },
          {
            address,
            abi: BondingCurveABI as any,
            functionName: 'getCurrentPrice',
          },
          {
            address,
            abi: BondingCurveABI as any,
            functionName: 'graduated',
          },
          {
            address,
            abi: BondingCurveABI as any,
            functionName: 'tokenReserve',
          },
          {
            address,
            abi: BondingCurveABI as any,
            functionName: 'virtualUSDCReserve',
          },
        ];
      }
    });
  }, [projects]);

  const { data: poolInfoResults, isLoading: isLoadingPools } = useReadContracts({
    contracts: poolInfoContracts,
    query: {
      enabled: projects.length > 0,
    },
  });

  // Combine all results into ProjectDetails
  const projectDetails: ProjectDetails[] = useMemo(() => {
    if (!basicInfoResults || !tokenInfoResults || !poolInfoResults) return [];

    return projects.map((project, index) => {
      const basicStartIdx = index * 3;
      const tokenIdx = tokenAddresses.findIndex(addr => addr === basicInfoResults[basicStartIdx + 1]?.result);
      const tokenStartIdx = tokenIdx * 3;

      const base: ProjectDetails = {
        address: project.address,
        mode: project.mode,
        projectOwner: (basicInfoResults[basicStartIdx]?.result as `0x${string}`) || '0x0000000000000000000000000000000000000000',
        token: (basicInfoResults[basicStartIdx + 1]?.result as `0x${string}`) || '0x0000000000000000000000000000000000000000',
        borrowTimeLimit: Number(basicInfoResults[basicStartIdx + 2]?.result || 0),
        tokenName: tokenIdx >= 0 ? (tokenInfoResults[tokenStartIdx]?.result as string) : undefined,
        tokenSymbol: tokenIdx >= 0 ? (tokenInfoResults[tokenStartIdx + 1]?.result as string) : undefined,
        tokenDecimals: tokenIdx >= 0 ? (tokenInfoResults[tokenStartIdx + 2]?.result as number) : undefined,
      };

      // Calculate pool info start index
      let poolStartIdx = 0;
      for (let i = 0; i < index; i++) {
        poolStartIdx += projects[i].mode === 'DIRECT_POOL' ? 2 : 6;
      }

      if (project.mode === 'DIRECT_POOL') {
        const poolInfo = poolInfoResults[poolStartIdx]?.result;
        if (poolInfo && Array.isArray(poolInfo)) {
          return {
            ...base,
            totalLiquidity: poolInfo[0] as bigint,
            availableLiquidity: poolInfo[1] as bigint,
            numberOfMMs: Number(poolInfo[2]),
            isFinalized: poolInfo[3] as boolean,
            borrowedAmount: (poolInfo[0] as bigint) - (poolInfo[1] as bigint),
            initialPrice: poolInfoResults[poolStartIdx + 1]?.result as bigint,
          };
        }
      } else {
        return {
          ...base,
          targetMarketCap: poolInfoResults[poolStartIdx]?.result as bigint,
          currentMarketCap: poolInfoResults[poolStartIdx + 1]?.result as bigint,
          currentPrice: poolInfoResults[poolStartIdx + 2]?.result as bigint,
          graduated: poolInfoResults[poolStartIdx + 3]?.result as boolean,
          tokenReserve: poolInfoResults[poolStartIdx + 4]?.result as bigint,
          virtualUSDCReserve: poolInfoResults[poolStartIdx + 5]?.result as bigint,
        };
      }

      return base;
    });
  }, [projects, basicInfoResults, tokenInfoResults, poolInfoResults, tokenAddresses]);

  return {
    projectDetails,
    isLoading: isLoadingBasic || isLoadingTokens || isLoadingPools,
    errors: [],
  };
}