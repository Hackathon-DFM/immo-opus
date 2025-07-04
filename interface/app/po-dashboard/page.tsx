'use client';

import { useState } from 'react';

// Mock data - will be replaced with real contract data
const mockProjects = [
  {
    id: '1',
    name: 'DeFi Token Alpha',
    symbol: 'DTA',
    poolMode: 'Direct Pool',
    status: 'Active',
    totalLiquidity: 50000,
    registeredMMs: 3,
    finalizedMMs: true,
    borrowedAmount: 30000,
    availableLiquidity: 20000,
    borrowTimeLimit: 7,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Beta Protocol',
    symbol: 'BETA',
    poolMode: 'Bonding Curve',
    status: 'Graduated',
    totalLiquidity: 75000,
    registeredMMs: 2,
    finalizedMMs: true,
    borrowedAmount: 45000,
    availableLiquidity: 30000,
    borrowTimeLimit: 14,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Gamma Finance',
    symbol: 'GAM',
    poolMode: 'Direct Pool',
    status: 'MM Registration',
    totalLiquidity: 25000,
    registeredMMs: 1,
    finalizedMMs: false,
    borrowedAmount: 0,
    availableLiquidity: 25000,
    borrowTimeLimit: 10,
    createdAt: '2024-01-20',
  },
];

const mockMarketMakers = {
  '1': [
    {
      address: '0x742d...5678',
      allocation: 16666,
      borrowedAmount: 12000,
      borrowTimestamp: '2024-01-16T10:00:00Z',
      timeRemaining: 5.2,
      status: 'Borrowing',
      pnl: 850,
    },
    {
      address: '0x853e...9012',
      allocation: 16666,
      borrowedAmount: 16666,
      borrowTimestamp: '2024-01-16T14:30:00Z',
      timeRemaining: 5.4,
      status: 'Borrowing',
      pnl: -320,
    },
    {
      address: '0x964f...3456',
      allocation: 16666,
      borrowedAmount: 1334,
      borrowTimestamp: '2024-01-17T09:15:00Z',
      timeRemaining: 6.1,
      status: 'Borrowing',
      pnl: 45,
    },
  ],
  '2': [
    {
      address: '0xa75g...7890',
      allocation: 37500,
      borrowedAmount: 25000,
      borrowTimestamp: '2024-01-11T11:20:00Z',
      timeRemaining: 12.3,
      status: 'Borrowing',
      pnl: 1200,
    },
    {
      address: '0xb86h...1234',
      allocation: 37500,
      borrowedAmount: 20000,
      borrowTimestamp: '2024-01-12T16:45:00Z',
      timeRemaining: 13.1,
      status: 'Borrowing',
      pnl: 680,
    },
  ],
  '3': [
    {
      address: '0xc97i...5678',
      allocation: 25000,
      borrowedAmount: 0,
      borrowTimestamp: null,
      timeRemaining: null,
      status: 'Registered',
      pnl: 0,
    },
  ],
};

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

function ProjectCard({ project }: { project: typeof mockProjects[0] }) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showMMManagement, setShowMMManagement] = useState(false);
  const [newMMAddress, setNewMMAddress] = useState('');

  const marketMakers = mockMarketMakers[project.id as keyof typeof mockMarketMakers] || [];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Project Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <p className="text-sm text-gray-600">{project.symbol} • {project.poolMode}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Liquidity</p>
          <p className="text-lg font-semibold text-gray-900">${project.totalLiquidity.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Available</p>
          <p className="text-lg font-semibold text-gray-900">${project.availableLiquidity.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Borrowed</p>
          <p className="text-lg font-semibold text-gray-900">${project.borrowedAmount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time Limit</p>
          <p className="text-lg font-semibold text-gray-900">{project.borrowTimeLimit} days</p>
        </div>
      </div>

      {/* MM Management Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">
            Market Makers ({project.registeredMMs})
            {project.finalizedMMs && <span className="ml-2 text-xs text-green-600">(Finalized)</span>}
          </h4>
          {!project.finalizedMMs && (
            <button
              onClick={() => setShowMMManagement(!showMMManagement)}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              {showMMManagement ? 'Hide' : 'Manage MMs'}
            </button>
          )}
        </div>

        {/* MM Registration Form */}
        {showMMManagement && !project.finalizedMMs && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0x... Market Maker Address"
                value={newMMAddress}
                onChange={(e) => setNewMMAddress(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
                Register
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                Finalize MMs
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* MM List */}
        <div className="space-y-3">
          {marketMakers.map((mm, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-900">{mm.address}</p>
                  <StatusBadge status={mm.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Allocation:</span> ${mm.allocation.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Borrowed:</span> ${mm.borrowedAmount.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">P&L:</span> 
                    <span className={mm.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${mm.pnl >= 0 ? '+' : ''}{mm.pnl.toLocaleString()}
                    </span>
                  </div>
                  {mm.timeRemaining && (
                    <div>
                      <span className="font-medium">Time Left:</span> {mm.timeRemaining.toFixed(1)} days
                    </div>
                  )}
                </div>
              </div>
              
              {/* MM Actions */}
              <div className="flex gap-2">
                {mm.status === 'Borrowing' && mm.timeRemaining && mm.timeRemaining < 0 && (
                  <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                    Emergency Withdraw
                  </button>
                )}
                {!project.finalizedMMs && (
                  <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Actions */}
      <div className="border-t pt-4 mt-4">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
            View Details
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200">
            Download Report
          </button>
          {project.poolMode === 'Bonding Curve' && project.status !== 'Graduated' && (
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

  const filteredProjects = mockProjects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.status === 'Active';
    if (filter === 'mm-registration') return project.status === 'MM Registration';
    if (filter === 'graduated') return project.status === 'Graduated';
    return true;
  });

  // Calculate totals
  const totalLiquidity = mockProjects.reduce((sum, p) => sum + p.totalLiquidity, 0);
  const totalBorrowed = mockProjects.reduce((sum, p) => sum + p.borrowedAmount, 0);
  const totalProjects = mockProjects.length;
  const activeProjects = mockProjects.filter(p => p.status === 'Active').length;

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
              <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Liquidity</p>
              <p className="text-2xl font-bold text-gray-900">${totalLiquidity.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
              <p className="text-2xl font-bold text-purple-600">${totalBorrowed.toLocaleString()}</p>
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
              onClick={() => setFilter(key as any)}
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
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
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
        )}
      </div>
    </div>
  );
}