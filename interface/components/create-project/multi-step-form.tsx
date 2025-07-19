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

const STEP_CONFIG = [
  {
    label: 'Token',
    description: 'Setup',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Pool',
    description: 'Mode',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Time',
    description: 'Limit',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Review',
    description: 'Submit',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

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
      <div className="mb-20">
        <div className="flex items-center justify-between relative">
          {STEP_CONFIG.map((stepConfig, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isPending = stepNumber > currentStep;
            
            return (
              <div key={stepNumber} className="flex items-center flex-1">
                <div className="relative">
                  {/* Active step pulse animation */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-blue-400 dark:bg-blue-500 animate-ping opacity-20" />
                  )}
                  
                  {/* Step circle */}
                  <div
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-green-500 dark:bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={`${isActive ? 'scale-110' : ''} [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6`}>
                        {stepConfig.icon}
                      </div>
                    )}
                  </div>
                  
                  {/* Step label */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                    <p className={`text-sm font-semibold ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : isCompleted
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {stepConfig.label}
                    </p>
                    <p className="text-xs opacity-75 text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                      {stepConfig.description}
                    </p>
                  </div>
                </div>
                
                {/* Progress connector */}
                {stepNumber < TOTAL_STEPS && (
                  <div className="flex-1 mx-3 mt-6">
                    <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-blue-500'
                            : 'bg-transparent'
                        }`}
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div className="animate-in fade-in duration-300" key={currentStep}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}