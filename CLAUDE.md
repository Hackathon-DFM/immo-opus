# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IMMO (Initial Market Making Offering) is a DeFi protocol on Arbitrum Sepolia that enables project owners to launch tokens with integrated market making capabilities. The protocol supports two pool modes: Direct Pool and Bonding Curve, with registered Market Makers (MMs) able to borrow tokens for trading on CLOB DEXs.

## Architecture

### High-Level Structure
The project consists of two main components:
- **contracts/**: Foundry-based smart contracts using OpenZeppelin Clones pattern
- **interface/**: Next.js 15 frontend with Wagmi v2 + RainbowKit integration

### Core Smart Contract Architecture
```
ProjectFactory (using Clones pattern)
├── DirectPoolTemplate → DirectPool clones
├── BondingCurveTemplate → BondingCurve clones
└── ERC20Token (1B fixed supply, 18 decimals)

Market Makers interact through:
DirectPool → CLOBAdapter → MockCLOBDex (for testing)
```

**Critical Implementation Detail**: ProjectFactory uses OpenZeppelin's `Clones.sol` to deploy minimal proxies of template contracts. This reduces deployment gas from ~250K to ~15K and keeps ProjectFactory under the 24KB contract size limit.

### Pool Modes
1. **Direct Pool**: MM-only operations, no user trading, fixed initial price
2. **Bonding Curve**: User trading until graduation (target market cap reached), then becomes Direct Pool

### MM Business Logic
- MM allocation = Total Pool Liquidity / Number of MMs
- MMs borrow tokens with time limits (1-30 days)
- MMs keep profits, Project Owners absorb losses
- Emergency withdraw available after time expiry

## Development Commands

### Smart Contracts (Foundry)
```bash
cd contracts

# Build and test
forge build
forge test
./test_runner.sh                    # Comprehensive test suite with colors

# Specific test categories
forge test --match-path "test/unit/ProjectFactory.t.sol" -vv
forge test --match-path "test/integration/HappyPath.t.sol" -vv
forge test --match-contract BondingCurveTest -vv

# Deploy to Arbitrum Sepolia
forge script script/DeployIMMO.s.sol --rpc-url arbitrum_sepolia --broadcast --verify

# Check contract sizes (important for 24KB limit)
forge build --sizes

# Generate coverage
forge coverage --report lcov
```

### Frontend (Next.js)
```bash
cd interface

# Development
pnpm dev                           # Uses Turbopack
pnpm build
pnpm lint

# Extract ABIs from contracts (run after contract changes)
node scripts/extract-abis.js

# Sync deployment addresses to frontend
../scripts/sync-deployment.sh
```

## Key File Locations

### Smart Contracts
- **Core contracts**: `contracts/src/core/` (ProjectFactory, DirectPool, BondingCurve)
- **Interfaces**: `contracts/src/interfaces/` (defines contract APIs)
- **Templates**: Used by ProjectFactory for cloning (DirectPool, BondingCurve)
- **Deployment config**: `contracts/deployments/arbitrum-sepolia.json`

### Frontend
- **Contract integration**: `interface/lib/hooks/use-create-project.ts` 
- **Address management**: `interface/src/config/contracts.ts`
- **ABIs**: `interface/lib/contracts/` (auto-generated from contract builds)
- **Components**: `interface/components/` (organized by feature)

## Critical Implementation Notes

### Contract Size Optimization
ProjectFactory exceeded 24KB limit and was refactored to use the Clones pattern:
- Template contracts deployed once
- ProjectFactory clones templates for each project
- Must call `setTemplates()` after ProjectFactory deployment

### Frontend-Contract Integration
Contract addresses are loaded from `interface/src/config/arbitrum-sepolia.json`, NOT environment variables. The config system uses `getContractAddresses(chainId)` to retrieve deployed addresses.

### Transaction State Management
Frontend uses detailed transaction states:
- PENDING: Waiting for wallet confirmation
- CONFIRMING: Submitted to network, waiting for confirmation  
- SUCCESS: Transaction confirmed
- ERROR: Transaction failed

### Environment Setup
Required environment variables for contracts:
- `PRIVATE_KEY`: Deployment wallet
- `ARBITRUM_SEPOLIA_RPC_URL`: RPC endpoint
- `ARBISCAN_API_KEY`: For contract verification

Frontend loads contract addresses from deployment files, not environment variables.

## Development Workflow

1. **After contract changes**: 
   - Run tests: `cd contracts && ./test_runner.sh`
   - Deploy: `forge script script/DeployIMMO.s.sol --rpc-url arbitrum_sepolia --broadcast`
   - Sync to frontend: `./scripts/sync-deployment.sh`
   - Extract ABIs: `cd interface && node scripts/extract-abis.js`

2. **Frontend development**:
   - Use debug panel in create-project form to verify contract configuration
   - Check browser console for detailed transaction debugging
   - Ensure MetaMask is connected to Arbitrum Sepolia (Chain ID: 421614)

## Testing Strategy

### Smart Contracts
- **Unit tests**: Individual contract functionality in `test/unit/`
- **Integration tests**: Complete user flows in `test/integration/`
- **BaseTest.sol**: Provides common setup with template deployment
- **Mock contracts**: MockUSDC, MockCLOBDex for testing

### Key Test Scenarios
- Project creation (both pool modes)
- MM registration, borrowing, repayment
- Bonding curve trading and graduation
- Emergency withdraw after time expiry
- Edge cases: MM losses, partial repayments

## Source of Truth
The file `immo-source-of-truth-new.md` contains the complete protocol specification including business rules, constraints, and detailed contract specifications. Always reference this for implementation details.