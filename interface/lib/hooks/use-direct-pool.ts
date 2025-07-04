import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import DirectPoolABI from '../contracts/DirectPool.json';
import { erc20Abi } from 'viem';

export function useDirectPool(directPoolAddress: `0x${string}` | undefined) {
  const { address } = useAccount();

  // Read if MM is registered
  const { data: isRegistered } = useReadContract({
    address: directPoolAddress,
    abi: DirectPoolABI,
    functionName: 'registeredMMs',
    args: address ? [address] : undefined,
    query: {
      enabled: !!directPoolAddress && !!address,
      refetchInterval: 30000,
    },
  });

  // Read if pool is finalized
  const { data: isFinalized } = useReadContract({
    address: directPoolAddress,
    abi: DirectPoolABI,
    functionName: 'isFinalized',
    query: {
      enabled: !!directPoolAddress,
    },
  });

  // Read borrowed amount
  const { data: borrowedAmount } = useReadContract({
    address: directPoolAddress,
    abi: DirectPoolABI,
    functionName: 'borrowedAmount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!directPoolAddress && !!address,
      refetchInterval: 30000,
    },
  });

  // Read MM allocation
  const { data: mmAllocation } = useReadContract({
    address: directPoolAddress,
    abi: DirectPoolABI,
    functionName: 'getMMAllocation',
    query: {
      enabled: !!directPoolAddress,
      refetchInterval: 30000,
    },
  });

  // Read token address
  const { data: tokenAddress } = useReadContract({
    address: directPoolAddress,
    abi: DirectPoolABI,
    functionName: 'token',
    query: {
      enabled: !!directPoolAddress,
    },
  });

  // Read initial price
  const { data: initialPrice } = useReadContract({
    address: directPoolAddress,
    abi: DirectPoolABI,
    functionName: 'initialPrice',
    query: {
      enabled: !!directPoolAddress,
    },
  });

  // Read borrow time limit
  const { data: borrowTimeLimit } = useReadContract({
    address: directPoolAddress,
    abi: DirectPoolABI,
    functionName: 'borrowTimeLimit',
    query: {
      enabled: !!directPoolAddress,
    },
  });

  // Read borrow timestamp
  const { data: borrowTimestamp } = useReadContract({
    address: directPoolAddress,
    abi: DirectPoolABI,
    functionName: 'borrowTimestamp',
    args: address ? [address] : undefined,
    query: {
      enabled: !!directPoolAddress && !!address,
    },
  });

  const maxBorrowAmount = mmAllocation && borrowedAmount 
    ? ((mmAllocation as bigint) > (borrowedAmount as bigint) ? (mmAllocation as bigint) - (borrowedAmount as bigint) : BigInt(0))
    : BigInt(0);

  return {
    isRegistered: isRegistered || false,
    isFinalized: isFinalized || false,
    borrowedAmount: borrowedAmount || BigInt(0),
    mmAllocation: mmAllocation || BigInt(0),
    maxBorrowAmount,
    tokenAddress: tokenAddress as `0x${string}` | undefined,
    initialPrice: initialPrice || BigInt(0),
    borrowTimeLimit: borrowTimeLimit || BigInt(0),
    borrowTimestamp: borrowTimestamp || BigInt(0),
    timeRemaining: borrowTimestamp && borrowTimeLimit
      ? Math.max(0, Number(borrowTimestamp) + Number(borrowTimeLimit) - Math.floor(Date.now() / 1000))
      : 0,
  };
}

export function useDirectPoolBorrow(directPoolAddress: `0x${string}` | undefined) {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();

  const borrow = async (amount: string, decimals: number = 18) => {
    if (!directPoolAddress) throw new Error('Direct pool address not provided');

    const amountBigInt = parseUnits(amount, decimals);

    return writeContractAsync({
      address: directPoolAddress,
      abi: DirectPoolABI,
      functionName: 'borrowTokens',
      args: [amountBigInt],
    });
  };

  return { borrow, hash, isPending };
}

export function useDirectPoolRepay(directPoolAddress: `0x${string}` | undefined) {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();

  const repay = async (amount: string, decimals: number = 18) => {
    if (!directPoolAddress) throw new Error('Direct pool address not provided');

    const amountBigInt = parseUnits(amount, decimals);

    return writeContractAsync({
      address: directPoolAddress,
      abi: DirectPoolABI,
      functionName: 'repayTokens',
      args: [amountBigInt],
    });
  };

  return { repay, hash, isPending };
}

export function useTokenInfo(tokenAddress: `0x${string}` | undefined) {
  const { data: name } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'name',
    query: {
      enabled: !!tokenAddress,
    },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress,
    },
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress,
    },
  });

  return {
    name: name || 'Unknown Token',
    symbol: symbol || 'UNKNOWN',
    decimals: decimals || 18,
  };
}

export function useTokenBalance(tokenAddress: `0x${string}` | undefined) {
  const { address } = useAccount();

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!tokenAddress && !!address,
      refetchInterval: 10000,
    },
  });

  return balance || BigInt(0);
}