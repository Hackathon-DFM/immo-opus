import { parseUnits } from 'viem';

// Default values as specified in the documentation
export const DEFAULT_VALUES = {
  INITIAL_PRICE: '0.0001', // $0.0001 in USDC (6 decimals)
  TARGET_MARKET_CAP: '10000', // $10,000
  BORROW_TIME_LIMIT: 7 * 24 * 60 * 60, // 7 days in seconds
  MIN_BORROW_TIME: 1 * 24 * 60 * 60, // 1 day
  MAX_BORROW_TIME: 30 * 24 * 60 * 60, // 30 days
};

// Price constraints (0.1x - 10x of default)
export const PRICE_CONSTRAINTS = {
  MIN: 0.00001, // $0.00001
  MAX: 0.001, // $0.001
  DEFAULT: 0.0001, // $0.0001
};

// Convert price to USDC units (6 decimals)
export const priceToUsdc = (price: string): bigint => {
  return parseUnits(price, 6);
};

// Validation messages
export const VALIDATION_MESSAGES = {
  TOKEN_ADDRESS: 'Invalid token address',
  TOKEN_NAME: 'Token name is required',
  TOKEN_SYMBOL: 'Token symbol is required (3-5 characters)',
  TOKEN_DESCRIPTION: 'Description is required',
  TOKEN_AMOUNT: 'Token amount must be greater than 0',
  INITIAL_PRICE: `Price must be between $${PRICE_CONSTRAINTS.MIN} and $${PRICE_CONSTRAINTS.MAX}`,
  TARGET_MARKET_CAP: 'Target market cap must be greater than 0',
  BORROW_TIME: 'Borrow time must be between 1 and 30 days',
};