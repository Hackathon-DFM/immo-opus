'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseUnits } from 'viem';
import { TokenSelection } from './steps/token-selection';
import { PoolConfiguration } from './steps/pool-configuration';
import { TimeConfiguration } from './steps/time-configuration';
import { ReviewSubmit } from './steps/review-submit';
import { ProjectFormData, PoolMode, TransactionStatus } from './types';
import { DEFAULT_VALUES, priceToUsdc } from './constants';
import { useCreateProject } from '@/lib/hooks/use-create-project';
import { getContractAddresses } from '@/src/config/contracts';

const TOTAL_STEPS = 4;

export function MultiStepForm() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
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
  
  const { isSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  // Debug contract addresses
  const contractAddresses = getContractAddresses(chainId || 421614);
  console.log('Current contract addresses:', contractAddresses);

  // Handle transaction status updates
  useEffect(() => {
    if (isSuccess && transactionHash) {
      console.log('Transaction confirmed successfully:', transactionHash);
      setTransactionStatus(TransactionStatus.SUCCESS);
    }
  }, [isSuccess, transactionHash]);

  useEffect(() => {
    if (isTxError && transactionHash) {
      console.log('Transaction failed:', transactionHash);
      setError('Transaction failed to confirm');
      setTransactionStatus(TransactionStatus.ERROR);
    }
  }, [isTxError, transactionHash]);

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
    console.log('=== FORM SUBMIT DEBUG ===');
    console.log('Connected:', isConnected);
    console.log('Address:', address);
    console.log('Chain ID:', chainId);
    console.log('Form data:', formData);

    // Validation checks with better error messages
    if (!isConnected || !address) {
      setError('Please connect your wallet');
      return;
    }

    if (chainId !== 421614) {
      setError('Please switch to Arbitrum Sepolia network (Chain ID: 421614)');
      return;
    }

    // Validate form data
    if (!formData.name || !formData.symbol || !formData.description) {
      setError('Please fill in all required fields (name, symbol, description)');
      return;
    }

    if (formData.name.length < 2) {
      setError('Token name must be at least 2 characters');
      return;
    }

    if (formData.symbol.length < 2) {
      setError('Token symbol must be at least 2 characters');
      return;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    try {
      setError(undefined);
      setTransactionStatus(TransactionStatus.PENDING);
      
      const params = {
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
      };

      console.log('Calling createProject with params:', params);
      
      const hash = await createProject(params);
      
      console.log('Transaction submitted successfully:', hash);
      setTransactionHash(hash);
      setTransactionStatus(TransactionStatus.CONFIRMING);
    } catch (err) {
      console.error('Transaction failed:', err);
      
      // Better error handling
      let errorMessage = 'Transaction failed';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific error cases
        if (err.message.includes('User rejected')) {
          errorMessage = 'Transaction was cancelled by user';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to complete transaction';
        } else if (err.message.includes('not configured')) {
          errorMessage = 'Contract not properly configured. Please contact support.';
        }
      }
      
      setError(errorMessage);
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
            isSubmitting={transactionStatus === TransactionStatus.PENDING || transactionStatus === TransactionStatus.CONFIRMING}
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