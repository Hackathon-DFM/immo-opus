import { useReadContract } from 'wagmi';
import { projectFactoryAbi } from '../contracts/ProjectFactory';

const PROJECT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_PROJECT_FACTORY_ADDRESS as `0x${string}`;

export interface Project {
  address: `0x${string}`;
  owner: `0x${string}`;
  mode: 'DIRECT_POOL' | 'BONDING_CURVE';
  tokenAddress?: `0x${string}`;
  tokenName?: string;
  tokenSymbol?: string;
}

export function useAllProjects() {
  // Read all projects from factory
  const { data: projectAddresses } = useReadContract({
    address: PROJECT_FACTORY_ADDRESS,
    abi: projectFactoryAbi,
    functionName: 'allProjects',
    query: {
      enabled: !!PROJECT_FACTORY_ADDRESS,
      refetchInterval: 60000, // Refresh every minute
    },
  });

  // In a real implementation, you would fetch project details for each address
  // For now, returning mock data structure
  const projects: Project[] = projectAddresses?.map((address, index) => ({
    address: address as `0x${string}`,
    owner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    mode: index % 2 === 0 ? 'DIRECT_POOL' : 'BONDING_CURVE',
    tokenName: `Token ${index + 1}`,
    tokenSymbol: `TKN${index + 1}`,
  })) || [];

  return {
    projects,
    isLoading: !projectAddresses,
  };
}

export function useProjectsByOwner(ownerAddress: `0x${string}` | undefined) {
  const { data: projectAddresses } = useReadContract({
    address: PROJECT_FACTORY_ADDRESS,
    abi: projectFactoryAbi,
    functionName: 'projectsByOwner',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!PROJECT_FACTORY_ADDRESS && !!ownerAddress,
      refetchInterval: 60000,
    },
  });

  return {
    projects: projectAddresses || [],
    isLoading: !projectAddresses,
  };
}