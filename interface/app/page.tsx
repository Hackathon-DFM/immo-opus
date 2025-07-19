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
  const [filter, setFilter] = useState<'all' | 'direct_pool' | 'bonding_curve'>(
    'all'
  );

  // Fetch all projects from Ponder
  const { data: projects = [], isLoading } = usePonderAllProjects();

  // Fetch token metadata for all projects
  const tokenAddresses = projects.map((p) => p.tokenAddress as `0x${string}`);
  const { data: tokenMetadataList = [] } =
    useMultipleTokenMetadata(tokenAddresses);

  // Create a map for easy lookup
  const tokenMetadataMap = tokenMetadataList.reduce((acc, metadata, index) => {
    if (metadata && projects[index]) {
      acc[projects[index].tokenAddress] = metadata;
    }
    return acc;
  }, {} as Record<string, any>);

  // Filter projects based on selected filter
  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    if (filter === 'direct_pool') return project.mode === 'DIRECT_POOL';
    if (filter === 'bonding_curve') return project.mode === 'BONDING_CURVE';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          <span className="font-permanent-marker bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            IMMO
          </span>
          <span className="block text-2xl sm:text-3xl md:text-4xl mt-2 font-montserrat font-medium">
            Initial Market Making Offering
          </span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base font-medium text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Launch tokens with integrated market making capabilities on Arbitrum
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          {isConnected ? (
            <Link
              href="/create"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 md:py-4 md:text-lg md:px-10 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-gradient"
            >
              Create Project
            </Link>
          ) : (
            <p className="font-medium text-gray-500 dark:text-gray-400">
              Connect your wallet to get started
            </p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Direct Pool
          </h3>
          <p className="font-medium text-gray-600 dark:text-gray-300">
            Launch with immediate market maker access. MMs can borrow tokens
            directly and start trading on CLOB DEXs.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300 hover:shadow-lg  hover:border-blue-300 dark:hover:border-blue-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Bonding Curve
          </h3>
          <p className="font-medium text-gray-600 dark:text-gray-300">
            Start with price discovery through AMM. Automatically graduates to
            Direct Pool when target market cap is reached.
          </p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Projects
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setFilter('direct_pool')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                  filter === 'direct_pool'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Direct Pool
              </button>
              <button
                onClick={() => setFilter('bonding_curve')}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                  filter === 'bonding_curve'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
                  <div className="bg-gray-200 dark:bg-gray-800 h-20 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.address}
                  onClick={() => router.push(`/project/${project.address}`)}
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-gray-900/50 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {tokenMetadataMap[project.tokenAddress]?.name ||
                            'Loading...'}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          (
                          {tokenMetadataMap[project.tokenAddress]?.symbol ||
                            '...'}
                          )
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium hover:scale-105 transition-transform duration-200 ${
                            project.mode === 'BONDING_CURVE'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          }`}
                        >
                          {project.mode.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {project.address.slice(0, 6)}...
                        {project.address.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      {project.mode === 'BONDING_CURVE' ? (
                        <>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Current Price
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">
                            $
                            {project.currentPrice
                              ? (() => {
                                  const price = Number(
                                    formatUnits(BigInt(project.currentPrice), 6)
                                  );
                                  if (price < 0.000001) return price.toExponential(2);
                                  if (price >= 1000000) return (price / 1000000).toFixed(2) + 'M';
                                  if (price >= 1000) return (price / 1000).toFixed(2) + 'K';
                                  return price.toFixed(4);
                                })()
                              : '0.0000'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Liquidity
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">
                            $
                            {project.totalLiquidity
                              ? (() => {
                                  const liquidity = Number(
                                    formatUnits(BigInt(project.totalLiquidity), 6)
                                  );
                                  if (liquidity >= 1000000000) return (liquidity / 1000000000).toFixed(2) + 'B';
                                  if (liquidity >= 1000000) return (liquidity / 1000000).toFixed(2) + 'M';
                                  if (liquidity >= 1000) return (liquidity / 1000).toFixed(2) + 'K';
                                  return liquidity.toLocaleString();
                                })()
                              : '0'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-medium text-gray-500 dark:text-gray-400 text-center py-8">
              {projects.length === 0
                ? 'No projects yet. Be the first to create one!'
                : `No ${
                    filter === 'direct_pool'
                      ? 'Direct Pool'
                      : filter === 'bonding_curve'
                      ? 'Bonding Curve'
                      : ''
                  } projects found.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
