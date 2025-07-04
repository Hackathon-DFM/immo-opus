import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { projectFactoryAbi } from '../contracts/ProjectFactory';
import { PoolMode } from '@/components/create-project/types';

interface CreateProjectParams {
  isNewToken: boolean;
  existingToken?: string;
  name?: string;
  symbol?: string;
  description?: string;
  tokenAmount: bigint;
  mode: PoolMode;
  initialPrice: bigint;
  targetMarketCap: bigint;
  borrowTimeLimit: bigint;
}

// This will be set from environment variables after deployment
const PROJECT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_PROJECT_FACTORY_ADDRESS as `0x${string}`;

export function useCreateProject() {
  const { writeContractAsync, data: hash, error, isError, isPending } = useWriteContract();

  const createProject = async (params: CreateProjectParams) => {
    if (!PROJECT_FACTORY_ADDRESS) {
      throw new Error('Project Factory address not configured');
    }

    // For existing tokens, we'll need to handle approval first
    // This is a simplified version - in production, check and request approval if needed

    const tx = await writeContractAsync({
      address: PROJECT_FACTORY_ADDRESS,
      abi: projectFactoryAbi,
      functionName: 'createProject',
      args: [
        params.isNewToken,
        params.existingToken || '0x0000000000000000000000000000000000000000',
        params.name || '',
        params.symbol || '',
        params.description || '',
        params.tokenAmount,
        params.mode,
        params.initialPrice,
        params.targetMarketCap,
        params.borrowTimeLimit,
      ],
    });

    return tx;
  };

  return {
    createProject,
    isLoading: isPending,
    error,
    isError,
  };
}