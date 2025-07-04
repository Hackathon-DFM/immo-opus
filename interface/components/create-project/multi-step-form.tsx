'use client';

import { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { TokenSelection } from './steps/token-selection';
import { PoolConfiguration } from './steps/pool-configuration';
import { TimeConfiguration } from './steps/time-configuration';
import { ReviewSubmit } from './steps/review-submit';
import { ProjectFormData, PoolMode, TransactionStatus } from './types';
import { DEFAULT_VALUES, priceToUsdc } from './constants';
import { useCreateProject } from '@/lib/hooks/use-create-project';

const TOTAL_STEPS = 4;

export function MultiStepForm() {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [transactionStatus, setTransactionStatus] = useState(TransactionStatus.IDLE);
  const [error, setError] = useState<string | undefined>();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    isNewToken: true,
    mode: PoolMode.DIRECT_POOL,
    initialPrice: DEFAULT_VALUES.INITIAL_PRICE,
    borrowTimeLimit: DEFAULT_VALUES.BORROW_TIME_LIMIT,
  });

  const { createProject, isLoading } = useCreateProject();
  
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const updateFormData = (data: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setError(undefined);
      setTransactionStatus(TransactionStatus.PENDING);
      
      const hash = await createProject({
        isNewToken: formData.isNewToken,
        existingToken: formData.existingToken,
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        tokenAmount: formData.tokenAmount ? parseUnits(formData.tokenAmount, 18) : BigInt(0),
        mode: formData.mode,
        initialPrice: priceToUsdc(formData.initialPrice),
        targetMarketCap: formData.targetMarketCap 
          ? parseUnits(formData.targetMarketCap, 6) 
          : parseUnits(DEFAULT_VALUES.TARGET_MARKET_CAP, 6),
        borrowTimeLimit: BigInt(formData.borrowTimeLimit),
      });
      
      setTransactionHash(hash);
      setTransactionStatus(TransactionStatus.CONFIRMING);
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setTransactionStatus(TransactionStatus.ERROR);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TokenSelection
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <PoolConfiguration
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <TimeConfiguration
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ReviewSubmit
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isLoading || transactionStatus === TransactionStatus.CONFIRMING}
            transactionStatus={transactionStatus}
            transactionHash={transactionHash}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : step < currentStep
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`w-full h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">Token</span>
          <span className="text-xs text-gray-500">Pool Mode</span>
          <span className="text-xs text-gray-500">Time Limit</span>
          <span className="text-xs text-gray-500">Review</span>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        {renderStep()}
      </div>
    </div>
  );
}