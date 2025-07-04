import { useReadContract, useChainId } from 'wagmi';
import ProjectFactoryABI from '../contracts/ProjectFactory.json';
import { getContractAddresses } from '@/src/config/contracts';

export function useProjectMode(projectAddress: `0x${string}`) {
  const chainId = useChainId();
  const contractAddresses = getContractAddresses(chainId);

  const { data: modeData, isLoading } = useReadContract({
    address: contractAddresses.projectFactory,
    abi: ProjectFactoryABI,
    functionName: 'getProjectMode',
    args: [projectAddress],
    query: {
      enabled: !!projectAddress && 
               !!contractAddresses.projectFactory && 
               contractAddresses.projectFactory !== '0x0000000000000000000000000000000000000000',
    },
  });

  // Convert numeric mode to string
  const mode = modeData === 1 ? 'BONDING_CURVE' : 'DIRECT_POOL';

  return {
    mode,
    isLoading,
  };
}