'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          IMMO - Initial Market Making Offering
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Launch tokens with integrated market making capabilities on Arbitrum
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          {isConnected ? (
            <Link
              href="/create"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Create Project
            </Link>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Connect your wallet to get started</p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Direct Pool</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Launch with immediate market maker access. MMs can borrow tokens directly
            and start trading on CLOB DEXs.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bonding Curve</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Start with price discovery through AMM. Automatically graduates to Direct Pool
            when target market cap is reached.
          </p>
        </div>
      </div>

      {/* Projects List Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Projects</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No projects yet. Be the first to create one!
          </p>
        </div>
      </div>
    </div>
  );
}
