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

  const maxBorrowFormatted = formatUnits(maxBorrowAmount, decimals);
  const allocationFormatted = formatUnits(mmAllocation, decimals);
  const borrowedFormatted = formatUnits(borrowedAmount, decimals);
  const priceFormatted = formatUnits(initialPrice, 6);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Borrow Tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Token:</span>
              <span className="font-medium">{name} ({symbol})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Initial Price:</span>
              <span className="font-medium">${priceFormatted} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Your Allocation:</span>
              <span className="font-medium">{parseFloat(allocationFormatted).toLocaleString()} {symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Already Borrowed:</span>
              <span className="font-medium">{parseFloat(borrowedFormatted).toLocaleString()} {symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Available to Borrow:</span>
              <span className="font-medium text-green-600">
                {parseFloat(maxBorrowFormatted).toLocaleString()} {symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Borrow Time Limit:</span>
              <span className="font-medium">{borrowTimeDays} days</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Borrow Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max={maxBorrowFormatted}
                step="any"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                <button
                  onClick={handleMaxClick}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  MAX
                </button>
                <span className="text-gray-500 text-sm">{symbol}</span>
              </div>
            </div>
          </div>

          {borrowAmount && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Value:</strong> ${(parseFloat(borrowAmount) * parseFloat(priceFormatted)).toFixed(2)} USDC
              </p>
            </div>
          )}

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> You must repay borrowed tokens within {borrowTimeDays} days. 
              After borrowing, tokens will be sent to your CLOB adapter for trading.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting || isPending}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBorrow}
              disabled={!borrowAmount || parseFloat(borrowAmount) <= 0 || isSubmitting || isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isPending ? 'Borrowing...' : 'Borrow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}