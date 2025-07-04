export const MOCK_ADDRESSES = {
  // Contract addresses for testing
  PROJECT_FACTORY: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  USDC: '0x0987654321098765432109876543210987654321' as `0x${string}`,
  
  // Test projects
  DIRECT_POOL_PROJECT_1: '0xA000000000000000000000000000000000000001' as `0x${string}`,
  DIRECT_POOL_PROJECT_2: '0xA000000000000000000000000000000000000002' as `0x${string}`,
  BONDING_CURVE_PROJECT_1: '0xB000000000000000000000000000000000000001' as `0x${string}`,
  BONDING_CURVE_PROJECT_2: '0xB000000000000000000000000000000000000002' as `0x${string}`,
  
  // Test tokens
  TOKEN_1: '0xC000000000000000000000000000000000000001' as `0x${string}`,
  TOKEN_2: '0xC000000000000000000000000000000000000002' as `0x${string}`,
  TOKEN_3: '0xC000000000000000000000000000000000000003' as `0x${string}`,
  TOKEN_4: '0xC000000000000000000000000000000000000004' as `0x${string}`,
  
  // Test users
  PROJECT_OWNER: '0xD000000000000000000000000000000000000001' as `0x${string}`,
  MM_1: '0xD000000000000000000000000000000000000002' as `0x${string}`,
  MM_2: '0xD000000000000000000000000000000000000003' as `0x${string}`,
  USER_1: '0xD000000000000000000000000000000000000004' as `0x${string}`,
  USER_2: '0xD000000000000000000000000000000000000005' as `0x${string}`,
};

export const MOCK_PROJECTS = [
  {
    address: MOCK_ADDRESSES.DIRECT_POOL_PROJECT_1,
    owner: MOCK_ADDRESSES.PROJECT_OWNER,
    mode: 'DIRECT_POOL' as const,
    tokenAddress: MOCK_ADDRESSES.TOKEN_1,
    tokenName: 'AI Protocol Token',
    tokenSymbol: 'AI',
    initialPrice: '0.0001',
    borrowTimeLimit: 7 * 24 * 60 * 60, // 7 days
    isFinalized: true,
    registeredMMs: 2,
    totalLiquidity: '1000000',
    availableLiquidity: '600000',
  },
  {
    address: MOCK_ADDRESSES.DIRECT_POOL_PROJECT_2,
    owner: MOCK_ADDRESSES.PROJECT_OWNER,
    mode: 'DIRECT_POOL' as const,
    tokenAddress: MOCK_ADDRESSES.TOKEN_2,
    tokenName: 'DeFi Yield Token',
    tokenSymbol: 'DYT',
    initialPrice: '0.00025',
    borrowTimeLimit: 14 * 24 * 60 * 60, // 14 days
    isFinalized: false,
    registeredMMs: 1,
    totalLiquidity: '500000',
    availableLiquidity: '500000',
  },
  {
    address: MOCK_ADDRESSES.BONDING_CURVE_PROJECT_1,
    owner: MOCK_ADDRESSES.PROJECT_OWNER,
    mode: 'BONDING_CURVE' as const,
    tokenAddress: MOCK_ADDRESSES.TOKEN_3,
    tokenName: 'GameFi Token',
    tokenSymbol: 'GAME',
    targetMarketCap: '50000',
    currentMarketCap: '32450',
    graduationProgress: 64.9,
    graduated: false,
    currentPrice: '0.000032',
    tokenReserve: '968750000',
    virtualUSDCReserve: '51562.5',
  },
  {
    address: MOCK_ADDRESSES.BONDING_CURVE_PROJECT_2,
    owner: MOCK_ADDRESSES.PROJECT_OWNER,
    mode: 'BONDING_CURVE' as const,
    tokenAddress: MOCK_ADDRESSES.TOKEN_4,
    tokenName: 'Social Media Token',
    tokenSymbol: 'SOCIAL',
    targetMarketCap: '25000',
    currentMarketCap: '25000',
    graduationProgress: 100,
    graduated: true,
    currentPrice: '0.000025',
    tokenReserve: '0',
    virtualUSDCReserve: '0',
  },
];

export const MOCK_MM_POSITIONS = [
  {
    projectAddress: MOCK_ADDRESSES.DIRECT_POOL_PROJECT_1,
    tokenSymbol: 'AI',
    tokenName: 'AI Protocol Token',
    borrowedAmount: '200000',
    borrowedValue: '20',
    currentBalance: '250000',
    currentValue: '25',
    pnl: '+5.00',
    pnlPercentage: '+25.0',
    timeRemaining: 5 * 24 * 60 * 60, // 5 days
    timeRemainingDays: 5,
    timeRemainingHours: 12,
    allocation: '500000',
    maxBorrowAmount: '300000',
    isExpired: false,
    isUrgent: false,
  },
  {
    projectAddress: MOCK_ADDRESSES.DIRECT_POOL_PROJECT_2,
    tokenSymbol: 'DYT',
    tokenName: 'DeFi Yield Token',
    borrowedAmount: '100000',
    borrowedValue: '25',
    currentBalance: '90000',
    currentValue: '22.5',
    pnl: '-2.50',
    pnlPercentage: '-10.0',
    timeRemaining: 18 * 60 * 60, // 18 hours
    timeRemainingDays: 0,
    timeRemainingHours: 18,
    allocation: '250000',
    maxBorrowAmount: '150000',
    isExpired: false,
    isUrgent: true,
  },
];

export const MOCK_PRICE_HISTORY = [
  { time: '09:00', price: 0.000028, marketCap: 28000 },
  { time: '09:30', price: 0.000029, marketCap: 29000 },
  { time: '10:00', price: 0.000027, marketCap: 27000 },
  { time: '10:30', price: 0.000030, marketCap: 30000 },
  { time: '11:00', price: 0.000031, marketCap: 31000 },
  { time: '11:30', price: 0.000029, marketCap: 29000 },
  { time: '12:00', price: 0.000032, marketCap: 32000 },
  { time: '12:30', price: 0.000034, marketCap: 34000 },
  { time: '13:00', price: 0.000033, marketCap: 33000 },
  { time: '13:30', price: 0.000035, marketCap: 35000 },
  { time: 'Now', price: 0.000032, marketCap: 32450 },
];

export const MOCK_TRANSACTIONS = [
  {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'buy' as const,
    amount: '1000',
    price: '0.000030',
    value: '30.00',
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    user: MOCK_ADDRESSES.USER_1,
  },
  {
    hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
    type: 'sell' as const,
    amount: '500',
    price: '0.000031',
    value: '15.50',
    timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    user: MOCK_ADDRESSES.USER_2,
  },
  {
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    type: 'buy' as const,
    amount: '2000',
    price: '0.000032',
    value: '64.00',
    timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    user: MOCK_ADDRESSES.USER_1,
  },
];

export const MOCK_SUMMARY_STATS = {
  mm: {
    activePositions: 3,
    totalBorrowedValue: 24567,
    totalPnl: 1234,
    availableProjects: 12,
  },
  po: {
    totalProjects: 4,
    totalValueLocked: 125000,
    activeMMs: 8,
    totalVolume: 456789,
  },
  platform: {
    totalProjects: 42,
    totalValueLocked: 2500000,
    totalUsers: 1247,
    totalVolume: 12345678,
  },
};