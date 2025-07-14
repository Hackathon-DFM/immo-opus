# IMMO Protocol - Deployment Tasks

## Overview

This document tracks all tasks required to deploy the IMMO protocol to Arbitrum Sepolia testnet and integrate with the frontend.

## Pre-Deployment Checklist

### Environment Setup ❌
- [ ] Verify `.env` file exists in `/contracts` directory
- [ ] `PRIVATE_KEY` is set (deployer wallet private key)
- [ ] `ARBITRUM_SEPOLIA_RPC_URL` is set (RPC endpoint)
- [ ] `ARBISCAN_API_KEY` is set (for contract verification)
- [ ] Deployer wallet has sufficient ETH on Arbitrum Sepolia

### Contract Readiness ✅
- [x] All critical tests passing (56/62)
- [x] Graduation fix implemented and tested
- [x] CLOB integration completed
- [x] Contract sizes under 24KB limit (using Clones pattern)
- [x] MockCLOBDex included in deployment script

### Code Review ✅
- [x] No hardcoded addresses
- [x] No test code in production contracts
- [x] Events properly defined
- [x] Access controls in place

## Deployment Steps

### 1. Deploy Contracts ❌
```bash
cd contracts
forge script script/DeployIMMO.s.sol --rpc-url arbitrum_sepolia --broadcast --verify
```

**Expected Output**:
- [ ] ProjectFactory deployed
- [ ] DirectPool template deployed
- [ ] BondingCurve template deployed
- [ ] MockUSDC deployed
- [ ] MockCLOBDex deployed
- [ ] Templates set in ProjectFactory
- [ ] Contracts verified on Arbiscan

**Deployment Addresses to Record**:
- [ ] ProjectFactory: `0x...`
- [ ] DirectPoolTemplate: `0x...`
- [ ] BondingCurveTemplate: `0x...`
- [ ] MockUSDC: `0x...`
- [ ] MockCLOBDex: `0x...`

### 2. Verify Deployment ❌
- [ ] Check all contracts on Arbiscan
- [ ] Verify contract source code is readable
- [ ] Test template cloning works
- [ ] Confirm deployment JSON created at `contracts/deployments/arbitrum-sepolia.json`

### 3. Extract Updated ABIs ❌
```bash
cd interface
node scripts/extract-abis.js
```

**Files to Update**:
- [ ] `interface/lib/contracts/ProjectFactory.json`
- [ ] `interface/lib/contracts/DirectPool.json`
- [ ] `interface/lib/contracts/BondingCurve.json`
- [ ] `interface/lib/contracts/IDirectPool.json` (includes handleGraduation)

### 4. Sync Deployment to Frontend ❌
```bash
cd ..
./scripts/sync-deployment.sh
```

**Verify**:
- [ ] `interface/src/config/arbitrum-sepolia.json` updated
- [ ] Contract addresses match deployment

## Post-Deployment Testing

### 1. Basic Contract Interaction ❌
Using Arbiscan or ethers/web3:
- [ ] Call `projectFactory.getProjects()` - should return empty array
- [ ] Call `projectFactory.directPoolTemplate()` - should return template address
- [ ] Call `projectFactory.bondingCurveTemplate()` - should return template address

### 2. Frontend Integration Test ❌
- [ ] Start frontend: `cd interface && pnpm dev`
- [ ] Connect wallet to Arbitrum Sepolia
- [ ] Verify contracts load (check browser console)
- [ ] Test project creation (both pool modes)

### 3. End-to-End Flow Test ❌

#### Direct Pool Flow:
- [ ] Create Direct Pool project
- [ ] Register MMs
- [ ] Finalize MMs
- [ ] Set CLOB config
- [ ] MM borrows tokens
- [ ] MM repays tokens

#### Bonding Curve Flow:
- [ ] Create Bonding Curve project
- [ ] Buy tokens
- [ ] Reach graduation
- [ ] Verify DirectPool activated
- [ ] Register MMs on graduated pool
- [ ] MM borrows from graduated pool

### 4. Gas Usage Analysis ❌
- [ ] Record gas costs for:
  - [ ] Project creation (Direct Pool)
  - [ ] Project creation (Bonding Curve)
  - [ ] MM registration
  - [ ] Token borrowing
  - [ ] Bonding curve graduation

## Known Issues to Monitor

1. **Contract Size**: Using Clones pattern, but monitor if templates approach 24KB
2. **Gas Costs**: Arbitrum Sepolia costs differ from mainnet
3. **RPC Reliability**: Have backup RPC ready
4. **MockUSDC Faucet**: Ensure test users can get MockUSDC

## Rollback Plan

If deployment fails:
1. No on-chain rollback needed (new deployment)
2. Revert frontend config changes
3. Fix issues and redeploy with new addresses

## Success Criteria

- [ ] All contracts deployed and verified
- [ ] Frontend successfully connects to contracts
- [ ] At least one successful project creation
- [ ] At least one successful MM borrow/repay cycle
- [ ] No critical errors in 24 hours

## Post-Deployment Actions

1. **Documentation** ❌
   - [ ] Update README with deployed addresses
   - [ ] Create deployment announcement
   - [ ] Share testnet faucet instructions

2. **Monitoring** ❌
   - [ ] Set up event monitoring
   - [ ] Track gas usage patterns
   - [ ] Monitor for failed transactions

3. **Next Iterations** ❌
   - [ ] Plan error message improvements (v1.1)
   - [ ] Complete MM dashboard (frontend)
   - [ ] Prepare mainnet deployment plan

---
*Deployment Target: Arbitrum Sepolia (Chain ID: 421614)*