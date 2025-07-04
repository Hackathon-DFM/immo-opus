import { useState, useEffect } from 'react';
import { MOCK_PROJECTS, MOCK_MM_POSITIONS, MOCK_PRICE_HISTORY, MOCK_ADDRESSES } from './mock-data';

// Mock for useAllProjects
export function useMockAllProjects() {
  return {
    projects: MOCK_PROJECTS,
    isLoading: false,
  };
}

// Mock for useDirectPool
export function useMockDirectPool(projectAddress: `0x${string}` | undefined) {
  const project = MOCK_PROJECTS.find(p => p.address === projectAddress);
  
  if (!project || project.mode !== 'DIRECT_POOL') {
    return {
      isRegistered: false,
      isFinalized: false,
      borrowedAmount: BigInt(0),
      mmAllocation: BigInt(0),
      maxBorrowAmount: BigInt(0),
      tokenAddress: undefined,
      initialPrice: BigInt(0),
      borrowTimeLimit: BigInt(0),
      borrowTimestamp: BigInt(0),
      timeRemaining: 0,
    };
  }

  // Simulate different states based on connected wallet
  const currentUser = MOCK_ADDRESSES.MM_1; // Simulate connected wallet
  
  return {
    isRegistered: true,
    isFinalized: project.isFinalized,
    borrowedAmount: BigInt(200000 * 10**18), // 200k tokens borrowed
    mmAllocation: BigInt(500000 * 10**18), // 500k allocation
    maxBorrowAmount: BigInt(300000 * 10**18), // 300k available
    tokenAddress: project.tokenAddress,
    initialPrice: BigInt(parseFloat(project.initialPrice) * 10**6), // USDC decimals
    borrowTimeLimit: BigInt(project.borrowTimeLimit),
    borrowTimestamp: BigInt(Date.now() / 1000 - 2 * 24 * 60 * 60), // 2 days ago
    timeRemaining: 5 * 24 * 60 * 60, // 5 days remaining
  };
}

// Mock for useBondingCurve
export function useMockBondingCurve(bondingCurveAddress: `0x${string}` | undefined) {
  const project = MOCK_PROJECTS.find(p => p.address === bondingCurveAddress);
  
  if (!project || project.mode !== 'BONDING_CURVE') {
    return {
      currentPrice: '0',
      currentMarketCap: '0',
      targetMarketCap: '0',
      graduated: false,
      tokenReserve: '0',
      virtualUSDCReserve: '0',
      graduationProgress: 0,
      calculateBuyReturn: async () => BigInt(0),
      calculateSellReturn: async () => BigInt(0),
    };
  }

  return {
    currentPrice: project.currentPrice || '0',
    currentMarketCap: project.currentMarketCap || '0',
    targetMarketCap: project.targetMarketCap || '0',
    graduated: project.graduated || false,
    tokenReserve: project.tokenReserve || '0',
    virtualUSDCReserve: project.virtualUSDCReserve || '0',
    graduationProgress: project.graduationProgress || 0,
    calculateBuyReturn: async (usdcAmount: string) => {
      // Mock calculation: ~1000 tokens per USDC
      return BigInt(parseFloat(usdcAmount) * 1000 * 10**18);
    },
    calculateSellReturn: async (tokenAmount: string) => {
      // Mock calculation: ~0.001 USDC per token
      return BigInt(parseFloat(tokenAmount) * 0.001 * 10**6);
    },
  };
}

// Mock for useTokenInfo
export function useMockTokenInfo(tokenAddress: `0x${string}` | undefined) {
  const project = MOCK_PROJECTS.find(p => p.tokenAddress === tokenAddress);
  
  return {
    name: project?.tokenName || 'Unknown Token',
    symbol: project?.tokenSymbol || 'UNKNOWN',
    decimals: 18,
  };
}

// Mock price history with dynamic updates
export function useMockPriceHistory() {
  const [priceHistory, setPriceHistory] = useState(MOCK_PRICE_HISTORY);

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceHistory(prev => {
        const lastPrice = prev[prev.length - 1];
        const variation = (Math.random() - 0.5) * 0.000002; // Small random variation
        const newPrice = Math.max(0, lastPrice.price + variation);
        const newMarketCap = newPrice * 1000000000; // Assume 1B supply
        
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: newPrice,
          marketCap: newMarketCap,
        };

        // Keep last 50 points
        return [...prev.slice(-49), newPoint];
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return priceHistory;
}

// Mock for transaction operations
export function useMockBondingCurveBuy() {
  const [isPending, setIsPending] = useState(false);
  
  const buy = async (usdcAmount: string, slippage: number = 0.5) => {
    setIsPending(true);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsPending(false);
    
    // Return mock transaction hash
    return '0x' + Math.random().toString(16).slice(2);
  };

  return { buy, isPending };
}

export function useMockBondingCurveSell() {
  const [isPending, setIsPending] = useState(false);
  
  const sell = async (tokenAmount: string, slippage: number = 0.5) => {
    setIsPending(true);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsPending(false);
    
    // Return mock transaction hash
    return '0x' + Math.random().toString(16).slice(2);
  };

  return { sell, isPending };
}

export function useMockUSDCApproval() {
  const [isApproving, setIsApproving] = useState(false);
  
  const checkAndApprove = async (amount: string) => {
    setIsApproving(true);
    
    // Simulate approval delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsApproving(false);
    return true;
  };

  return {
    allowance: '1000000', // Large allowance for testing
    checkAndApprove,
    isApproving,
  };
}

// Mock for MM dashboard operations
export function useMockDirectPoolBorrow() {
  const [isPending, setIsPending] = useState(false);
  
  const borrow = async (amount: string) => {
    setIsPending(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPending(false);
    return '0x' + Math.random().toString(16).slice(2);
  };

  return { borrow, isPending };
}

export function useMockDirectPoolRepay() {
  const [isPending, setIsPending] = useState(false);
  
  const repay = async (amount: string) => {
    setIsPending(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPending(false);
    return '0x' + Math.random().toString(16).slice(2);
  };

  return { repay, isPending };
}

export function useMockTokenBalance() {
  return BigInt(500000 * 10**18); // 500k tokens
}

// Mock for project creation
export function useMockCreateProject() {
  const [isLoading, setIsLoading] = useState(false);
  
  const createProject = async (params: any) => {
    setIsLoading(true);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsLoading(false);
    
    // Return mock transaction hash
    return '0x' + Math.random().toString(16).slice(2);
  };

  return {
    createProject,
    isLoading,
    error: null,
    isError: false,
  };
}