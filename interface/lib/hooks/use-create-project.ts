import { useWriteContract, useChainId } from 'wagmi';
import ProjectFactoryABI from '../contracts/ProjectFactory.json';
import { getContractAddresses } from '@/src/config/contracts';
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

export function useCreateProject() {
  const chainId = useChainId();
  const { writeContractAsync, data: hash, error, isError, isPending } = useWriteContract();

  const createProject = async (params: CreateProjectParams) => {
    console.log('=== CREATE PROJECT DEBUG ===');
    console.log('Chain ID:', chainId);
    
    const addresses = getContractAddresses(chainId || 421614);
    console.log('Contract addresses:', addresses);
    
    if (!addresses.projectFactory || addresses.projectFactory === '0x0000000000000000000000000000000000000000') {
      throw new Error('Project Factory address not configured. Please deploy contracts first.');
    }

    console.log('Creating project with params:', params);
    console.log('Using ProjectFactory address:', addresses.projectFactory);

    try {
      const tx = await writeContractAsync({
        address: addresses.projectFactory,
        abi: ProjectFactoryABI,
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

      console.log('Transaction sent successfully:', tx);
      return tx;
    } catch (error) {
      console.error('writeContractAsync failed:', error);
      throw error;
    }
  };

  return {
    createProject,
    isLoading: isPending,
    error,
    isError,
  };
}