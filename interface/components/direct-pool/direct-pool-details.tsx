'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { Project } from '@/lib/graphql/client';
import { useMarketMakers } from '@/lib/hooks/use-market-makers';

interface DirectPoolDetailsProps {
  project: Project;
}

export function DirectPoolDetails({ project }: DirectPoolDetailsProps) {
  const { address: userAddress } = useAccount();
  const [userRole, setUserRole] = useState<'owner' | 'mm' | 'user'>('user');

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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {project.token.name}
            </h1>
            <p className="text-lg text-gray-600">
              {project.token.symbol} • Direct Pool
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Contract Address</p>
            <p className="text-sm font-mono text-gray-700">
              {project.address.slice(0, 6)}...{project.address.slice(-4)}
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mt-4">
          {userRole === 'owner' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              Project Owner
            </span>
          )}
          {userRole === 'mm' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Registered Market Maker
            </span>
          )}
        </div>
      </div>

      {/* Pool Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pool Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Liquidity</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalLiquidity ? Number(formatUnits(totalLiquidity, 6)).toLocaleString() : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Available</p>
            <p className="text-2xl font-bold text-green-600">
              ${availableLiquidity ? Number(formatUnits(availableLiquidity, 6)).toLocaleString() : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Borrowed</p>
            <p className="text-2xl font-bold text-orange-600">
              ${borrowedAmount ? Number(formatUnits(borrowedAmount, 6)).toLocaleString() : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Initial Price</p>
            <p className="text-2xl font-bold text-gray-900">
              ${project.initialPrice ? Number(formatUnits(BigInt(project.initialPrice), 6)).toFixed(4) : '0'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Borrow Time Limit</p>
            <p className="text-lg font-semibold text-gray-900">{borrowTimeLimit} days</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Supply</p>
            <p className="text-lg font-semibold text-gray-900">
              {project.token.totalSupply ? Number(formatUnits(BigInt(project.token.totalSupply), 18)).toLocaleString() : '0'} {project.token.symbol}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="text-lg font-semibold text-gray-900">
              {isFinalized ? (
                <span className="text-green-600">Finalized</span>
              ) : (
                <span className="text-yellow-600">MM Registration Open</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Market Makers Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Market Makers ({marketMakers.length})
          </h2>
          {isFinalized && (
            <span className="text-sm text-green-600">Registration Closed</span>
          )}
        </div>

        {isLoadingMMs ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : marketMakers.length > 0 ? (
          <div className="space-y-3">
            {marketMakers.map((mm) => (
              <div key={mm.address} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {mm.address.slice(0, 6)}...{mm.address.slice(-4)}
                    </p>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>Allocation: ${mm.allocation ? Number(formatUnits(mm.allocation, 6)).toLocaleString() : '0'}</span>
                      <span>Borrowed: ${mm.borrowedAmount ? Number(formatUnits(mm.borrowedAmount, 6)).toLocaleString() : '0'}</span>
                      {mm.timeRemaining !== undefined && mm.timeRemaining !== 0 && (
                        <span className={mm.timeRemaining < 0 ? 'text-red-600' : ''}>
                          Time: {Math.abs(mm.timeRemaining).toFixed(1)} days {mm.timeRemaining < 0 ? '(expired)' : 'left'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    mm.status === 'Active' ? 'bg-green-100 text-green-800' :
                    mm.status === 'Expired' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mm.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No market makers registered yet
          </p>
        )}
      </div>

      {/* How It Works - For Regular Users */}
      {userRole === 'user' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How Direct Pool Works</h3>
          <div className="space-y-2 text-blue-800">
            <p>• This is a Direct Pool project where registered Market Makers borrow tokens to trade on external CLOB exchanges</p>
            <p>• Unlike Bonding Curve projects, trading doesn't happen through this interface</p>
            <p>• Market Makers keep profits from their trading activities, while losses are absorbed by the Project Owner</p>
            <p>• The pool maintains liquidity in USDC that MMs can borrow against</p>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Interested in becoming a Market Maker?</p>
            <p className="text-sm text-gray-600">Contact the project owner: {project.owner.address}</p>
          </div>
        </div>
      )}

      {/* Owner Controls */}
      {userRole === 'owner' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Project Owner Controls</h3>
          {!isFinalized ? (
            <div>
              <p className="text-purple-800 mb-4">
                You can register Market Makers for your project. Once finalized, MMs can begin borrowing tokens.
              </p>
              <button
                onClick={() => window.location.href = '/po-dashboard'}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Manage in PO Dashboard
              </button>
            </div>
          ) : (
            <div>
              <p className="text-purple-800 mb-4">
                Market Makers have been finalized. Monitor their activity and manage emergency withdrawals if needed.
              </p>
              <button
                onClick={() => window.location.href = '/po-dashboard'}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                View in PO Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* MM Controls */}
      {userRole === 'mm' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Market Maker Controls</h3>
          {isFinalized ? (
            <div>
              <p className="text-blue-800 mb-4">
                You are a registered Market Maker for this project. You can borrow tokens to trade on external CLOB exchanges.
              </p>
              <button
                onClick={() => window.location.href = '/mm-dashboard'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Manage in MM Dashboard
              </button>
            </div>
          ) : (
            <p className="text-blue-800">
              You are registered as a Market Maker. Waiting for the Project Owner to finalize MMs before you can start borrowing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}