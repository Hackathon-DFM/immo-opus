'use client';

import { useState } from 'react';
import { useAllProjects } from '@/lib/hooks/use-projects';
import { useDirectPool, useTokenInfo } from '@/lib/hooks/use-direct-pool';
import { formatUnits } from 'viem';

interface ProjectRowProps {
  projectAddress: `0x${string}`;
  onSelect: (address: `0x${string}`) => void;
}

// Wrapper component that only renders registered projects
function WhitelistedProjectRow({ projectAddress, onSelect }: ProjectRowProps) {
  const { isRegistered } = useDirectPool(projectAddress);
  
  // Only render if MM is registered for this project
  if (!isRegistered) {
    return null;
  }
  
  return <ProjectRow projectAddress={projectAddress} onSelect={onSelect} />;
}

function ProjectRow({ projectAddress, onSelect }: ProjectRowProps) {
  const {
    isRegistered,
    isFinalized,
    mmAllocation,
    tokenAddress,
    initialPrice,
    borrowedAmount,
    maxBorrowAmount,
  } = useDirectPool(projectAddress);

  const { name, symbol } = useTokenInfo(tokenAddress);

  const allocationFormatted = mmAllocation
    ? formatUnits(mmAllocation as bigint, 18)
    : '0';
  const borrowedFormatted = borrowedAmount
    ? formatUnits(borrowedAmount as bigint, 18)
    : '0';
  const availableFormatted = maxBorrowAmount
    ? formatUnits(maxBorrowAmount as bigint, 18)
    : '0';
  const priceFormatted = initialPrice
    ? formatUnits(initialPrice as bigint, 6)
    : '0';

  const canBorrow = isRegistered && isFinalized && maxBorrowAmount > BigInt(0);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{symbol}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        ${priceFormatted}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {parseFloat(allocationFormatted).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {(
          parseFloat(availableFormatted) - parseFloat(borrowedFormatted)
        ).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {/* Not Registered badge commented out - all shown projects are registered now
          {!isRegistered && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              Not Registered
            </span>
          )}
          */}
          {isRegistered && !isFinalized && (
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400 rounded-full">
              Pending Finalization
            </span>
          )}
          {isRegistered && isFinalized && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 rounded-full">
              Active
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onSelect(projectAddress)}
          disabled={!canBorrow}
          className={`${
            canBorrow
              ? 'text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300'
              : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {canBorrow
            ? 'Borrow'
            : 'No Allocation'
            /* Removed 'Not Available' option since we only show registered projects now */}
        </button>
      </td>
    </tr>
  );
}

interface AvailableProjectsProps {
  onSelectProject: (address: `0x${string}`) => void;
}

// Component to render whitelisted projects with empty state handling
function WhitelistedProjectsList({ 
  projects, 
  onSelectProject 
}: { 
  projects: { address: `0x${string}` }[], 
  onSelectProject: (address: `0x${string}`) => void 
}) {
  // For now, just render all projects with the wrapper
  // The WhitelistedProjectRow will handle filtering by returning null for non-registered
  // In a production app, we might want to track this differently
  return (
    <>
      {projects.map((project) => (
        <WhitelistedProjectRow
          key={project.address}
          projectAddress={project.address}
          onSelect={onSelectProject}
        />
      ))}
    </>
  );
}

export function AvailableProjects({ onSelectProject }: AvailableProjectsProps) {
  const { projects, isLoading } = useAllProjects();
  const [filter, setFilter] = useState<'all' | 'available' | 'active'>('all');

  // Filter only Direct Pool projects
  const directPoolProjects = projects.filter((p) => p.mode === 'DIRECT_POOL');

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Whitelisted Projects
          </h2>
          {/* <div className="flex space-x-2">
            {(['all', 'available', 'active'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div> */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Initial Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Allocation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Available
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {directPoolProjects.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No Direct Pool projects available
                </td>
              </tr>
            ) : (
              <WhitelistedProjectsList 
                projects={directPoolProjects}
                onSelectProject={onSelectProject}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
