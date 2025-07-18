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
          <span className="font-permanent-marker bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">IMMO</span>
          <span className="block text-2xl sm:text-3xl md:text-4xl mt-2 font-montserrat font-medium">Initial Market Making Offering</span>
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
            <p className="font-medium text-gray-500 dark:text-gray-400">Connect your wallet to get started</p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Direct Pool</h3>
          <p className="font-medium text-gray-600 dark:text-gray-300">
            Launch with immediate market maker access. MMs can borrow tokens directly
            and start trading on CLOB DEXs.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bonding Curve</h3>
          <p className="font-medium text-gray-600 dark:text-gray-300">
            Start with price discovery through AMM. Automatically graduates to Direct Pool
            when target market cap is reached.
          </p>
        </div>
      </div>

      {/* Projects List Placeholder */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Projects</h2>
        </div>
        <div className="p-6">
          <p className="font-medium text-gray-500 dark:text-gray-400 text-center py-8">
            No projects yet. Be the first to create one!
          </p>
        </div>
      </div>
    </div>
  );
}
