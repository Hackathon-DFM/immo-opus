'use client';

import { StepProps, PoolMode } from '../types';
import { priceToUsdc } from '../constants';
import { formatUnits } from 'viem';

interface ReviewSubmitProps extends StepProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  transactionStatus: string;
  transactionHash?: string;
  error?: string;
}

export function ReviewSubmit({ 
  formData, 
  onBack, 
  onSubmit,
  isSubmitting,
  transactionStatus,
  transactionHash,
  error
}: ReviewSubmitProps) {
  const secondsToDays = (seconds: number) => seconds / (24 * 60 * 60);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
        <p className="mt-2 text-gray-600">Review your project configuration before submitting</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h3 className="font-semibold text-gray-900">Token Configuration</h3>
          {formData.isNewToken ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Token Name:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Token Symbol:</span>
                <span className="font-medium">{formData.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium truncate max-w-xs">{formData.description}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Supply:</span>
                <span className="font-medium">1,000,000,000</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Token Address:</span>
                <span className="font-medium font-mono text-xs">{formData.existingToken}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deposit Amount:</span>
                <span className="font-medium">{formData.tokenAmount}</span>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h3 className="font-semibold text-gray-900">Pool Configuration</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pool Mode:</span>
            <span className="font-medium">
              {formData.mode === PoolMode.DIRECT_POOL ? 'Direct Pool' : 'Bonding Curve'}
            </span>
          </div>
          {formData.mode === PoolMode.DIRECT_POOL ? (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Initial Price:</span>
              <span className="font-medium">${formData.initialPrice}</span>
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Target Market Cap:</span>
              <span className="font-medium">${formData.targetMarketCap}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Borrow Time Limit:</span>
            <span className="font-medium">{secondsToDays(formData.borrowTimeLimit)} days</span>
          </div>
        </div>

        {!isSubmitting && !transactionHash && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Next Steps:</strong> After creating the project, you'll need to register Market Makers 
              and finalize the MM list before they can start borrowing tokens.
            </p>
          </div>
        )}

        {isSubmitting && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-700"></div>
              <div>
                <p className="text-sm font-medium text-yellow-700">Transaction Status: {transactionStatus}</p>
                <p className="text-xs text-yellow-600 mt-1">Please wait and don't close this window...</p>
              </div>
            </div>
          </div>
        )}

        {transactionHash && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-700 mb-2">Project created successfully!</p>
            <a
              href={`https://sepolia.arbiscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:text-green-700 underline"
            >
              View transaction on Arbiscan
            </a>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-700">Transaction failed</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          Back
        </button>
        {!transactionHash && (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Project...' : 'Create Project'}
          </button>
        )}
      </div>
    </div>
  );
}