# IMMO Protocol - Deployment Backup v1.0

## Quick Reference

This folder contains a complete backup of the IMMO protocol deployment state before the graduation fix and CLOB improvements.

## Contents

### 📋 Documentation
- **DEPLOYMENT-BACKUP-v1.md** - Complete deployment state documentation
- **ABI-STATE-v1.md** - Current ABI status and limitations  
- **RESTORATION-GUIDE-v1.md** - Step-by-step restoration instructions
- **README.md** - This overview file

### 💾 Backup Files
- **arbitrum-sepolia-backup-v1.json** - Contract deployment addresses
- **arbitrum-sepolia-frontend-backup-v1.json** - Frontend configuration backup

## Key Information

### Deployment Version
- **Git Commit**: `f1c0e143cd9ba8b828ecf8fc728919d57fa17341`
- **Date**: ~July 2025
- **Status**: Pre-graduation fix

### Contract Addresses
- **ProjectFactory**: `0x01ebD170A7D3eCb6d105Cea1f37f34F89BE4dc97`
- **DirectPool Template**: `0x41DBC5C299A9C31F0A0A32aaE8B7c4dd76bB5014`
- **BondingCurve Template**: `0x4FcFc18A2215cEBDfBd1AC30A1576E267237983B`
- **MockUSDC**: `0x20D87565d1B025904D9a456D31bBf8fA1dBaA7a9`

### ⚠️ Known Issues in This Version
- Graduation bug (totalLiquidity = 0 after graduation)
- No MockCLOBDex deployed
- Missing `handleGraduation()` function

## Quick Restoration

```bash
# 1. Restore git state
git checkout f1c0e143cd9ba8b828ecf8fc728919d57fa17341

# 2. Restore deployment configs
cp backup-v1/arbitrum-sepolia-backup-v1.json ../contracts/deployments/arbitrum-sepolia.json
cp backup-v1/arbitrum-sepolia-frontend-backup-v1.json ../interface/src/config/arbitrum-sepolia.json

# 3. Rebuild and sync
cd ../contracts && forge build
cd ../interface && node scripts/extract-abis.js
```

## Documentation Order

1. **Start here**: DEPLOYMENT-BACKUP-v1.md
2. **Technical details**: ABI-STATE-v1.md  
3. **Restoration process**: RESTORATION-GUIDE-v1.md

---
*Purpose: Backup before graduation fix deployment*  
*Network: Arbitrum Sepolia (testnet)*