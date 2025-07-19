'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { Project } from '@/lib/graphql/client';
import { useMarketMakers } from '@/lib/hooks/use-market-makers';
import { useTokenMetadata } from '@/lib/hooks/use-token-metadata';

interface DirectPoolDetailsProps {
  project: Project;
}

export function DirectPoolDetails({ project }: DirectPoolDetailsProps) {
  const { address: userAddress } = useAccount();
  const [userRole, setUserRole] = useState<'owner' | 'mm' | 'user'>('user');
  
  // Format large numbers with appropriate units
  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    if (value < 0.01 && value > 0) return value.toFixed(6);
    return value.toFixed(2);
  };
  
  // Fetch token metadata in real-time
  const { data: tokenMetadata } = useTokenMetadata(project.tokenAddress as `0x${string}`);

  // Get MM data for this project
  const { 
    marketMakers, 
    isLoading: isLoadingMMs,
    isFinalized,
    totalLiquidity,
    availableLiquidity,
    registerMM,
    unregisterMM,
    finalizeMMs,
    borrowTokens,
    repayTokens,
    emergencyWithdraw,
    pendingTransaction
  } = useMarketMakers(project.address as `0x${string}`);

  // Determine user role
  useEffect(() => {
    if (!userAddress) {
      setUserRole('user');
      return;
    }

    if (project.owner.address.toLowerCase() === userAddress.toLowerCase()) {
      setUserRole('owner');
    } else if (marketMakers.some(mm => mm.address.toLowerCase() === userAddress.toLowerCase())) {
      setUserRole('mm');
    } else {
      setUserRole('user');
    }
  }, [userAddress, project.owner.address, marketMakers]);

  // Calculate borrowed amount
  const borrowedAmount = totalLiquidity - availableLiquidity;
  const borrowTimeLimit = project.borrowTimeLimit ? 
    Math.floor(project.borrowTimeLimit / (24 * 60 * 60)) : 0; // Convert to days

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {tokenMetadata?.name || 'Loading...'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {tokenMetadata?.symbol || '...'} • Direct Pool
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Contract Address</p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {project.address.slice(0, 6)}...{project.address.slice(-4)}
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mt-4">
          {userRole === 'owner' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
              Project Owner
            </span>
          )}
          {userRole === 'mm' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
              Registered Market Maker
            </span>
          )}
        </div>
      </div>

      {/* Pool Statistics */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pool Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Liquidity</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate tabular-nums" title={`$${totalLiquidity ? Number(formatUnits(totalLiquidity, 6)).toLocaleString() : '0'}`}>
              ${totalLiquidity ? formatLargeNumber(Number(formatUnits(totalLiquidity, 6))) : '0'}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</p>
            <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 truncate tabular-nums" title={`$${availableLiquidity ? Number(formatUnits(availableLiquidity, 6)).toLocaleString() : '0'}`}>
              ${availableLiquidity ? formatLargeNumber(Number(formatUnits(availableLiquidity, 6))) : '0'}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Borrowed</p>
            <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 truncate tabular-nums" title={`$${borrowedAmount ? Number(formatUnits(borrowedAmount, 6)).toLocaleString() : '0'}`}>
              ${borrowedAmount ? formatLargeNumber(Number(formatUnits(borrowedAmount, 6))) : '0'}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Initial Price</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate tabular-nums" title={`$${project.initialPrice ? Number(formatUnits(BigInt(project.initialPrice), 6)).toFixed(4) : '0'}`}>
              ${project.initialPrice ? Number(formatUnits(BigInt(project.initialPrice), 6)).toFixed(4) : '0'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Borrow Time Limit</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{borrowTimeLimit} days</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Supply</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={`${tokenMetadata?.totalSupply ? Number(formatUnits(tokenMetadata.totalSupply, tokenMetadata.decimals || 18)).toLocaleString() : '0'} ${tokenMetadata?.symbol || '...'}`}>
              {tokenMetadata?.totalSupply ? formatLargeNumber(Number(formatUnits(tokenMetadata.totalSupply, tokenMetadata.decimals || 18))) : '0'} {tokenMetadata?.symbol || '...'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {isFinalized ? (
                <span className="text-green-600 dark:text-green-400">Finalized</span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400">MM Registration Open</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Market Makers Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Market Makers ({marketMakers.length})
          </h2>
          {isFinalized && (
            <span className="text-sm text-green-600 dark:text-green-400">Registration Closed</span>
          )}
        </div>

        {isLoadingMMs ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : marketMakers.length > 0 ? (
          <div className="space-y-3">
            {marketMakers.map((mm) => (
              <div key={mm.address} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {mm.address.slice(0, 6)}...{mm.address.slice(-4)}
                    </p>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="truncate" title={`Allocation: $${mm.allocation ? Number(formatUnits(mm.allocation, 6)).toLocaleString() : '0'}`}>Allocation: ${mm.allocation ? formatLargeNumber(Number(formatUnits(mm.allocation, 6))) : '0'}</span>
                      <span className="truncate" title={`Borrowed: $${mm.borrowedAmount ? Number(formatUnits(mm.borrowedAmount, 6)).toLocaleString() : '0'}`}>Borrowed: ${mm.borrowedAmount ? formatLargeNumber(Number(formatUnits(mm.borrowedAmount, 6))) : '0'}</span>
                      {mm.timeRemaining !== undefined && mm.timeRemaining !== 0 && (
                        <span className={mm.timeRemaining < 0 ? 'text-red-600 dark:text-red-400' : ''}>
                          Time: {Math.abs(mm.timeRemaining).toFixed(1)} days {mm.timeRemaining < 0 ? '(expired)' : 'left'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    mm.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    mm.status === 'Expired' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                  }`}>
                    {mm.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No market makers registered yet
          </p>
        )}
      </div>

      {/* How It Works - For Regular Users */}
      {userRole === 'user' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">How Direct Pool Works</h3>
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            <p>• This is a Direct Pool project where registered Market Makers borrow tokens to trade on external CLOB exchanges</p>
            <p>• Unlike Bonding Curve projects, trading doesn't happen through this interface</p>
            <p>• Market Makers keep profits from their trading activities, while losses are absorbed by the Project Owner</p>
            <p>• The pool maintains liquidity in USDC that MMs can borrow against</p>
          </div>
          
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interested in becoming a Market Maker?</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Contact the project owner: {project.owner.address}</p>
          </div>
        </div>
      )}

      {/* Owner Controls */}
      {userRole === 'owner' && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">Project Owner Controls</h3>
          {!isFinalized ? (
            <div>
              <p className="text-purple-800 dark:text-purple-200 mb-4">
                You can register Market Makers for your project. Once finalized, MMs can begin borrowing tokens.
              </p>
              <button
                onClick={() => window.location.href = '/po-dashboard'}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
              >
                Manage in PO Dashboard
              </button>
            </div>
          ) : (
            <div>
              <p className="text-purple-800 dark:text-purple-200 mb-4">
                Market Makers have been finalized. Monitor their activity and manage emergency withdrawals if needed.
              </p>
              <button
                onClick={() => window.location.href = '/po-dashboard'}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
              >
                View in PO Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* MM Controls */}
      {userRole === 'mm' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Market Maker Controls</h3>
          {isFinalized ? (
            <div>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                You are a registered Market Maker for this project. You can borrow tokens to trade on external CLOB exchanges.
              </p>
              <button
                onClick={() => window.location.href = '/mm-dashboard'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Manage in MM Dashboard
              </button>
            </div>
          ) : (
            <p className="text-blue-800 dark:text-blue-200">
              You are registered as a Market Maker. Waiting for the Project Owner to finalize MMs before you can start borrowing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}