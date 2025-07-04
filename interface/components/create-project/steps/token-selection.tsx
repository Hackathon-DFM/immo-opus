'use client';

import { useState } from 'react';
import { isAddress } from 'viem';
import { StepProps } from '../types';
import { validateStep1 } from '../validation';

export function TokenSelection({ formData, updateFormData, onNext }: StepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const validationError = validateStep1(formData);
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
        <h2 className="text-2xl font-bold text-gray-900">Token Configuration</h2>
        <p className="mt-2 text-gray-600">Choose whether to create a new token or use an existing one</p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => updateFormData({ isNewToken: true })}
            className={`flex-1 px-4 py-3 border-2 rounded-lg text-center transition-colors ${
              formData.isNewToken
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Create New Token</div>
            <div className="text-sm mt-1 opacity-75">Deploy a new ERC20 token</div>
          </button>
          
          <button
            type="button"
            onClick={() => updateFormData({ isNewToken: false })}
            className={`flex-1 px-4 py-3 border-2 rounded-lg text-center transition-colors ${
              !formData.isNewToken
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Use Existing Token</div>
            <div className="text-sm mt-1 opacity-75">Import an existing ERC20 token</div>
          </button>
        </div>

        {formData.isNewToken ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Name
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., My Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Symbol
              </label>
              <input
                type="text"
                value={formData.symbol || ''}
                onChange={(e) => updateFormData({ symbol: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., MTK"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateFormData({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your token"
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> New tokens will have a fixed supply of 1,000,000,000 (1 billion) tokens with 18 decimals.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Address
              </label>
              <input
                type="text"
                value={formData.existingToken || ''}
                onChange={(e) => updateFormData({ existingToken: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formData.existingToken && !isAddress(formData.existingToken)
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="0x..."
              />
              {formData.existingToken && !isAddress(formData.existingToken) && (
                <p className="mt-1 text-sm text-red-600">Invalid address format</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Amount to Deposit
              </label>
              <input
                type="number"
                value={formData.tokenAmount || ''}
                onChange={(e) => updateFormData({ tokenAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
                min="0"
                step="any"
              />
              <p className="mt-1 text-sm text-gray-500">
                Amount of tokens you want to deposit into the pool
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <div />
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}