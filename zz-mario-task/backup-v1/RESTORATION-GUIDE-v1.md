# IMMO Protocol - Restoration Guide v1.0

## Overview

This guide provides step-by-step instructions to restore the IMMO protocol to its pre-graduation-fix state. Use this if you need to rollback after the new deployment.

## When to Use This Guide

- New deployment fails or has issues
- Need to demo with the previous working version  
- Want to test differences between versions
- Emergency rollback required

## Prerequisites

- Git access to the repository
- Node.js and pnpm installed
- Arbitrum Sepolia wallet setup

## Complete Restoration Process

### Step 1: Restore Git State

```bash
# Navigate to project root
cd /Users/macbook/Coding/Hackathon/immo-opus

# Check current branch and commit
git status
git log --oneline -n 3

# Restore to pre-graduation-fix commit
git checkout f1c0e143cd9ba8b828ecf8fc728919d57fa17341

# Note: This will put you in detached HEAD state
# To continue development, create a new branch:
# git checkout -b restore-v1-state
```

### Step 2: Restore Contract Deployment Configuration

```bash
# Restore contracts deployment file
cp zz-mario-task/arbitrum-sepolia-backup-v1.json contracts/deployments/arbitrum-sepolia.json

# Restore frontend configuration  
cp zz-mario-task/arbitrum-sepolia-frontend-backup-v1.json interface/src/config/arbitrum-sepolia.json

# Verify restoration
cat contracts/deployments/arbitrum-sepolia.json
# Should show: ProjectFactory at 0x01ebD170A7D3eCb6d105Cea1f37f34F89BE4dc97
```

### Step 3: Rebuild and Sync ABIs

```bash
# Rebuild contracts to match restored state
cd contracts
forge build

# Regenerate ABIs from restored contracts
cd ../interface
node scripts/extract-abis.js

# Verify ABI restoration (should return 0 - no handleGraduation)
grep -c "handleGraduation" lib/contracts/DirectPool.json
```

### Step 4: Test Frontend Connection

```bash
# Start frontend development server
cd interface
pnpm install  # If needed
pnpm dev

# Frontend should start at http://localhost:3000
```

### Step 5: Verify Wallet Connection

1. Open http://localhost:3000
2. Connect wallet to Arbitrum Sepolia
3. Check browser console for any errors
4. Verify contract addresses load correctly

### Step 6: Test Restored Functionality

#### ✅ Safe Operations to Test:

**Direct Pool Creation**:
```
1. Go to "Create Project"
2. Choose "Direct Pool" mode
3. Fill form and submit
4. Should work normally
```

**MM Registration**:
```
1. Use created Direct Pool
2. Register as Market Maker
3. Should work normally
```

**Basic Token Borrowing**:
```
1. Register MM and finalize
2. Try borrowing tokens
3. Should work (basic CLOB functionality)
```

#### ❌ Operations to AVOID:

**Bonding Curve Graduation**:
- Don't graduate bonding curves
- Will break MM operations afterward
- Known issue in this version

**Advanced CLOB Operations**:
- MockCLOBDex not deployed in this version
- Some CLOB features may fail

## Verification Checklist

After restoration, verify:

- [ ] Git commit shows `f1c0e143cd9ba8b828ecf8fc728919d57fa17341`
- [ ] ProjectFactory address is `0x01ebD170A7D3eCb6d105Cea1f37f34F89BE4dc97`
- [ ] DirectPool ABI does NOT contain `handleGraduation`
- [ ] Frontend connects without errors
- [ ] Can create Direct Pool projects
- [ ] MM registration works
- [ ] Basic borrowing functions

## Troubleshooting

### Issue: "Contract not found" errors
```bash
# Check if network is correct in wallet
# Should be Arbitrum Sepolia (Chain ID: 421614)

# Verify addresses match:
cat interface/src/config/arbitrum-sepolia.json
```

### Issue: ABI mismatch errors  
```bash
# Regenerate ABIs
cd contracts && forge build
cd ../interface && node scripts/extract-abis.js
```

### Issue: Frontend won't start
```bash
# Clear cache and reinstall
cd interface
rm -rf .next
rm -rf node_modules
pnpm install
pnpm dev
```

### Issue: Transaction failures
- Ensure wallet has Arbitrum Sepolia ETH
- Try creating Direct Pool instead of Bonding Curve
- Check browser console for specific errors

## Important Limitations in v1.0

Remember that this restored version has:

1. **Graduation Bug**: Don't graduate bonding curves
2. **Missing MockCLOBDex**: Some CLOB operations will fail
3. **Outdated Test Results**: 53/62 tests passing (before our fixes)
4. **No Auto-CLOB Creation**: Manual adapter creation required

## Returning to Latest Version

To return to the latest version with graduation fix:

```bash
# Return to latest commit
git checkout mm-pool-borrow

# Pull latest changes if needed
git pull origin mm-pool-borrow

# Redeploy contracts with fixes
cd contracts
forge script script/DeployIMMO.s.sol --rpc-url arbitrum_sepolia --broadcast --verify

# Sync new deployment
cd ../interface
node scripts/extract-abis.js
cd ..
./scripts/sync-deployment.sh
```

## Emergency Contacts

- **Repository**: `/Users/macbook/Coding/Hackathon/immo-opus`
- **Backup Files**: Located in `zz-mario-task/` directory
- **Network**: Arbitrum Sepolia (testnet only)

## Documentation References

- **Current Backup**: `DEPLOYMENT-BACKUP-v1.md`
- **ABI Status**: `ABI-STATE-v1.md`  
- **New Features**: `completed/GRADUATION-FIX-TASKS.md`
- **Active Work**: `active/` directory

---
*Created: 2025-07-14*  
*Purpose: Complete restoration guide for v1.0 deployment*  
*Use: Emergency rollback or version comparison*