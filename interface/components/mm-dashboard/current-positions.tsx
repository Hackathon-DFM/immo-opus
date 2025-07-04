'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useAllProjects } from '@/lib/hooks/use-projects';
import { useDirectPool, useTokenInfo, useTokenBalance } from '@/lib/hooks/use-direct-pool';
import { RepayModal } from './repay-modal';

interface PositionRowProps {
  projectAddress: `0x${string}`;
  onRepay: (address: `0x${string}`) => void;
}

function PositionRow({ projectAddress, onRepay }: PositionRowProps) {
  const {
    borrowedAmount,
    tokenAddress,
    initialPrice,
    timeRemaining,
    borrowTimestamp,
  } = useDirectPool(projectAddress);

  const { name, symbol, decimals } = useTokenInfo(tokenAddress);
  const tokenBalance = useTokenBalance(tokenAddress);

  // Skip if no borrowed amount
  if (!borrowedAmount || borrowedAmount === BigInt(0)) return null;

  const borrowedFormatted = formatUnits(borrowedAmount as bigint, decimals);
  const balanceFormatted = formatUnits(tokenBalance as bigint, decimals);
  const priceFormatted = formatUnits(initialPrice as bigint, 6);
  const borrowedValue = parseFloat(borrowedFormatted) * parseFloat(priceFormatted);

  const timeRemainingDays = Math.floor(timeRemaining / (24 * 60 * 60));
  const timeRemainingHours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
  const isExpired = timeRemaining <= 0;
  const isUrgent = timeRemainingDays < 1;

  // Calculate P&L (simplified - in real app would track actual trading P&L)
  const currentValue = parseFloat(balanceFormatted) * parseFloat(priceFormatted);
  const pnl = currentValue - borrowedValue;
  const pnlPercentage = (pnl / borrowedValue) * 100;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{symbol}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {parseFloat(borrowedFormatted).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${borrowedValue.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {parseFloat(balanceFormatted).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center space-x-1">
          <span className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
          </span>
          <span className={`text-xs ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isExpired 
            ? 'bg-red-100 text-red-800' 
            : isUrgent 
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {isExpired 
            ? 'Expired' 
            : `${timeRemainingDays}d ${timeRemainingHours}h`
          }
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onRepay(projectAddress)}
          className="text-blue-600 hover:text-blue-900"
        >
          Repay
        </button>
      </td>
    </tr>
  );
}

export function CurrentPositions() {
  const { address } = useAccount();
  const { projects } = useAllProjects();
  const [selectedProject, setSelectedProject] = useState<`0x${string}` | null>(null);

  // Filter only Direct Pool projects
  const directPoolProjects = projects.filter(p => p.mode === 'DIRECT_POOL');

  const handleRepay = (projectAddress: `0x${string}`) => {
    setSelectedProject(projectAddress);
  };

  const handleCloseRepay = () => {
    setSelectedProject(null);
  };

  if (!address) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Positions</h2>
        <p className="text-gray-500 text-center py-8">Connect wallet to view positions</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Current Positions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrowed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {directPoolProjects.map((project) => (
                <PositionRow
                  key={project.address}
                  projectAddress={project.address}
                  onRepay={handleRepay}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Positions shown are for Direct Pool projects only
            </span>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View CLOB Trading →
            </button>
          </div>
        </div>
      </div>

      {selectedProject && (
        <RepayModal
          projectAddress={selectedProject}
          isOpen={true}
          onClose={handleCloseRepay}
        />
      )}
    </>
  );
}