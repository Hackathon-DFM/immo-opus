# Current ABI State Documentation (Pre-Graduation Fix)

## Overview

This document details the current state of contract ABIs in the frontend, highlighting what's missing from our recent changes.

## ABI File Status

### Available ABI Files
Located in `/interface/lib/contracts/`:
- ✅ `BondingCurve.json`
- ✅ `CLOBAdapter.json`  
- ✅ `DirectPool.json`
- ✅ `ERC20Token.json`
- ✅ `MockUSDC.json`
- ✅ `ProjectFactory.json`
- ✅ `index.ts`

### Missing ABI Files
- ❌ `IDirectPool.json` - Interface file not generated
- ❌ `MockCLOBDex.json` - Contract not deployed/generated

## Function Availability Analysis

### DirectPool Contract ABI

#### ✅ Available Functions (Current ABI):
```typescript
// Core functionality
initialize(address,address,uint256,uint256,uint256)
registerMM(address)
finalizeMMs()
borrowTokens(uint256)
repayTokens(uint256)
emergencyWithdraw(address)

// View functions
getPoolInfo()
getMMAllocation()
borrowedAmount(address)
isRegisteredMM(address)

// CLOB related
setCLOBConfig(address,address)
createCLOBAdapter(address)
mmToCLOBAdapter(address)
```

#### ❌ Missing Functions (Our Recent Changes):
```typescript
// Graduation functionality
handleGraduation(address newOwner, uint256 tokenAmount)

// Events
event Graduated(address indexed newOwner, uint256 totalLiquidity)
```

### BondingCurve Contract ABI

#### ✅ Available Functions:
```typescript
// Core trading
buy(uint256)
sell(uint256)
buyWithSlippage(uint256,uint256)
graduate()

// View functions
getCurrentPrice()
getCurrentMarketCap()
calculateBuyReturn(uint256)
canGraduate()
graduated()
```

#### ❌ Missing Logic (Not in ABI but in implementation):
- Updated `_graduate()` function that calls `handleGraduation()`
- The current deployed version doesn't call `handleGraduation()`

## Contract Interface Implications

### What Works with Current ABIs:
1. **Project Creation**: Both pool modes work
2. **MM Operations**: Basic borrow/repay works
3. **Bonding Curve Trading**: Buy/sell functions work
4. **CLOB Setup**: Can create adapters manually

### What Doesn't Work:
1. **Graduation**: BondingCurve graduates but DirectPool totalLiquidity stays 0
2. **Post-Graduation MM Operations**: MMs can't borrow from graduated pools
3. **Auto-CLOB Creation**: Manual adapter creation required
4. **Event Listening**: Can't listen for `Graduated` events

## Frontend Integration Status

### Hook Compatibility:
- `useDirectPool()` ✅ - Works with current ABI
- `useDirectPoolBorrow()` ⚠️ - Basic functionality works
- `useBondingCurve()` ⚠️ - Trading works, graduation partially broken
- `useCreateProject()` ✅ - Works for both modes

### Component Status:
- **Project Creation Form** ✅ - Fully functional
- **PO Dashboard** ✅ - Shows projects correctly  
- **MM Dashboard** ⚠️ - Borrow works, graduated pools problematic
- **Bonding Curve Trading** ⚠️ - Trading works, graduation issues

## ABI Generation Command

To regenerate ABIs after contract changes:
```bash
cd interface
node scripts/extract-abis.js
```

This script:
1. Reads from `../contracts/out/`
2. Extracts ABI from compiled JSON
3. Creates individual ABI files in `lib/contracts/`
4. Updates `index.ts` with exports

## Required Actions After New Deployment

1. **Rebuild Contracts**:
   ```bash
   cd contracts
   forge build
   ```

2. **Extract New ABIs**:
   ```bash
   cd interface  
   node scripts/extract-abis.js
   ```

3. **Verify New Functions Available**:
   ```bash
   grep -c "handleGraduation" lib/contracts/DirectPool.json
   # Should return > 0 after fix
   ```

## Breaking Changes Expected

After redeployment with graduation fix:

### New ABI Additions:
- `handleGraduation` function in DirectPool
- `Graduated` event in DirectPool  
- Updated `borrowTokens` logic (same signature, different behavior)

### No Breaking Changes:
- All existing function signatures remain the same
- Frontend code doesn't need modification
- Only new functionality added

---
*Created: 2025-07-14*  
*Purpose: Document current ABI limitations before graduation fix*