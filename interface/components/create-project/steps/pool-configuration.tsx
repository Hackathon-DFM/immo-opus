'use client';

import { useState } from 'react';
import { StepProps, PoolMode } from '../types';
import { validateStep2 } from '../validation';
import { DEFAULT_VALUES, PRICE_CONSTRAINTS } from '../constants';

export function PoolConfiguration({ formData, updateFormData, onNext, onBack }: StepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const validationError = validateStep2(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pool Configuration</h2>
        <p className="mt-2 font-medium text-gray-600 dark:text-gray-400">Select the pool mode and configure parameters</p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => updateFormData({ mode: PoolMode.DIRECT_POOL })}
            className={`flex-1 px-4 py-3 border-2 rounded-lg text-center transition-colors ${
              formData.mode === PoolMode.DIRECT_POOL
                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-500'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500 dark:text-gray-300'
            }`}
          >
            <div className="font-semibold">Direct Pool</div>
            <div className="text-sm font-medium mt-1 opacity-75">MM-only operations, no public trading</div>
          </button>
          
          <button
            type="button"
            onClick={() => updateFormData({ mode: PoolMode.BONDING_CURVE })}
            className={`flex-1 px-4 py-3 border-2 rounded-lg text-center transition-colors ${
              formData.mode === PoolMode.BONDING_CURVE
                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-500'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500 dark:text-gray-300'
            }`}
          >
            <div className="font-semibold">Bonding Curve</div>
            <div className="text-sm font-medium mt-1 opacity-75">Public trading with graduation mechanism</div>
          </button>
        </div>

        {formData.mode === PoolMode.DIRECT_POOL ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Price (USDC)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={formData.initialPrice}
                  onChange={(e) => updateFormData({ initialPrice: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.0001"
                  min={PRICE_CONSTRAINTS.MIN}
                  max={PRICE_CONSTRAINTS.MAX}
                  step="0.00001"
                />
              </div>
              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                Must be between ${PRICE_CONSTRAINTS.MIN} and ${PRICE_CONSTRAINTS.MAX}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/50 p-4 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                <strong>Direct Pool:</strong> Market Makers will be able to borrow tokens at this fixed price. No public trading is available in this mode.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Market Cap (USDC)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={formData.targetMarketCap || DEFAULT_VALUES.TARGET_MARKET_CAP}
                  onChange={(e) => updateFormData({ targetMarketCap: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="10000"
                  min="1"
                  step="1000"
                />
              </div>
              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                Pool will graduate to Direct Pool when this market cap is reached
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Bonding Curve:</strong> Uses a virtual AMM (x*y=k) formula. Public can trade until graduation, then converts to Direct Pool for MM operations.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Initial price will be calculated based on:</p>
              <ul className="text-sm font-medium text-gray-600 dark:text-gray-400 list-disc list-inside">
                <li>Total token supply: 1,000,000,000</li>
                <li>Virtual USDC reserve based on target market cap</li>
                <li>Constant product formula (x*y=k)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}