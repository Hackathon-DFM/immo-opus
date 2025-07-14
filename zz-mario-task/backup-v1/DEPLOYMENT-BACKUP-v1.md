# IMMO Protocol - Deployment Backup v1.0

## Overview

This document contains a complete backup of the current deployment state on Arbitrum Sepolia. Use this to restore the system to its pre-graduation-fix state if needed.

**⚠️ Important**: This deployment does NOT include:
- Graduation fix (handleGraduation function)
- CLOB auto-creation improvements
- MockCLOBDex contract

## Deployment Information

### Version Details
- **Deployment Date**: ~July 2025 (before graduation fix)
- **Git Commit**: `f1c0e143cd9ba8b828ecf8fc728919d57fa17341`
- **Branch**: `mm-pool-borrow`
- **Status**: Pre-graduation fix, basic CLOB integration

### Contract Addresses (Arbitrum Sepolia)

```json
{
  "projectFactory": "0x01ebD170A7D3eCb6d105Cea1f37f34F89BE4dc97",
  "directPoolTemplate": "0x41DBC5C299A9C31F0A0A32aaE8B7c4dd76bB5014",
  "bondingCurveTemplate": "0x4FcFc18A2215cEBDfBd1AC30A1576E267237983B",
  "usdc": "0x20D87565d1B025904D9a456D31bBf8fA1dBaA7a9",
  "deployer": "0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38",
  "network": "arbitrum-sepolia",
  "chainId": 421614
}
```

**Missing**: `clobDex` address (MockCLOBDex not deployed)

### Contract Verification Status
All contracts are verified on Arbiscan:
- ✅ ProjectFactory: https://sepolia.arbiscan.io/address/0x01ebD170A7D3eCb6d105Cea1f37f34F89BE4dc97
- ✅ DirectPool Template: https://sepolia.arbiscan.io/address/0x41DBC5C299A9C31F0A0A32aaE8B7c4dd76bB5014
- ✅ BondingCurve Template: https://sepolia.arbiscan.io/address/0x4FcFc18A2215cEBDfBd1AC30A1576E267237983B
- ✅ MockUSDC: https://sepolia.arbiscan.io/address/0x20D87565d1B025904D9a456D31bBf8fA1dBaA7a9

## Contract Functionality Status

### ✅ Working Features
1. **Project Creation**:
   - Direct Pool mode ✅
   - Bonding Curve mode ✅
   - Token creation ✅

2. **Market Maker Operations**:
   - MM registration ✅
   - MM finalization ✅
   - Token borrowing ✅ (basic)
   - Token repayment ✅ (basic)

3. **Bonding Curve Trading**:
   - Buy tokens ✅
   - Sell tokens ✅
   - Price calculation ✅

### ❌ Known Issues/Limitations

1. **Graduation Bug** 🚫:
   - BondingCurve → DirectPool graduation leaves totalLiquidity = 0
   - MMs cannot borrow from graduated pools
   - **Workaround**: Only use Direct Pool mode

2. **CLOB Integration** ⚠️:
   - CLOBAdapter creation works
   - MockCLOBDex missing - manual CLOB operations fail
   - Repay flow may have token location issues

3. **Missing Functions**:
   - `handleGraduation()` not in DirectPool
   - Auto-CLOB adapter creation not implemented
   - `Graduated` event not available

## ABI Status

### Missing from Current ABIs:
- `handleGraduation(address newOwner, uint256 tokenAmount)` in DirectPool
- `Graduated` event in DirectPool interface
- Updated `borrowTokens()` logic for auto-CLOB creation

### Current ABI Files (Outdated):
- `/interface/lib/contracts/DirectPool.json` - Missing graduation functions
- `/interface/lib/contracts/BondingCurve.json` - Missing graduation calls
- No `IDirectPool.json` interface file

## Restoration Guide

### How to Revert to This Deployment

#### 1. Restore Git State
```bash
cd /Users/macbook/Coding/Hackathon/immo-opus
git checkout f1c0e143cd9ba8b828ecf8fc728919d57fa17341
```

#### 2. Restore Deployment Configuration
```bash
# Copy backup deployment file
cp zz-mario-task/arbitrum-sepolia-backup-v1.json contracts/deployments/arbitrum-sepolia.json
cp zz-mario-task/arbitrum-sepolia-backup-v1.json interface/src/config/arbitrum-sepolia.json
```

#### 3. Regenerate ABIs (if needed)
```bash
cd contracts
forge build
cd ../interface
node scripts/extract-abis.js
```

#### 4. Test Frontend Connection
```bash
cd interface
pnpm dev
# Connect wallet to Arbitrum Sepolia
# Test project creation (Direct Pool only)
```

### Usage Constraints in This Version

**DO NOT USE**:
- Bonding Curve → DirectPool graduation (will break MM operations)
- CLOB-dependent features (MockCLOBDex missing)

**SAFE TO USE**:
- Direct Pool project creation
- MM registration and basic borrowing
- Bonding Curve trading (without graduation)

## Emergency Contact Information

**Deployer Wallet**: `0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38`
**Network**: Arbitrum Sepolia (Chain ID: 421614)
**RPC**: Standard Arbitrum Sepolia endpoints

## Notes for Mainnet

- These addresses are TESTNET ONLY
- Never use MockUSDC addresses for mainnet
- Deployer wallet contains test funds only

## Related Documentation

- Original requirements: `requirements/catetan.txt`
- Completed fixes: `completed/GRADUATION-FIX-TASKS.md`
- Current issues: `backlog/TEST-FAILURES.md`

---
*Created: 2025-07-14*  
*Purpose: Backup before graduation fix deployment*  
*Status: Pre-fix deployment documentation*