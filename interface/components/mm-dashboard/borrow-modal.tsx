'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { useDirectPool, useDirectPoolBorrow, useTokenInfo } from '@/lib/hooks/use-direct-pool';

interface BorrowModalProps {
  projectAddress: `0x${string}`;
  isOpen: boolean;
  onClose: () => void;
}

export function BorrowModal({ projectAddress, isOpen, onClose }: BorrowModalProps) {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isRegistered,
    isFinalized,
    borrowedAmount,
    mmAllocation,
    maxBorrowAmount,
    tokenAddress,
    initialPrice,
    borrowTimeLimit,
  } = useDirectPool(projectAddress);

  const { name, symbol, decimals } = useTokenInfo(tokenAddress);
  const { borrow, isPending } = useDirectPoolBorrow(projectAddress);

  const maxBorrowFormatted = formatUnits(maxBorrowAmount as bigint, decimals);
  const allocationFormatted = formatUnits(mmAllocation as bigint, decimals);
  const borrowedFormatted = formatUnits(borrowedAmount as bigint, decimals);
  const priceFormatted = formatUnits(initialPrice as bigint, 6);
  const borrowTimeDays = Number(borrowTimeLimit) / (24 * 60 * 60);

  useEffect(() => {
    if (!isOpen) {
      setBorrowAmount('');
      setError(null);
    }
  }, [isOpen]);

  const handleBorrow = async () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(borrowAmount) > parseFloat(maxBorrowFormatted)) {
      setError('Amount exceeds available allocation');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await borrow(borrowAmount, decimals);
      
      // Success - close modal
      onClose();
    } catch (err) {
      console.error('Borrow failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxClick = () => {
    setBorrowAmount(maxBorrowFormatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Borrow Tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Token:</span>
              <span className="font-medium dark:text-gray-200">{name} ({symbol})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Initial Price:</span>
              <span className="font-medium dark:text-gray-200">${priceFormatted} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Your Allocation:</span>
              <span className="font-medium dark:text-gray-200">{parseFloat(allocationFormatted).toLocaleString()} {symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Already Borrowed:</span>
              <span className="font-medium dark:text-gray-200">{parseFloat(borrowedFormatted).toLocaleString()} {symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Available to Borrow:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {parseFloat(maxBorrowFormatted).toLocaleString()} {symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Borrow Time Limit:</span>
              <span className="font-medium dark:text-gray-200">{borrowTimeDays} days</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Borrow Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                max={maxBorrowFormatted}
                step="any"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                <button
                  onClick={handleMaxClick}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  MAX
                </button>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{symbol}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CLOB Exchange
            </label>
            <div className="relative">
              <select
                disabled
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed appearance-none"
                value="gtx"
              >
                <option value="gtx">GTX</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Trading platform for borrowed tokens</p>
          </div>

          {borrowAmount && (
            <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Value:</strong> ${(parseFloat(borrowAmount) * parseFloat(priceFormatted)).toFixed(2)} USDC
              </p>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/50 p-3 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              <strong>Important:</strong> You must repay borrowed tokens within {borrowTimeDays} days. 
              After borrowing, tokens will be sent to your CLOB adapter for trading.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 p-3 rounded-lg overflow-hidden">
              <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting || isPending}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBorrow}
              disabled={!borrowAmount || parseFloat(borrowAmount) <= 0 || isSubmitting || isPending}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isPending ? 'Borrowing...' : 'Borrow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}