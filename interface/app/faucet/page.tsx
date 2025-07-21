'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { getContractAddresses } from '@/src/config/contracts';
import { MockUSDCABI } from '@/lib/contracts';
import { arbitrumSepolia } from 'viem/chains';

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('1000');
  
  const addresses = getContractAddresses(arbitrumSepolia.id);
  
  const { 
    data: hash,
    error,
    isPending,
    writeContract 
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = async () => {
    if (!address) return;
    
    writeContract({
      address: addresses.usdc as `0x${string}`,
      abi: MockUSDCABI,
      functionName: 'mint',
      args: [address, parseUnits(amount, 6)], // USDC has 6 decimals
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Test Token Faucet</h1>
      <p className="font-medium text-gray-600 dark:text-gray-400 mb-8">Get test tokens for IMMO protocol development and testing</p>
      
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-800 transition-all duration-300">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mint Mock USDC</h2>
        
        {!isConnected ? (
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please connect your wallet to use the faucet.</p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get test USDC tokens for testing IMMO protocol features on Arbitrum Sepolia.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="1000"
                  min="1"
                  max="10000"
                />
              </div>
              
              <button
                onClick={handleMint}
                disabled={isPending || isConfirming || !amount || Number(amount) <= 0}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Waiting for approval...' : 
                 isConfirming ? 'Minting...' : 
                 `Mint ${amount} USDC`}
              </button>
              
              {isSuccess && (
                <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-400">
                    Successfully minted {amount} USDC to your wallet!
                  </p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-400">
                    Error: {error.message}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Contract Address:</strong> {addresses.usdc}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <strong>Your Address:</strong> {address}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}