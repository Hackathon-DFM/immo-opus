import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useMemo, useState } from 'react';
import DirectPoolABI from '../contracts/DirectPool.json';
// import { formatUnits } from 'viem'; // Removed unused import

export interface MarketMaker {
  address: `0x${string}`;
  isRegistered: boolean;
  allocation: bigint;
  borrowedAmount: bigint;
  borrowTimestamp: bigint;
  timeRemaining: number; // in days, can be negative if expired
  status: 'Registered' | 'Borrowing' | 'Expired';
  pnl: bigint; // Calculated P&L (simplified for now)
}

export interface MMTransaction {
  hash: `0x${string}`;
  type: 'register' | 'unregister' | 'finalize' | 'emergency_withdraw';
  status: 'pending' | 'confirming' | 'success' | 'error';
  error?: string;
}

export function useMarketMakers(poolAddress: `0x${string}`) {
  const [pendingTx, setPendingTx] = useState<MMTransaction | null>(null);

  // Get basic pool info to calculate allocations
  const { data: poolInfo } = useReadContract({
    address: poolAddress,
    abi: DirectPoolABI as any,
    functionName: 'getPoolInfo',
    query: {
      enabled: !!poolAddress,
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  });

  // Get MM list length and borrow time limit
  const { data: poolConfig } = useReadContracts({
    contracts: [
      {
        address: poolAddress,
        abi: DirectPoolABI as any,
        functionName: 'activeMMs',
      },
      {
        address: poolAddress,
        abi: DirectPoolABI as any,
        functionName: 'borrowTimeLimit',
      },
    ],
    query: {
      enabled: !!poolAddress,
    },
  });

  const numberOfMMs = poolInfo ? Number((poolInfo as any)[2]) : 0;
  const borrowTimeLimit = poolConfig?.[1]?.result ? Number(poolConfig[1].result) : 0;

  // Get MM addresses by reading mmList array
  const mmListContracts = Array.from({ length: numberOfMMs }, (_, i) => ({
    address: poolAddress,
    abi: DirectPoolABI as any,
    functionName: 'mmList',
    args: [i],
  }));

  const { data: mmAddresses } = useReadContracts({
    contracts: mmListContracts,
    query: {
      enabled: !!poolAddress && numberOfMMs > 0,
    },
  });

  // Get detailed data for each MM
  const mmDetailContracts = useMemo(() => {
    if (!mmAddresses) return [];
    
    return mmAddresses.flatMap((addressResult) => {
      if (!addressResult.result) return [];
      const mmAddress = addressResult.result as `0x${string}`;
      
      return [
        {
          address: poolAddress,
          abi: DirectPoolABI as any,
          functionName: 'registeredMMs',
          args: [mmAddress],
        },
        {
          address: poolAddress,
          abi: DirectPoolABI as any,
          functionName: 'borrowedAmount',
          args: [mmAddress],
        },
        {
          address: poolAddress,
          abi: DirectPoolABI as any,
          functionName: 'borrowTimestamp',
          args: [mmAddress],
        },
      ];
    });
  }, [mmAddresses, poolAddress]);

  const { data: mmDetails } = useReadContracts({
    contracts: mmDetailContracts,
    query: {
      enabled: mmDetailContracts.length > 0,
      refetchInterval: 30000,
    },
  });

  // Note: Real-time events would go here when useContractEvent is available
  // For now, we rely on periodic refetching of contract state

  // Calculate allocation per MM
  const allocationPerMM = useMemo(() => {
    if (!poolInfo || numberOfMMs === 0) return BigInt(0);
    const totalLiquidity = (poolInfo as any)[0] as bigint;
    return totalLiquidity / BigInt(numberOfMMs);
  }, [poolInfo, numberOfMMs]);

  // Process MM data
  const marketMakers: MarketMaker[] = useMemo(() => {
    if (!mmAddresses || !mmDetails || !poolInfo) return [];

    const mms: MarketMaker[] = [];
    const currentTime = Math.floor(Date.now() / 1000);

    mmAddresses.forEach((addressResult, index) => {
      if (!addressResult.result) return;
      
      const mmAddress = addressResult.result as `0x${string}`;
      const detailIndex = index * 3;
      
      const isRegistered = mmDetails[detailIndex]?.result as boolean;
      const borrowedAmount = (mmDetails[detailIndex + 1]?.result as bigint) || BigInt(0);
      const borrowTimestamp = (mmDetails[detailIndex + 2]?.result as bigint) || BigInt(0);
      
      // Calculate time remaining
      let timeRemaining = 0;
      let status: MarketMaker['status'] = 'Registered';
      
      if (borrowTimestamp > BigInt(0)) {
        const borrowTime = Number(borrowTimestamp);
        const expiryTime = borrowTime + borrowTimeLimit;
        timeRemaining = (expiryTime - currentTime) / (24 * 60 * 60); // days
        
        if (timeRemaining > 0) {
          status = 'Borrowing';
        } else {
          status = 'Expired';
        }
      }

      // Simplified P&L calculation (would need CLOB adapter integration for real P&L)
      // For now, simulate some P&L based on borrowed amount and time
      const pnl = borrowedAmount > BigInt(0) ? borrowedAmount / BigInt(100) * BigInt(Math.floor(Math.random() * 10 - 3)) : BigInt(0);

      mms.push({
        address: mmAddress,
        isRegistered,
        allocation: allocationPerMM,
        borrowedAmount,
        borrowTimestamp,
        timeRemaining,
        status,
        pnl,
      });
    });

    return mms;
  }, [mmAddresses, mmDetails, poolInfo, allocationPerMM, borrowTimeLimit]);

  // Write contract hooks for MM management
  const { writeContract: registerMM, data: registerHash } = useWriteContract();
  const { writeContract: unregisterMM, data: unregisterHash } = useWriteContract();
  const { writeContract: finalizeMMs, data: finalizeHash } = useWriteContract();
  const { writeContract: emergencyWithdraw, data: emergencyHash } = useWriteContract();

  // Transaction status tracking
  const { isLoading: isRegisterPending, isSuccess: isRegisterSuccess } = useWaitForTransactionReceipt({
    hash: registerHash,
  });
  const { isLoading: isUnregisterPending, isSuccess: isUnregisterSuccess } = useWaitForTransactionReceipt({
    hash: unregisterHash,
  });
  const { isLoading: isFinalizePending, isSuccess: isFinalizeSuccess } = useWaitForTransactionReceipt({
    hash: finalizeHash,
  });
  const { isLoading: isEmergencyPending, isSuccess: isEmergencySuccess } = useWaitForTransactionReceipt({
    hash: emergencyHash,
  });

  // Action functions
  const handleRegisterMM = async (mmAddress: `0x${string}`) => {
    try {
      setPendingTx({
        hash: '0x' as `0x${string}`,
        type: 'register',
        status: 'pending',
      });

      await registerMM({
        address: poolAddress,
        abi: DirectPoolABI as any,
        functionName: 'registerMM',
        args: [mmAddress],
      });
    } catch (error) {
      setPendingTx({
        hash: '0x' as `0x${string}`,
        type: 'register',
        status: 'error',
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  };

  const handleUnregisterMM = async (mmAddress: `0x${string}`) => {
    try {
      setPendingTx({
        hash: '0x' as `0x${string}`,
        type: 'unregister',
        status: 'pending',
      });

      await unregisterMM({
        address: poolAddress,
        abi: DirectPoolABI as any,
        functionName: 'unregisterMM',
        args: [mmAddress],
      });
    } catch (error) {
      setPendingTx({
        hash: '0x' as `0x${string}`,
        type: 'unregister',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unregistration failed',
      });
    }
  };

  const handleFinalizeMMs = async () => {
    try {
      setPendingTx({
        hash: '0x' as `0x${string}`,
        type: 'finalize',
        status: 'pending',
      });

      await finalizeMMs({
        address: poolAddress,
        abi: DirectPoolABI as any,
        functionName: 'finalizeMMs',
        args: [],
      });
    } catch (error) {
      setPendingTx({
        hash: '0x' as `0x${string}`,
        type: 'finalize',
        status: 'error',
        error: error instanceof Error ? error.message : 'Finalization failed',
      });
    }
  };

  const handleEmergencyWithdraw = async (mmAddress: `0x${string}`) => {
    try {
      setPendingTx({
        hash: '0x' as `0x${string}`,
        type: 'emergency_withdraw',
        status: 'pending',
      });

      await emergencyWithdraw({
        address: poolAddress,
        abi: DirectPoolABI as any,
        functionName: 'emergencyWithdraw',
        args: [mmAddress],
      });
    } catch (error) {
      setPendingTx({
        hash: '0x' as `0x${string}`,
        type: 'emergency_withdraw',
        status: 'error',
        error: error instanceof Error ? error.message : 'Emergency withdraw failed',
      });
    }
  };

  return {
    marketMakers,
    isLoading: !poolInfo || (numberOfMMs > 0 && !mmDetails),
    isFinalized: poolInfo ? ((poolInfo as any)[3] as boolean) : false,
    totalLiquidity: poolInfo ? ((poolInfo as any)[0] as bigint) : BigInt(0),
    availableLiquidity: poolInfo ? ((poolInfo as any)[1] as bigint) : BigInt(0),
    allocationPerMM,
    pendingTransaction: pendingTx,
    
    // Actions
    registerMM: handleRegisterMM,
    unregisterMM: handleUnregisterMM,
    finalizeMMs: handleFinalizeMMs,
    emergencyWithdraw: handleEmergencyWithdraw,
    
    // Transaction states
    isRegisterPending,
    isUnregisterPending,
    isFinalizePending,
    isEmergencyPending,
  };
}