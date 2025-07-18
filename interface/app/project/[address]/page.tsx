'use client';

import { useParams } from 'next/navigation';
import { TradingInterface } from '@/components/bonding-curve';
import { isAddress } from 'viem';

// Mock USDC address for Arbitrum Sepolia
const MOCK_USDC_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

export default function ProjectDetailPage() {
  const params = useParams();
  const projectAddress = params.address as string;

  // Validate address
  if (!isAddress(projectAddress)) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">Invalid Project Address</h2>
          <p className="text-red-700 dark:text-red-300 mt-2">
            The provided address is not a valid Ethereum address.
          </p>
        </div>
      </div>
    );
  }

  // In a real app, you would fetch project details from the contract
  // For now, we'll use mock data
  const mockProjectData = {
    tokenName: 'Sample Token',
    tokenSymbol: 'SAMPLE',
    poolMode: 'BONDING_CURVE',
    bondingCurveAddress: projectAddress as `0x${string}`,
  };

  if (mockProjectData.poolMode !== 'BONDING_CURVE') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-400">Direct Pool Project</h2>
          <p className="text-yellow-700 dark:text-yellow-300 mt-2">
            This project uses Direct Pool mode. Trading interface is not available for Direct Pool projects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TradingInterface
      bondingCurveAddress={mockProjectData.bondingCurveAddress}
      usdcAddress={MOCK_USDC_ADDRESS}
      tokenName={mockProjectData.tokenName}
      tokenSymbol={mockProjectData.tokenSymbol}
    />
  );
}