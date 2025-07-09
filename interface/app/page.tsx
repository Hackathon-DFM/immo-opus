'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { usePonderAllProjects } from '../lib/hooks/use-ponder-projects';
import { useMultipleTokenMetadata } from '../lib/hooks/use-token-metadata';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'direct_pool' | 'bonding_curve'>('all');
  
  // Fetch all projects from Ponder
  const { data: projects = [], isLoading } = usePonderAllProjects();
  
  // Fetch token metadata for all projects
  const tokenAddresses = projects.map(p => p.tokenAddress as `0x${string}`);
  const { data: tokenMetadataList = [] } = useMultipleTokenMetadata(tokenAddresses);
  
  // Create a map for easy lookup
  const tokenMetadataMap = tokenMetadataList.reduce((acc, metadata, index) => {
    if (metadata && projects[index]) {
      acc[projects[index].tokenAddress] = metadata;
    }
    return acc;
  }, {} as Record<string, any>);
  
  // Filter projects based on selected filter
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'direct_pool') return project.mode === 'DIRECT_POOL';
    if (filter === 'bonding_curve') return project.mode === 'BONDING_CURVE';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          IMMO - Initial Market Making Offering
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Launch tokens with integrated market making capabilities on Arbitrum
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          {isConnected ? (
            <Link
              href="/create"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              Create Project
            </Link>
          ) : (
            <p className="text-gray-500">Connect your wallet to get started</p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Pool</h3>
          <p className="text-gray-600">
            Launch with immediate market maker access. MMs can borrow tokens directly
            and start trading on CLOB DEXs.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bonding Curve</h3>
          <p className="text-gray-600">
            Start with price discovery through AMM. Automatically graduates to Direct Pool
            when target market cap is reached.
          </p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setFilter('direct_pool')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                  filter === 'direct_pool'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Direct Pool
              </button>
              <button
                onClick={() => setFilter('bonding_curve')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                  filter === 'bonding_curve'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Bonding Curve
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-20 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.address}
                  onClick={() => router.push(`/project/${project.address}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tokenMetadataMap[project.tokenAddress]?.name || 'Loading...'}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({tokenMetadataMap[project.tokenAddress]?.symbol || '...'})
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.mode === 'BONDING_CURVE' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {project.mode.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.address.slice(0, 6)}...{project.address.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      {project.mode === 'BONDING_CURVE' ? (
                        <>
                          <p className="text-sm text-gray-500">Current Price</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${project.currentPrice ? Number(formatUnits(BigInt(project.currentPrice), 6)).toFixed(4) : '0.0000'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500">Total Liquidity</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${project.totalLiquidity ? Number(formatUnits(BigInt(project.totalLiquidity), 6)).toLocaleString() : '0'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {projects.length === 0 
                ? "No projects yet. Be the first to create one!"
                : `No ${filter === 'direct_pool' ? 'Direct Pool' : filter === 'bonding_curve' ? 'Bonding Curve' : ''} projects found.`
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
