import { useQuery } from '@tanstack/react-query';
import { graphqlClient, ProjectOwner, Project } from '../graphql/client';
import { gql } from 'graphql-request';

// GraphQL query to fetch projects by owner
const GET_PROJECTS_BY_OWNER = gql`
  query GetProjectsByOwner($ownerAddress: String!) {
    projectOwners(where: { address: $ownerAddress }) {
      items {
        id
        address
        projectCount
        projects {
          items {
            id
            address
            mode
            tokenAddress
            owner {
              address
            }
            initialPrice
            targetMarketCap
            borrowTimeLimit
            createdBlock
            createdAt
            createdTxHash
            totalLiquidity
            availableLiquidity
            numberOfMMs
            isFinalized
            graduated
            token {
              id
              address
              name
              symbol
              decimals
              totalSupply
            }
            registeredMMs {
              items {
                id
                mmAddress
                isActive
                registeredAt
                lastUpdated
              }
            }
          }
        }
      }
    }
  }
`;

// GraphQL query to fetch all projects
const GET_ALL_PROJECTS = gql`
  query GetAllProjects($limit: Int, $offset: Int) {
    projects(limit: $limit, offset: $offset, orderBy: "createdTimestamp", orderDirection: "desc") {
      items {
        id
        address
        mode
        tokenAddress
        owner {
          address
        }
        initialPrice
        targetMarketCap
        borrowTimeLimit
        createdBlock
        createdAt
        createdTxHash
        totalLiquidity
        availableLiquidity
        numberOfMMs
        isFinalized
        graduated
        token {
          id
          address
          name
          symbol
          decimals
          totalSupply
        }
        registeredMMs {
          items {
            id
            mmAddress
            isActive
            registeredAt
            lastUpdated
          }
        }
      }
    }
  }
`;

interface ProjectsByOwnerResponse {
  projectOwners: {
    items: ProjectOwner[];
  };
}

interface AllProjectsResponse {
  projects: {
    items: Project[];
  };
}

export function usePonderProjectsByOwner(ownerAddress?: `0x${string}`) {
  return useQuery({
    queryKey: ['ponder-projects-by-owner', ownerAddress],
    queryFn: async () => {
      if (!ownerAddress) return [];
      
      try {
        const data = await graphqlClient.request<ProjectsByOwnerResponse>(
          GET_PROJECTS_BY_OWNER,
          { ownerAddress: ownerAddress.toLowerCase() }
        );
        
        return data.projectOwners.items[0]?.projects.items || [];
      } catch (error) {
        console.error('Error fetching projects from Ponder:', error);
        return [];
      }
    },
    enabled: !!ownerAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

export function usePonderAllProjects(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['ponder-all-projects', limit, offset],
    queryFn: async () => {
      try {
        const data = await graphqlClient.request<AllProjectsResponse>(
          GET_ALL_PROJECTS,
          { limit, offset }
        );
        
        return data.projects.items;
      } catch (error) {
        console.error('Error fetching all projects from Ponder:', error);
        return [];
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

// Hook to get a single project by address
export function usePonderProject(projectAddress?: `0x${string}`) {
  return useQuery({
    queryKey: ['ponder-project', projectAddress],
    queryFn: async () => {
      if (!projectAddress) return null;
      
      try {
        const query = gql`
          query GetProject($address: String!) {
            projects(where: { address: $address }) {
              items {
                id
                address
                mode
                tokenAddress
                owner
                initialPrice
                targetMarketCap
                borrowTimeLimit
                createdBlock
                createdAt
                createdTxHash
                totalLiquidity
                availableLiquidity
                numberOfMMs
                isFinalized
                graduated
                token {
                  id
                  address
                  name
                  symbol
                  decimals
                  totalSupply
                }
                registeredMMs {
                  items {
                    id
                    mmAddress
                    isActive
                    registeredAt
                    lastUpdated
                  }
                }
              }
            }
          }
        `;
        
        const data = await graphqlClient.request<{ projects: { items: Project[] } }>(
          query,
          { address: projectAddress.toLowerCase() }
        );
        
        return data.projects.items[0] || null;
      } catch (error) {
        console.error('Error fetching project from Ponder:', error);
        return null;
      }
    },
    enabled: !!projectAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}
