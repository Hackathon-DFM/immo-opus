'use client';

import { useState } from 'react';
import { StepProps } from '../types';
import { validateStep3 } from '../validation';
import { DEFAULT_VALUES } from '../constants';

export function TimeConfiguration({ formData, updateFormData, onNext, onBack }: StepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const validationError = validateStep3(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onNext();
  };

  const daysToSeconds = (days: number) => days * 24 * 60 * 60;
  const secondsToDays = (seconds: number) => seconds / (24 * 60 * 60);

  const presetDays = [1, 3, 7, 14, 30];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Time Configuration</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Set the borrowing time limit for Market Makers</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Borrow Time Limit
          </label>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {presetDays.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => updateFormData({ borrowTimeLimit: daysToSeconds(days) })}
                className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                  formData.borrowTimeLimit === daysToSeconds(days)
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-500'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300'
                }`}
              >
                {days} {days === 1 ? 'day' : 'days'}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="30"
              value={secondsToDays(formData.borrowTimeLimit)}
              onChange={(e) => updateFormData({ borrowTimeLimit: daysToSeconds(parseInt(e.target.value)) })}
              className="flex-1 dark:bg-gray-700"
            />
            <div className="w-20 text-center">
              <span className="text-2xl font-semibold dark:text-white">{secondsToDays(formData.borrowTimeLimit)}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 block">days</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">What is the borrow time limit?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This is the maximum time Market Makers have to repay borrowed tokens. After this period expires, 
            the Project Owner can use emergency withdraw to recover any remaining tokens.
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mt-2">
            <li>Minimum: 1 day</li>
            <li>Maximum: 30 days</li>
            <li>Default: 7 days</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/50 p-4 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            <strong>Important:</strong> Choose this carefully. A shorter time limit reduces risk but may limit MM operations. 
            A longer time limit gives MMs more flexibility but increases your exposure.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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