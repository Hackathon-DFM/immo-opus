import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import BondingCurveABI from '../contracts/BondingCurve.json';
import { erc20Abi } from 'viem';

export function useBondingCurve(bondingCurveAddress: `0x${string}` | undefined) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Read current price
  const { data: currentPrice, error: priceError, isLoading: priceLoading } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'getCurrentPrice',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 10000, // Refresh every 10 seconds
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  });

  // Read current market cap
  const { data: currentMarketCap, error: marketCapError, isLoading: marketCapLoading } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'getCurrentMarketCap',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 10000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  });

  // Read target market cap
  const { data: targetMarketCap, error: targetError, isLoading: targetLoading } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'targetMarketCap',
    query: {
      enabled: !!bondingCurveAddress,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  });

  // Read graduation status
  const { data: graduated, error: graduatedError, isLoading: graduatedLoading } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'graduated',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 30000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  });

  // Read token reserves
  const { data: tokenReserve, error: tokenError, isLoading: tokenLoading } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'tokenReserve',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 10000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  });

  // Read virtual USDC reserve
  const { data: virtualUSDCReserve, error: usdcError, isLoading: usdcLoading } = useReadContract({
    address: bondingCurveAddress,
    abi: BondingCurveABI,
    functionName: 'virtualUSDCReserve',
    query: {
      enabled: !!bondingCurveAddress,
      refetchInterval: 10000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    if (!bondingCurveAddress || !usdcAmount || parseFloat(usdcAmount) <= 0 || !publicClient) return BigInt(0);
    
    try {
      const result = await publicClient.readContract({
        address: bondingCurveAddress,
        abi: BondingCurveABI,
        functionName: 'calculateBuyReturn',
        args: [parseUnits(usdcAmount, 6)],
      });
      return result as bigint;
    } catch (error) {
      console.error('Error calculating buy return:', error);
      return BigInt(0);
    }
  };

  const calculateSellReturn = async (tokenAmount: string) => {
    if (!bondingCurveAddress || !tokenAmount || parseFloat(tokenAmount) <= 0 || !publicClient) return BigInt(0);
    
    try {
      const result = await publicClient.readContract({
        address: bondingCurveAddress,
        abi: BondingCurveABI,
        functionName: 'calculateSellReturn',
        args: [parseUnits(tokenAmount, 18)],
      });
      return result as bigint;
    } catch (error) {
      console.error('Error calculating sell return:', error);
      return BigInt(0);
    }
  };

  // Aggregate loading and error states
  const isLoading = priceLoading || marketCapLoading || targetLoading || graduatedLoading || tokenLoading || usdcLoading;
  const hasError = !!(priceError || marketCapError || targetError || graduatedError || tokenError || usdcError);
  const errors = {
    price: priceError,
    marketCap: marketCapError,
    target: targetError,
    graduated: graduatedError,
    token: tokenError,
    usdc: usdcError,
  };

  // Calculate graduation progress safely
  const graduationProgress = currentMarketCap && targetMarketCap 
    ? Math.min(Number(currentMarketCap) / Number(targetMarketCap) * 100, 100) // Cap at 100%
    : 0;

  // Calculate USDC needed to reach graduation
  const calculateUsdcNeededForGraduation = () => {
    if (!currentMarketCap || !targetMarketCap || !tokenReserve || !virtualUSDCReserve) {
      return '0';
    }
    
    const currentMC = BigInt(currentMarketCap);
    const targetMC = BigInt(targetMarketCap);
    
    if (currentMC >= targetMC) {
      return '0'; // Already graduated or at target
    }
    
    // This is a simplified calculation
    // In reality, it would require solving the bonding curve equation
    const mcGap = targetMC - currentMC;
    const currentPrice = virtualUSDCReserve && tokenReserve && BigInt(tokenReserve) > 0
      ? (BigInt(virtualUSDCReserve) * BigInt(1e18)) / BigInt(tokenReserve)
      : BigInt(0);
    
    // Rough estimate: gap / current price
    const estimatedUsdc = currentPrice > 0 
      ? (mcGap * BigInt(1e6)) / currentPrice 
      : BigInt(0);
    
    return formatUnits(estimatedUsdc, 6);
  };

  return {
    currentPrice: currentPrice ? formatUnits(currentPrice as bigint, 6) : '0',
    currentMarketCap: currentMarketCap ? formatUnits(currentMarketCap as bigint, 6) : '0',
    targetMarketCap: targetMarketCap ? formatUnits(targetMarketCap as bigint, 6) : '0',
    graduated: graduated || false,
    tokenReserve: tokenReserve ? formatUnits(tokenReserve as bigint, 18) : '0',
    virtualUSDCReserve: virtualUSDCReserve ? formatUnits(virtualUSDCReserve as bigint, 6) : '0',
    graduationProgress,
    calculateBuyReturn,
    calculateSellReturn,
    calculateUsdcNeededForGraduation,
    isLoading,
    hasError,
    errors,
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