import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { useMemo } from 'react';
import { directPoolAbi } from '../contracts/DirectPool';
import { bondingCurveAbi } from '../contracts/BondingCurve';
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
        abi: mode === 'DIRECT_POOL' ? directPoolAbi : bondingCurveAbi,
        functionName: 'projectOwner',
      },
      {
        address: projectAddress,
        abi: mode === 'DIRECT_POOL' ? directPoolAbi : bondingCurveAbi,
        functionName: 'token',
      },
      {
        address: projectAddress,
        abi: mode === 'DIRECT_POOL' ? directPoolAbi : bondingCurveAbi,
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
    abi: directPoolAbi,
    functionName: 'getPoolInfo',
    query: {
      enabled: !!projectAddress && mode === 'DIRECT_POOL',
    },
  });

  const { data: directPoolDetails } = useReadContracts({
    contracts: mode === 'DIRECT_POOL' ? [
      {
        address: projectAddress,
        abi: directPoolAbi,
        functionName: 'initialPrice',
      },
      {
        address: projectAddress,
        abi: directPoolAbi,
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
        abi: bondingCurveAbi,
        functionName: 'targetMarketCap',
      },
      {
        address: projectAddress,
        abi: bondingCurveAbi,
        functionName: 'getCurrentMarketCap',
      },
      {
        address: projectAddress,
        abi: bondingCurveAbi,
        functionName: 'getCurrentPrice',
      },
      {
        address: projectAddress,
        abi: bondingCurveAbi,
        functionName: 'graduated',
      },
      {
        address: projectAddress,
        abi: bondingCurveAbi,
        functionName: 'tokenReserve',
      },
      {
        address: projectAddress,
        abi: bondingCurveAbi,
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
        totalLiquidity: poolInfo[0] as bigint,
        availableLiquidity: poolInfo[1] as bigint,
        numberOfMMs: Number(poolInfo[2]),
        isFinalized: poolInfo[3] as boolean,
        borrowedAmount: (poolInfo[0] as bigint) - (poolInfo[1] as bigint), // total - available
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

// Hook to get multiple project details at once
export function useMultipleProjectDetails(projects: Array<{ address: `0x${string}`; mode: 'DIRECT_POOL' | 'BONDING_CURVE' }>) {
  const results = projects.map(project => 
    useProjectDetails(project.address, project.mode)
  );

  return {
    projectDetails: results.map(r => r.projectDetails).filter(Boolean) as ProjectDetails[],
    isLoading: results.some(r => r.isLoading),
    errors: results.map(r => r.error).filter(Boolean),
  };
}