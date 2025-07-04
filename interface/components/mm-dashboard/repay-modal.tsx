'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { useDirectPool, useDirectPoolRepay, useTokenInfo, useTokenBalance } from '@/lib/hooks/use-direct-pool';

interface RepayModalProps {
  projectAddress: `0x${string}`;
  isOpen: boolean;
  onClose: () => void;
}

export function RepayModal({ projectAddress, isOpen, onClose }: RepayModalProps) {
  const [repayAmount, setRepayAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    borrowedAmount,
    tokenAddress,
    timeRemaining,
  } = useDirectPool(projectAddress);

  const { name, symbol, decimals } = useTokenInfo(tokenAddress);
  const { repay, isPending } = useDirectPoolRepay(projectAddress);
  const tokenBalance = useTokenBalance(tokenAddress);

  const borrowedFormatted = formatUnits(borrowedAmount as bigint, decimals);
  const balanceFormatted = formatUnits(tokenBalance as bigint, decimals);
  const timeRemainingDays = Math.floor(timeRemaining / (24 * 60 * 60));
  const timeRemainingHours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));

  useEffect(() => {
    if (!isOpen) {
      setRepayAmount('');
      setError(null);
    }
  }, [isOpen]);

  const handleRepay = async () => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(repayAmount) > parseFloat(borrowedFormatted)) {
      setError('Amount exceeds borrowed amount');
      return;
    }

    if (parseFloat(repayAmount) > parseFloat(balanceFormatted)) {
      setError('Insufficient token balance');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await repay(repayAmount, decimals);
      
      // Success - close modal
      onClose();
    } catch (err) {
      console.error('Repay failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxClick = () => {
    // Set to minimum of borrowed amount and token balance
    const maxRepay = Math.min(parseFloat(borrowedFormatted), parseFloat(balanceFormatted));
    setRepayAmount(maxRepay.toString());
  };

  if (!isOpen) return null;

  const isExpired = timeRemaining <= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Repay Tokens</h2>
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
              <span className="text-gray-600">Borrowed Amount:</span>
              <span className="font-medium">{parseFloat(borrowedFormatted).toLocaleString()} {symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Your Balance:</span>
              <span className="font-medium">{parseFloat(balanceFormatted).toLocaleString()} {symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time Remaining:</span>
              <span className={`font-medium ${isExpired ? 'text-red-600' : timeRemainingDays < 1 ? 'text-yellow-600' : 'text-gray-900'}`}>
                {isExpired 
                  ? 'Expired' 
                  : `${timeRemainingDays}d ${timeRemainingHours}h`
                }
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repay Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max={Math.min(parseFloat(borrowedFormatted), parseFloat(balanceFormatted))}
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

          {repayAmount && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Remaining after repay:</strong> {(parseFloat(borrowedFormatted) - parseFloat(repayAmount)).toLocaleString()} {symbol}
              </p>
            </div>
          )}

          {isExpired && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> Your borrow period has expired. The project owner may initiate emergency withdrawal.
              </p>
            </div>
          )}

          {timeRemainingDays < 1 && !isExpired && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> Less than 24 hours remaining to repay.
              </p>
            </div>
          )}

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
              onClick={handleRepay}
              disabled={!repayAmount || parseFloat(repayAmount) <= 0 || isSubmitting || isPending}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isPending ? 'Repaying...' : 'Repay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}