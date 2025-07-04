import { useReadContract, useContractEvent, useAccount, useChainId } from 'wagmi';
import { useMemo } from 'react';
import { projectFactoryAbi } from '../contracts/ProjectFactory';
import { getContractAddresses } from '../../src/config/contracts';

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

  // Listen to ProjectCreated events to get real-time updates
  const { data: projectCreatedEvents } = useContractEvent({
    address: contractAddresses.projectFactory,
    abi: projectFactoryAbi,
    eventName: 'ProjectCreated',
    fromBlock: 'earliest',
    query: {
      enabled: contractAddresses.projectFactory !== '0x0000000000000000000000000000000000000000',
    },
  });

  // Transform events into project data
  const projects: Project[] = useMemo(() => {
    if (!projectCreatedEvents) return [];
    
    return projectCreatedEvents.map((event) => ({
      address: event.args.project as `0x${string}`,
      owner: event.args.owner as `0x${string}`,
      mode: event.args.mode === 0 ? 'DIRECT_POOL' : 'BONDING_CURVE',
      createdBlock: event.blockNumber,
      createdTxHash: event.transactionHash,
    }));
  }, [projectCreatedEvents]);

  return {
    projects,
    isLoading: !projectCreatedEvents,
  };
}

export function useProjectsByOwner(ownerAddress?: `0x${string}`) {
  const chainId = useChainId();
  const { address: currentAddress } = useAccount();
  const contractAddresses = getContractAddresses(chainId);
  
  // Use provided address or current connected address
  const targetAddress = ownerAddress || currentAddress;

  // Listen to ProjectCreated events filtered by owner
  const { data: projectCreatedEvents } = useContractEvent({
    address: contractAddresses.projectFactory,
    abi: projectFactoryAbi,
    eventName: 'ProjectCreated',
    args: targetAddress ? { owner: targetAddress } : undefined,
    fromBlock: 'earliest',
    query: {
      enabled: !!contractAddresses.projectFactory && 
               contractAddresses.projectFactory !== '0x0000000000000000000000000000000000000000' && 
               !!targetAddress,
    },
  });

  // Transform events into project data
  const projects: Project[] = useMemo(() => {
    if (!projectCreatedEvents) return [];
    
    return projectCreatedEvents.map((event) => ({
      address: event.args.project as `0x${string}`,
      owner: event.args.owner as `0x${string}`,
      mode: event.args.mode === 0 ? 'DIRECT_POOL' : 'BONDING_CURVE',
      createdBlock: event.blockNumber,
      createdTxHash: event.transactionHash,
    }));
  }, [projectCreatedEvents]);

  return {
    projects,
    isLoading: !projectCreatedEvents && !!targetAddress,
  };
}