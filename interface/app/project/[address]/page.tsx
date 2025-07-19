'use client';

import { useParams } from 'next/navigation';
import { TradingInterface } from '@/components/bonding-curve';
import { DirectPoolDetails } from '@/components/direct-pool';
import { isAddress } from 'viem';
import { usePonderProject } from '@/lib/hooks/use-ponder-projects';
import { CONTRACT_ADDRESSES } from '@/src/config/contracts';
import { useTokenMetadata } from '@/lib/hooks/use-token-metadata';

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

  // Fetch project data from Ponder
  const { data: project, isLoading } = usePonderProject(projectAddress as `0x${string}`);
  
  // Fetch token metadata in real-time
  const { data: tokenMetadata } = useTokenMetadata(project?.tokenAddress as `0x${string}`);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">

        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">Project Not Found</h2>
          <p className="text-red-700 dark:text-red-300 mt-2">
            The project with address {projectAddress} could not be found.

          </p>
        </div>
      </div>
    );
  }

  // Render appropriate interface based on pool mode
  if (project.mode === 'BONDING_CURVE') {
    return (
      <TradingInterface
        bondingCurveAddress={project.address as `0x${string}`}
        usdcAddress={CONTRACT_ADDRESSES.usdc}
        tokenName={tokenMetadata?.name || 'Loading...'}
        tokenSymbol={tokenMetadata?.symbol || '...'}
      />
    );
  } else {
    // Direct Pool
    return <DirectPoolDetails project={project} />;
  }
}