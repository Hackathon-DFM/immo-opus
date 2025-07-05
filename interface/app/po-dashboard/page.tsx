'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { usePonderProjectsByOwner } from '../../lib/hooks/use-ponder-projects';
import { useMarketMakers } from '../../lib/hooks/use-market-makers';
import { Project } from '../../lib/graphql/client';


function StatusBadge({ status }: { status: string }) {
  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'Graduated': 'bg-blue-100 text-blue-800',
    'MM Registration': 'bg-yellow-100 text-yellow-800',
    'Borrowing': 'bg-purple-100 text-purple-800',
    'Registered': 'bg-gray-100 text-gray-800',
    'Expired': 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
      {status}
    </span>
  );
}

function ProjectCard({ 
  project 
}: { 
  project: Project;
}) {
  const [showMMManagement, setShowMMManagement] = useState(false);
  const [newMMAddress, setNewMMAddress] = useState('');

  // Only use market makers hook for DirectPool projects
  const isDirectPool = project.mode === 'DIRECT_POOL';
  
  const { 
    marketMakers, 
    isLoading: isLoadingMMs, 
    isFinalized: contractIsFinalized,
    totalLiquidity: contractTotalLiquidity,
    availableLiquidity: contractAvailableLiquidity,
    registerMM,
    unregisterMM,
    finalizeMMs,
    emergencyWithdraw,
    pendingTransaction
  } = isDirectPool ? useMarketMakers(project.address as `0x${string}`) : {
    marketMakers: [],
    isLoading: false,
    isFinalized: false,
    totalLiquidity: BigInt(0),
    availableLiquidity: BigInt(0),
    registerMM: async () => {},
    unregisterMM: async () => {},
    finalizeMMs: async () => {},
    emergencyWithdraw: async () => {},
    pendingTransaction: null
  };

  // Prefer Ponder data if available, fallback to contract data
  const isFinalized = project.isFinalized;
  const totalLiquidity = project.totalLiquidity ? BigInt(project.totalLiquidity) : contractTotalLiquidity;
  const availableLiquidity = project.availableLiquidity ? BigInt(project.availableLiquidity) : contractAvailableLiquidity;

  const handleRegisterMM = async () => {
    if (!newMMAddress || !newMMAddress.startsWith('0x') || newMMAddress.length !== 42) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    // Check if MM is already registered
    const isAlreadyRegistered = marketMakers.some(mm => 
      mm.address.toLowerCase() === newMMAddress.toLowerCase()
    );
    
    if (isAlreadyRegistered) {
      alert('This address is already registered as a Market Maker');
      return;
    }

    try {
      await registerMM(newMMAddress as `0x${string}`);
      setNewMMAddress('');
    } catch (error) {
      console.error('Failed to register MM:', error);
    }
  };

  const handleFinalizeMMs = async () => {
    if (marketMakers.length === 0) {
      alert('Please register at least one Market Maker before finalizing');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to finalize the Market Makers? This action cannot be undone.\n\n` +
      `Total MMs: ${marketMakers.length}\n` +
      `Once finalized, you cannot add or remove Market Makers.`
    );

    if (confirmed) {
      try {
        await finalizeMMs();
        setShowMMManagement(false);
      } catch (error) {
        console.error('Failed to finalize MMs:', error);
      }
    }
  };

  // Calculate derived data
  const borrowedAmount = totalLiquidity - availableLiquidity;
  const status = project.graduated ? 'Graduated' : 
                 project.isFinalized ? 'Active' : 'MM Registration';
  
  const timeLimit = project.borrowTimeLimit ? 
    Math.floor(project.borrowTimeLimit / (24 * 60 * 60)) : 0; // Convert seconds to days

  if (isLoadingMMs) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Project Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {project.token.name || 'Unknown Token'}
          </h3>
          <p className="text-sm text-gray-600">
            {project.token.symbol || 'UNK'} • {project.mode.replace('_', ' ')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {project.address.slice(0, 6)}...{project.address.slice(-4)}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {isDirectPool ? (
          <>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Liquidity</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalLiquidity ? `$${Number(formatUnits(totalLiquidity, 6)).toLocaleString()}` : '$0'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Available</p>
              <p className="text-lg font-semibold text-gray-900">
                {availableLiquidity ? `$${Number(formatUnits(availableLiquidity, 6)).toLocaleString()}` : '$0'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Borrowed</p>
              <p className="text-lg font-semibold text-gray-900">
                {borrowedAmount ? `$${Number(formatUnits(borrowedAmount, 6)).toLocaleString()}` : '$0'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time Limit</p>
              <p className="text-lg font-semibold text-gray-900">{timeLimit} days</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Price</p>
              <p className="text-lg font-semibold text-gray-900">
                {project.currentPrice ? `$${Number(formatUnits(BigInt(project.currentPrice), 6)).toFixed(4)}` : '$0'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Market Cap</p>
              <p className="text-lg font-semibold text-gray-900">
                {project.currentMarketCap ? `$${Number(formatUnits(BigInt(project.currentMarketCap), 6)).toLocaleString()}` : '$0'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Target Cap</p>
              <p className="text-lg font-semibold text-gray-900">
                {project.targetMarketCap ? `$${Number(formatUnits(BigInt(project.targetMarketCap), 6)).toLocaleString()}` : '$0'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {project.currentMarketCap && project.targetMarketCap 
                  ? `${Math.round((Number(project.currentMarketCap) / Number(project.targetMarketCap)) * 100)}%`
                  : '0%'
                }
              </p>
            </div>
          </>
        )}
      </div>

      {/* MM Management Section - Only for DirectPool */}
      {isDirectPool && (
        <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">
            Market Makers ({marketMakers.length})
            {isFinalized && <span className="ml-2 text-xs text-green-600">(Finalized)</span>}
          </h4>
          {!isFinalized && (
            <button
              onClick={() => setShowMMManagement(!showMMManagement)}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              {showMMManagement ? 'Hide' : 'Manage MMs'}
            </button>
          )}
        </div>

        {/* Finalized Info */}
        {isFinalized && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-medium">Market Makers have been finalized</p>
                <p className="mt-1">MMs can now borrow tokens up to their allocation and start trading on CLOB exchanges.</p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Closed Info */}
        {!isFinalized && marketMakers.length > 0 && !showMMManagement && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              Registration is open. {marketMakers.length} MM{marketMakers.length > 1 ? 's' : ''} registered. Click "Manage MMs" to add more or finalize.
            </p>
          </div>
        )}

        {/* Transaction Status */}
        {pendingTransaction && (
          <div className={`border rounded-lg p-3 mb-4 ${
            pendingTransaction.status === 'error' 
              ? 'bg-red-50 border-red-200' 
              : pendingTransaction.status === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center">
              {pendingTransaction.status === 'pending' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              )}
              {pendingTransaction.status === 'success' && (
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {pendingTransaction.status === 'error' && (
                <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={`text-sm ${
                pendingTransaction.status === 'error' 
                  ? 'text-red-800' 
                  : pendingTransaction.status === 'success'
                  ? 'text-green-800'
                  : 'text-blue-800'
              }`}>
                {pendingTransaction.status === 'pending' && (
                  pendingTransaction.type === 'register' ? 'Registering Market Maker...' :
                  pendingTransaction.type === 'unregister' ? 'Removing Market Maker...' :
                  pendingTransaction.type === 'finalize' ? 'Finalizing Market Makers...' :
                  'Processing transaction...'
                )}
                {pendingTransaction.status === 'success' && (
                  pendingTransaction.type === 'register' ? 'Market Maker registered successfully!' :
                  pendingTransaction.type === 'unregister' ? 'Market Maker removed successfully!' :
                  pendingTransaction.type === 'finalize' ? 'Market Makers finalized successfully!' :
                  'Transaction completed!'
                )}
                {pendingTransaction.status === 'error' && `Error: ${pendingTransaction.error}`}
              </span>
            </div>
          </div>
        )}

        {/* MM Registration Form */}
        {showMMManagement && !isFinalized && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0x... Market Maker Address"
                value={newMMAddress}
                onChange={(e) => setNewMMAddress(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button 
                onClick={handleRegisterMM}
                disabled={!newMMAddress || newMMAddress.length !== 42}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Register
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={handleFinalizeMMs}
                disabled={marketMakers.length === 0}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Finalize MMs
              </button>
              <button 
                onClick={() => setShowMMManagement(false)}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
            
            {/* Allocation Info */}
            {marketMakers.length > 0 && totalLiquidity > BigInt(0) && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <p className="font-medium mb-1">Allocation Info:</p>
                <p>Each MM will be able to borrow up to: 
                  <span className="font-semibold ml-1">
                    ${Number(formatUnits(totalLiquidity / BigInt(marketMakers.length), 6)).toLocaleString()}
                  </span>
                </p>
                <p className="mt-1 text-blue-600">Total Pool / Number of MMs = Individual Allocation</p>
              </div>
            )}
          </div>
        )}

        {/* MM List */}
        <div className="space-y-3">
          {marketMakers.length > 0 ? marketMakers.map((mm) => (
            <div key={mm.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-900">
                    {mm.address.slice(0, 6)}...{mm.address.slice(-4)}
                  </p>
                  <StatusBadge status={mm.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Allocation:</span> 
                    ${mm.allocation ? Number(formatUnits(mm.allocation, 6)).toLocaleString() : '0'}
                  </div>
                  <div>
                    <span className="font-medium">Borrowed:</span> 
                    ${mm.borrowedAmount ? Number(formatUnits(mm.borrowedAmount, 6)).toLocaleString() : '0'}
                  </div>
                  <div>
                    <span className="font-medium">P&L:</span> 
                    <span className={mm.pnl >= BigInt(0) ? 'text-green-600' : 'text-red-600'}>
                      ${mm.pnl >= BigInt(0) ? '+' : ''}
                      {mm.pnl ? Number(formatUnits(mm.pnl, 6)).toLocaleString() : '0'}
                    </span>
                  </div>
                  {mm.timeRemaining !== 0 && (
                    <div>
                      <span className="font-medium">Time Left:</span> 
                      <span className={mm.timeRemaining < 0 ? 'text-red-600' : 'text-gray-600'}>
                        {Math.abs(mm.timeRemaining).toFixed(1)} days
                        {mm.timeRemaining < 0 ? ' (expired)' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* MM Actions */}
              <div className="flex gap-2">
                {mm.status === 'Expired' && (
                  <button 
                    onClick={() => emergencyWithdraw(mm.address)}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Emergency Withdraw
                  </button>
                )}
                {!isFinalized && (
                  <button 
                    onClick={() => unregisterMM(mm.address)}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-4">
              No market makers registered yet
            </div>
          )}
        </div>
      </div>
      )}

      {/* Bonding Curve Info Section */}
      {!isDirectPool && (
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Bonding Curve Status</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Graduation Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {project.currentMarketCap && project.targetMarketCap 
                  ? `${Math.round((Number(project.currentMarketCap) / Number(project.targetMarketCap)) * 100)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ 
                  width: project.currentMarketCap && project.targetMarketCap 
                    ? `${Math.min(100, Math.round((Number(project.currentMarketCap) / Number(project.targetMarketCap)) * 100))}%`
                    : '0%'
                }}
              />
            </div>
            {project.graduated && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  🎉 This project has graduated! It is now operating as a Direct Pool.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Actions */}
      <div className="border-t pt-4 mt-4">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
            View Details
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200">
            Download Report
          </button>
          {project.mode === 'BONDING_CURVE' && status !== 'Graduated' && (
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Check Graduation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PODashboard() {
  const [filter, setFilter] = useState<'all' | 'active' | 'mm-registration' | 'graduated'>('all');
  const { address, isConnected } = useAccount();

  // Get user's projects from Ponder
  const { data: projects = [], isLoading: isLoadingProjects } = usePonderProjectsByOwner(address);

  // Filter projects based on status
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    
    const status = project.graduated ? 'graduated' : 
                   project.isFinalized ? 'active' : 'mm-registration';
    
    return filter === status;
  });

  // Calculate totals from real data
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.isFinalized && !p.graduated).length;
  const totalLiquidity = projects.reduce((sum, p) => 
    sum + (p.totalLiquidity ? Number(formatUnits(BigInt(p.totalLiquidity), 6)) : 0), 0
  );
  const totalBorrowed = projects.reduce((sum, p) => {
    // Calculate borrowed amount from available vs total liquidity for direct pools
    if (p.totalLiquidity && p.availableLiquidity) {
      const borrowed = BigInt(p.totalLiquidity) - BigInt(p.availableLiquidity);
      return sum + Number(formatUnits(borrowed, 6));
    }
    return sum;
  }, 0);

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">Connect your wallet to view your IMMO projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Owner Dashboard</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Create New Project
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              {isLoadingProjects ? (
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              {isLoadingProjects ? (
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Liquidity</p>
              {isLoadingProjects ? (
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">${totalLiquidity.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
              {isLoadingProjects ? (
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">${totalBorrowed.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Projects' },
            { key: 'active', label: 'Active' },
            { key: 'mm-registration', label: 'MM Registration' },
            { key: 'graduated', label: 'Graduated' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as 'all' | 'active' | 'mm-registration' | 'graduated')}
              className={`px-4 py-2 text-sm rounded-md font-medium ${
                filter === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {isLoadingProjects ? (
          // Loading skeleton
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6 mb-4"></div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard 
              key={project.address} 
              project={project}
            />
          ))
        ) : projects.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first IMMO project.</p>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Create Project
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects match your filter</h3>
            <p className="text-gray-600 mb-6">Try selecting a different status filter.</p>
            <button 
              onClick={() => setFilter('all')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Show All Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
}