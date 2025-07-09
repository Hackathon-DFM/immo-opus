import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';

const ERC20_ABI = [
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export interface TokenMetadata {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  totalSupplyFormatted: string;
}

export function useTokenMetadata(tokenAddress?: `0x${string}`) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['tokenMetadata', tokenAddress],
    queryFn: async (): Promise<TokenMetadata | null> => {
      if (!tokenAddress || !publicClient) return null;

      try {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
          publicClient.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'name',
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'symbol',
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'decimals',
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'totalSupply',
          }),
        ]);

        return {
          address: tokenAddress,
          name,
          symbol,
          decimals,
          totalSupply,
          totalSupplyFormatted: formatUnits(totalSupply, decimals),
        };
      } catch (error) {
        console.error('Error fetching token metadata:', error);
        return null;
      }
    },
    enabled: !!tokenAddress && !!publicClient,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook to fetch multiple token metadata in parallel
export function useMultipleTokenMetadata(tokenAddresses: (`0x${string}` | undefined)[]) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['multipleTokenMetadata', tokenAddresses],
    queryFn: async (): Promise<(TokenMetadata | null)[]> => {
      if (!publicClient) return [];

      const promises = tokenAddresses.map(async (address) => {
        if (!address) return null;

        try {
          const [name, symbol, decimals, totalSupply] = await Promise.all([
            publicClient.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'name',
            }),
            publicClient.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'symbol',
            }),
            publicClient.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'decimals',
            }),
            publicClient.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'totalSupply',
            }),
          ]);

          return {
            address,
            name,
            symbol,
            decimals,
            totalSupply,
            totalSupplyFormatted: formatUnits(totalSupply, decimals),
          };
        } catch (error) {
          console.error(`Error fetching token metadata for ${address}:`, error);
          return null;
        }
      });

      return Promise.all(promises);
    },
    enabled: tokenAddresses.length > 0 && !!publicClient,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}