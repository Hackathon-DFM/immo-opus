import { useReadContract, useReadContracts, useAccount, useChainId } from 'wagmi';
import { useMemo } from 'react';
import ProjectFactoryABI from '../contracts/ProjectFactory.json';
import { getContractAddresses } from '@/src/config/contracts';

export interface Project {
  address: `0x${string}`;
  owner: `0x${string}`;
  mode: 'DIRECT_POOL' | 'BONDING_CURVE';
  tokenAddress?: `0x${string}`;
  tokenName?: string;
  tokenSymbol?: string;
  createdBlock?: bigint;
  createdTxHash?: `0x${string}`;
}

export function useAllProjects() {
  const chainId = useChainId();
  const contractAddresses = getContractAddresses(chainId);

  // Read all project addresses from the factory
  const { data: allProjectAddresses, isLoading } = useReadContract({
    address: contractAddresses.projectFactory,
    abi: ProjectFactoryABI,
    functionName: 'getAllProjects',
    query: {
      enabled: contractAddresses.projectFactory !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 60000, // Refresh every minute
    },
  });

  // Read project modes for all addresses
  const { data: projectModes } = useReadContracts({
    contracts: allProjectAddresses
      ? (allProjectAddresses as `0x${string}`[]).map((address) => ({
          address: contractAddresses.projectFactory,
          abi: ProjectFactoryABI,
          functionName: 'getProjectMode',
          args: [address],
        }))
      : [],
    query: {
      enabled: !!allProjectAddresses && allProjectAddresses.length > 0,
    },
  });

  // Transform addresses into project data
  const projects: Project[] = useMemo(() => {
    if (!allProjectAddresses || !projectModes) return [];
    
    return (allProjectAddresses as `0x${string}`[]).map((address, index) => ({
      address,
      owner: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Would need to fetch from each project
      mode: projectModes[index]?.result === 1 ? 'BONDING_CURVE' : 'DIRECT_POOL',
    }));
  }, [allProjectAddresses, projectModes]);

  return {
    projects,
    isLoading,
  };
}

export function useProjectsByOwner(ownerAddress?: `0x${string}`) {
  const chainId = useChainId();
  const { address: currentAddress } = useAccount();
  const contractAddresses = getContractAddresses(chainId);
  
  // Use provided address or current connected address
  const targetAddress = ownerAddress || currentAddress;

  // Read projects by owner from the factory
  const { data: projectAddresses, isLoading } = useReadContract({
    address: contractAddresses.projectFactory,
    abi: ProjectFactoryABI,
    functionName: 'getProjectsByOwner',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!contractAddresses.projectFactory && 
               contractAddresses.projectFactory !== '0x0000000000000000000000000000000000000000' && 
               !!targetAddress,
      refetchInterval: 60000, // Refresh every minute
    },
  });

  // Read project modes for all addresses
  const { data: projectModes } = useReadContracts({
    contracts: projectAddresses
      ? (projectAddresses as `0x${string}`[]).map((address) => ({
          address: contractAddresses.projectFactory,
          abi: ProjectFactoryABI,
          functionName: 'getProjectMode',
          args: [address],
        }))
      : [],
    query: {
      enabled: !!projectAddresses && projectAddresses.length > 0,
    },
  });

  // Transform addresses into project data
  const projects: Project[] = useMemo(() => {
    if (!projectAddresses || !targetAddress || !projectModes) return [];
    
    return (projectAddresses as `0x${string}`[]).map((address, index) => ({
      address,
      owner: targetAddress,
      mode: projectModes[index]?.result === 1 ? 'BONDING_CURVE' : 'DIRECT_POOL',
    }));
  }, [projectAddresses, targetAddress, projectModes]);

  return {
    projects,
    isLoading: isLoading && !!targetAddress,
  };
}