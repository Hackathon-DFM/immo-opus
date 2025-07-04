'use client';

import { useState } from 'react';
import { useAllProjects } from '@/lib/hooks/use-projects';
import { useDirectPool, useTokenInfo } from '@/lib/hooks/use-direct-pool';
import { formatUnits } from 'viem';

interface ProjectRowProps {
  projectAddress: `0x${string}`;
  onSelect: (address: `0x${string}`) => void;
}

function ProjectRow({ projectAddress, onSelect }: ProjectRowProps) {
  const { 
    isRegistered, 
    isFinalized, 
    mmAllocation, 
    tokenAddress,
    initialPrice,
    borrowedAmount,
    maxBorrowAmount
  } = useDirectPool(projectAddress);
  
  const { name, symbol } = useTokenInfo(tokenAddress);

  const allocationFormatted = mmAllocation ? formatUnits(mmAllocation, 18) : '0';
  const borrowedFormatted = borrowedAmount ? formatUnits(borrowedAmount, 18) : '0';
  const availableFormatted = maxBorrowAmount ? formatUnits(maxBorrowAmount, 18) : '0';
  const priceFormatted = initialPrice ? formatUnits(initialPrice, 6) : '0';

  const canBorrow = isRegistered && isFinalized && maxBorrowAmount > 0n;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{symbol}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${priceFormatted}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {parseFloat(allocationFormatted).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {parseFloat(availableFormatted).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {!isRegistered && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              Not Registered
            </span>
          )}
          {isRegistered && !isFinalized && (
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              Pending Finalization
            </span>
          )}
          {isRegistered && isFinalized && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
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
              ? 'text-blue-600 hover:text-blue-900'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          {canBorrow ? 'Borrow' : isRegistered ? 'No Allocation' : 'Not Available'}
        </button>
      </td>
    </tr>
  );
}

interface AvailableProjectsProps {
  onSelectProject: (address: `0x${string}`) => void;
}

export function AvailableProjects({ onSelectProject }: AvailableProjectsProps) {
  const { projects, isLoading } = useAllProjects();
  const [filter, setFilter] = useState<'all' | 'available' | 'active'>('all');

  // Filter only Direct Pool projects
  const directPoolProjects = projects.filter(p => p.mode === 'DIRECT_POOL');

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Available Projects</h2>
          <div className="flex space-x-2">
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
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Initial Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allocation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {directPoolProjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No Direct Pool projects available
                </td>
              </tr>
            ) : (
              directPoolProjects.map((project) => (
                <ProjectRow
                  key={project.address}
                  projectAddress={project.address}
                  onSelect={onSelectProject}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}