'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { AvailableProjects, CurrentPositions, BorrowModal } from '@/components/mm-dashboard';

export default function MMDashboard() {
  const { address } = useAccount();
  const [selectedProject, setSelectedProject] = useState<`0x${string}` | null>(null);

  const handleSelectProject = (projectAddress: `0x${string}`) => {
    setSelectedProject(projectAddress);
  };

  const handleCloseBorrow = () => {
    setSelectedProject(null);
  };

  if (!address) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Market Maker Dashboard</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900">Connect Your Wallet</h2>
          <p className="text-yellow-700 mt-2">
            Please connect your wallet to access the Market Maker dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Market Maker Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your borrowing positions and trading operations</p>
      </div>

      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Active Positions</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total Borrowed Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">$24,567</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total P&L</p>
            <p className="text-2xl font-bold text-green-600 mt-2">+$1,234</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Available Projects</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
          </div>
        </div>

        {/* Current Positions */}
        <CurrentPositions />

        {/* Available Projects */}
        <AvailableProjects onSelectProject={handleSelectProject} />
      </div>

      {/* Borrow Modal */}
      {selectedProject && (
        <BorrowModal
          projectAddress={selectedProject}
          isOpen={true}
          onClose={handleCloseBorrow}
        />
      )}
    </div>
  );
}