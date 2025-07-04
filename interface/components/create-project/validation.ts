import { isAddress } from 'viem';
import { ProjectFormData, PoolMode } from './types';
import { DEFAULT_VALUES, PRICE_CONSTRAINTS, VALIDATION_MESSAGES } from './constants';

export const validateStep1 = (formData: ProjectFormData): string | null => {
  if (!formData.isNewToken && !isAddress(formData.existingToken || '')) {
    return VALIDATION_MESSAGES.TOKEN_ADDRESS;
  }
  
  if (formData.isNewToken) {
    if (!formData.name || formData.name.trim().length === 0) {
      return VALIDATION_MESSAGES.TOKEN_NAME;
    }
    
    if (!formData.symbol || formData.symbol.length < 3 || formData.symbol.length > 5) {
      return VALIDATION_MESSAGES.TOKEN_SYMBOL;
    }
    
    if (!formData.description || formData.description.trim().length === 0) {
      return VALIDATION_MESSAGES.TOKEN_DESCRIPTION;
    }
  } else {
    if (!formData.tokenAmount || parseFloat(formData.tokenAmount) <= 0) {
      return VALIDATION_MESSAGES.TOKEN_AMOUNT;
    }
  }
  
  return null;
};

export const validateStep2 = (formData: ProjectFormData): string | null => {
  const price = parseFloat(formData.initialPrice);
  
  if (formData.mode === PoolMode.DIRECT_POOL) {
    if (isNaN(price) || price < PRICE_CONSTRAINTS.MIN || price > PRICE_CONSTRAINTS.MAX) {
      return VALIDATION_MESSAGES.INITIAL_PRICE;
    }
  }
  
  if (formData.mode === PoolMode.BONDING_CURVE) {
    const marketCap = parseFloat(formData.targetMarketCap || '0');
    if (isNaN(marketCap) || marketCap <= 0) {
      return VALIDATION_MESSAGES.TARGET_MARKET_CAP;
    }
  }
  
  return null;
};

export const validateStep3 = (formData: ProjectFormData): string | null => {
  if (
    formData.borrowTimeLimit < DEFAULT_VALUES.MIN_BORROW_TIME ||
    formData.borrowTimeLimit > DEFAULT_VALUES.MAX_BORROW_TIME
  ) {
    return VALIDATION_MESSAGES.BORROW_TIME;
  }
  
  return null;
};