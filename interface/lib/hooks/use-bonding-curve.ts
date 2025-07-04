import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import BondingCurveABI from '../contracts/BondingCurve.json';
import { erc20Abi } from 'viem';

export function useBondingCurve(bondingCurveAddress: `0x${string}` | undefined) {
  const { address } = useAccount();

  // Read current price
  const { data: currentPrice } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'getCurrentPrice',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  // Read current market cap
  const { data: currentMarketCap } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'getCurrentMarketCap',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 10000,
    },
  });

  // Read target market cap
  const { data: targetMarketCap } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'targetMarketCap',
    query: {
      enabled: !!bondingCurveAddress,
    },
  });

  // Read graduation status
  const { data: graduated } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'graduated',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 30000,
    },
  });

  // Read token reserves
  const { data: tokenReserve } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'tokenReserve',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 10000,
    },
  });

  // Read virtual USDC reserve
  const { data: virtualUSDCReserve } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'virtualUSDCReserve',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 10000,
    },
  });

  // Calculate buy return
  const { data: buyReturn, refetch: refetchBuyReturn } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'calculateBuyReturn',
    args: [parseUnits('1', 6)], // Default 1 USDC
    query: {
      enabled: false, // Will be called manually
    },
  });

  // Calculate sell return
  const { data: sellReturn, refetch: refetchSellReturn } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'calculateSellReturn',
    args: [parseUnits('1', 18)], // Default 1 token
    query: {
      enabled: false, // Will be called manually
    },
  });

  const calculateBuyReturn = async (usdcAmount: string) => {
    // For now, return a mock value since we can't dynamically call contract with different args
    // In production, this would require a separate contract call
    return parseUnits('100', 18); // Mock 100 tokens for 1 USDC
  };

  const calculateSellReturn = async (tokenAmount: string) => {
    // For now, return a mock value since we can't dynamically call contract with different args
    // In production, this would require a separate contract call
    return parseUnits('1', 6); // Mock 1 USDC for 100 tokens
  };

  return {
    currentPrice: currentPrice ? formatUnits(currentPrice as bigint, 6) : '0',
    currentMarketCap: currentMarketCap ? formatUnits(currentMarketCap as bigint, 6) : '0',
    targetMarketCap: targetMarketCap ? formatUnits(targetMarketCap as bigint, 6) : '0',
    graduated: graduated || false,
    tokenReserve: tokenReserve ? formatUnits(tokenReserve as bigint, 18) : '0',
    virtualUSDCReserve: virtualUSDCReserve ? formatUnits(virtualUSDCReserve as bigint, 6) : '0',
    graduationProgress: currentMarketCap && targetMarketCap 
      ? Number(currentMarketCap) / Number(targetMarketCap) * 100 
      : 0,
    calculateBuyReturn,
    calculateSellReturn,
  };
}

export function useBondingCurveBuy(bondingCurveAddress: `0x${string}` | undefined) {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  
  const buy = async (usdcAmount: string, slippage: number = 0.5) => {
    if (!bondingCurveAddress) throw new Error('Bonding curve address not provided');
    
    const amount = parseUnits(usdcAmount, 6);
    const minTokens = amount * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000);

    return writeContractAsync({
      address: bondingCurveAddress,
      abi: BondingCurveABI,
      functionName: 'buyWithSlippage',
      args: [amount, minTokens],
    });
  };

  return { buy, hash, isPending };
}

export function useBondingCurveSell(bondingCurveAddress: `0x${string}` | undefined) {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  
  const sell = async (tokenAmount: string, slippage: number = 0.5) => {
    if (!bondingCurveAddress) throw new Error('Bonding curve address not provided');
    
    const amount = parseUnits(tokenAmount, 18);
    const minUsdc = amount * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000);

    return writeContractAsync({
      address: bondingCurveAddress,
      abi: BondingCurveABI,
      functionName: 'sellWithSlippage',
      args: [amount, minUsdc],
    });
  };

  return { sell, hash, isPending };
}

export function useUSDCApproval(usdcAddress: `0x${string}` | undefined, spender: `0x${string}` | undefined) {
  const { address } = useAccount();
  
  // Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && spender ? [address, spender] : undefined,
    query: {
      enabled: !!address && !!spender && !!usdcAddress,
    },
  });

  // Approve function
  const { writeContractAsync: approve, isPending: isApproving } = useWriteContract();

  const checkAndApprove = async (amount: string) => {
    if (!usdcAddress || !spender) throw new Error('USDC or spender address not provided');
    
    const amountBigInt = parseUnits(amount, 6);
    const currentAllowance = allowance || BigInt(0);
    
    if (currentAllowance >= amountBigInt) {
      return true; // Already approved
    }

    // Approve the exact amount needed
    const hash = await approve({
      address: usdcAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amountBigInt],
    });

    await refetchAllowance();
    return hash;
  };

  return {
    allowance: allowance ? formatUnits(allowance, 6) : '0',
    checkAndApprove,
    isApproving,
  };
}