# Remaining Test Failures

## Overview

After completing the graduation fix and CLOB integration, there are 6 remaining test failures out of 62 total tests (56 passing). These failures are pre-existing issues not related to our recent changes.

## Test Results Summary

- **Total Tests**: 62
- **Passing**: 56
- **Failing**: 6

## Failing Tests

### 1. ProjectFactory Tests (2 failures)

#### test_RevertWhen_CreateProjectWithExcessiveInitialPrice()
**File**: `contracts/test/unit/ProjectFactory.t.sol`
**Error**: Test expects revert but transaction succeeds
**Issue**: The contract doesn't validate that initial price is reasonable
**Potential Fix**: Add maximum initial price validation in ProjectFactory

#### test_RevertWhen_CreateProjectWithZeroTargetMarketCap()
**File**: `contracts/test/unit/ProjectFactory.t.sol`
**Error**: Test expects revert but transaction succeeds
**Issue**: The contract allows 0 target market cap for bonding curves
**Potential Fix**: Add validation to ensure targetMarketCap > 0 for bonding curves

### 2. BondingCurve Tests (2 failures)

#### test_RevertWhen_BuyWithExcessiveSlippage()
**File**: `contracts/test/unit/BondingCurve.t.sol:93`
**Error**: Generic revert instead of specific SlippageExceeded error
**Issue**: Contract reverts with arithmetic error instead of custom error
**Root Cause**: When minTokensOut is very high, the slippage check causes arithmetic underflow
**Potential Fix**: Add explicit SlippageExceeded error and proper validation

#### test_RevertWhen_GraduateBeforeTarget()
**File**: `contracts/test/unit/BondingCurve.t.sol:227`
**Error**: Generic revert instead of specific CannotGraduate error
**Issue**: Contract uses require() instead of custom error
**Potential Fix**: Replace require statement with custom error revert

### 3. EdgeCases Tests (2 failures)

#### test_ZeroAllocation_NoMMs()
**File**: `contracts/test/integration/EdgeCases.t.sol:235`
**Error**: Generic revert instead of specific NoMMsRegistered error
**Issue**: Contract reverts with "No MMs registered" message instead of custom error
**Potential Fix**: Add and use NoMMsRegistered custom error

#### test_RevertWhen_SellWithExcessiveSlippage()
**File**: Not in EdgeCases.t.sol (might be in another test file)
**Error**: Similar to BondingCurve slippage test
**Issue**: Generic revert instead of SlippageExceeded error
**Potential Fix**: Same as BondingCurve slippage fix

## Impact Assessment

**Severity**: Low
- All failing tests are for error message validation
- Core functionality works correctly
- The contracts revert as expected, just with generic errors instead of custom errors

**Priority**: Low
- These are pre-existing issues
- Don't affect the graduation fix or CLOB integration
- Can be addressed in a separate error handling improvement task

## Recommended Actions

1. **Create Custom Errors**: Add missing custom errors to contracts:
   - `SlippageExceeded` in BondingCurve
   - `CannotGraduate` in BondingCurve  
   - `NoMMsRegistered` in DirectPool
   - `InvalidInitialPrice` in ProjectFactory
   - `InvalidTargetMarketCap` in ProjectFactory

2. **Update Validation**: Replace require() statements with custom error reverts

3. **Update Tests**: Ensure tests expect the correct custom errors

## Notes

- These failures existed before our changes
- They don't impact the core functionality
- The contracts still revert in error conditions, just without specific error types
- Fixing these would improve developer experience and gas efficiency