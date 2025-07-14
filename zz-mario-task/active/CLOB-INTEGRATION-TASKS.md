# CLOB Integration Tasks

## Overview

This document outlines the required changes to properly integrate CLOB (Central Limit Order Book) functionality into the IMMO protocol. The main issue discovered is that the repay functionality fails because tokens are not where the system expects them to be.

## Current Problem

### Issue Discovered

- MM can successfully borrow tokens
- MM cannot repay tokens - transaction fails
- Error occurs because `DirectPool.repayTokens()` expects tokens in MM's wallet
- But tokens may be in CLOBAdapter or not properly tracked

### Root Cause

1. **Inconsistent token flow**:

   - If CLOBAdapter exists → tokens go to CLOBAdapter → deposited to MockCLOBDex
   - If no CLOBAdapter → tokens go directly to MM wallet
   - This inconsistency causes confusion about where tokens actually are

2. **Missing CLOB deployment**:

   - MockCLOBDex is not deployed in the deployment script
   - CLOB config is not set after DirectPool creation
   - CLOBAdapter may not be created when MM borrows

3. **Repay flow assumption**:
   - DirectPool expects to pull tokens from MM's wallet
   - But tokens are in MockCLOBDex (via CLOBAdapter)
   - MM needs to withdraw from CLOB first, then repay

## Required Changes

### 1. **BaseTest.sol** (Test Infrastructure)

**Why**: Need MockCLOBDex available for all tests

**Changes**:

```solidity
// Add to state variables
MockCLOBDex public clobDex;

// Add to setUp()
clobDex = new MockCLOBDex();

// Add helper function
function setCLOBConfig(DirectPool pool) internal {
    vm.prank(pool.projectOwner());
    pool.setCLOBConfig(address(clobDex), address(usdc));
}
```

### 2. **DirectPool.sol** (Core Contract)

**Why**: Ensure tokens ALWAYS go to CLOBAdapter (source of truth per requirements)

**Current behavior** (lines 142-152):

- Checks if CLOBAdapter exists
- If yes → send to adapter
- If no → send to MM wallet

**Required changes**:

```solidity
function borrowTokens(uint256 amount) external onlyRegisteredMM whenFinalized nonReentrant {
    // ... existing validation ...

    // NEW: Ensure CLOBAdapter exists before borrowing
    if (mmToCLOBAdapter[msg.sender] == address(0)) {
        // Check CLOB config is set
        require(clobDex != address(0) && usdc != address(0), "CLOB not configured");

        // Auto-create CLOBAdapter
        createCLOBAdapter(msg.sender);
    }

    // ... existing state updates ...

    // CHANGED: Always send to CLOBAdapter (never to MM directly)
    address adapter = mmToCLOBAdapter[msg.sender];
    IERC20(token).safeTransfer(adapter, amount);

    // Notify adapter to deposit to CLOB
    CLOBAdapter(adapter).receiveTokens(amount);

    emit TokensBorrowed(msg.sender, amount);
}
```

### 3. **DirectPool.t.sol** (Test Updates)

**Why**: Tests assume tokens go to MM wallet, but they should go to CLOB

**Changes needed for EVERY borrow test**:

```solidity
// Before any borrow test
setCLOBConfig(pool); // Set CLOB configuration

// After borrow, check tokens are in CLOB, not MM wallet
address adapter = pool.mmToCLOBAdapter(marketMaker1);
assertTrue(adapter != address(0), "CLOBAdapter should exist");
assertEq(token.balanceOf(marketMaker1), 0, "MM should have no tokens");
assertEq(
    MockCLOBDex(clobDex).balances(adapter, address(token)),
    borrowAmount,
    "Tokens should be in CLOB"
);
```

**Repay test changes**:

```solidity
// Step 1: Withdraw from CLOB to MM wallet
vm.startPrank(marketMaker1);
CLOBAdapter(adapter).withdrawTokens(borrowAmount);
vm.stopPrank();

// Step 2: Now MM has tokens, can approve and repay
vm.startPrank(marketMaker1);
token.approve(address(pool), borrowAmount);
pool.repayTokens(borrowAmount);
vm.stopPrank();
```

### 4. **DeployIMMO.s.sol** (Deployment Script)

**Why**: Need MockCLOBDex deployed for the system to work

**Changes**:

```solidity
// Deploy MockCLOBDex
MockCLOBDex clobDex = new MockCLOBDex();
console.log("MockCLOBDex deployed at:", address(clobDex));

// Add to deployment JSON
'  "clobDex": "', vm.toString(address(clobDex)), '",\n',
```

## Implementation Order

1. **First**: Update `BaseTest.sol` to add MockCLOBDex
2. **Second**: Update `DirectPool.sol` to ensure CLOBAdapter creation
3. **Third**: Fix all tests in `DirectPool.t.sol`
4. **Fourth**: Update deployment script

## Key Design Decisions

### Decision: Auto-create CLOBAdapter

**Rationale**:

- Ensures tokens ALWAYS go to CLOBAdapter (requirement)
- Simplifies MM experience (no manual adapter creation)
- Consistent behavior across all MMs

### Decision: Require CLOB config before borrowing

**Options considered**:

1. Pass CLOB address to ProjectFactory (changes factory interface)
2. Require PO to set CLOB config after project creation
3. Auto-create with a default CLOB address

**Chosen**: Option 2 - PO must set CLOB config
**Why**: Maintains flexibility for different CLOB integrations per project

## Testing Requirements

### New Test Cases to Add:

1. Test auto-creation of CLOBAdapter on first borrow
2. Test borrowing fails if CLOB not configured
3. Test complete flow: borrow → trade → withdraw → repay
4. Test multiple borrows use same CLOBAdapter
5. Test emergency withdraw with tokens in CLOB

### Existing Tests to Fix:

- `test_BorrowTokens`: Verify tokens in CLOB
- `test_RepayTokens`: Add withdraw step
- `test_PartialRepay`: Add withdraw step
- `test_MaxBorrowAmount`: Ensure CLOB configured
- Remove skip from `test_CLOBAdapterCreation`

## Frontend Considerations (Future)

Currently not implementing frontend changes, but will need:

1. UI for PO to set CLOB configuration
2. Show "Connected to CLOB" instead of token balance
3. Add "Withdraw from CLOB" button before repay
4. Update repay flow to handle withdraw → approve → repay

## Summary

The core issue is that tokens need to consistently go to CLOBAdapter (which deposits to MockCLOBDex), but the current implementation allows tokens to go directly to MM wallets. This breaks the repay flow because DirectPool expects tokens in the MM wallet, but they're actually in the CLOB system.

The solution ensures:

1. CLOBAdapter is always created before borrowing
2. Tokens always go to CLOBAdapter
3. Repay flow includes withdraw from CLOB first
4. Tests verify the correct token locations

## Implementation Tasks

### Confirmed Approach

- **Frontend**: CLOB dropdown shows "GTX" (disabled, informational only)
- **Contract**: Handles all CLOB logic automatically (auto-creates CLOBAdapter, manages token flow)
- **No frontend → contract communication** about CLOB selection
- **One CLOB per pool**: Set by PO via `setCLOBConfig()`

### Task List

#### 1. ✅ Update Test Infrastructure (BaseTest.sol)

**Priority**: High  
**Status**: Completed  
**Description**: Add MockCLOBDex deployment and helper functions

- [x] Add `MockCLOBDex public clobDex` state variable (already existed)
- [x] Deploy MockCLOBDex in `setUp()` (already existed)
- [x] Add `setCLOBConfig(DirectPool pool)` helper function
- [x] Import MockCLOBDex contract (already existed)

#### 2. ✅ Update Core Contract (DirectPool.sol)

**Priority**: High  
**Status**: Completed  
**Description**: Ensure tokens always go to CLOBAdapter

- [x] Add CLOB config check in `borrowTokens()`
- [x] Auto-create CLOBAdapter if doesn't exist
- [x] Remove conditional logic - always send to CLOBAdapter
- [x] Call `receiveTokens()` on CLOBAdapter
- [x] Keep event unchanged: `emit TokensBorrowed(msg.sender, amount)`
- [x] Fix: Changed `createCLOBAdapter` from `external` to `public` for internal calls

#### 3. ✅ Fix All Tests (DirectPool.t.sol)

**Priority**: High  
**Status**: Completed  
**Description**: Update tests to expect tokens in CLOB

- [x] Update `test_BorrowTokens` - verify tokens in MockCLOBDex
- [x] Update `test_RepayTokens` - add withdraw from CLOB step
- [x] Update `test_PartialRepay` - add withdraw from CLOB step
- [x] Fix `test_CLOBAdapterCreation` - remove skip
- [x] Update all assertions from `token.balanceOf(mm)` to CLOB checks
- [x] Add `setCLOBConfig()` call before any borrow operation

#### 4. ❌ Update Deployment Script (DeployIMMO.s.sol)

**Priority**: Medium  
**Status**: Not Started  
**Description**: Deploy MockCLOBDex for testing

- [ ] Deploy MockCLOBDex after MockUSDC
- [ ] Add clobDex address to deployment JSON
- [ ] Log deployment address

#### 5. ❌ Verify End-to-End Flow

**Priority**: High  
**Status**: Not Started  
**Description**: Test complete borrow → trade → withdraw → repay flow

- [ ] Run all tests with new CLOB integration
- [ ] Verify borrow creates CLOBAdapter automatically
- [ ] Verify tokens flow: DirectPool → CLOBAdapter → MockCLOBDex
- [ ] Verify withdraw → approve → repay flow works
- [ ] Check edge cases (multiple borrows, partial repays)

### Not Changing (Confirmed)

- ✅ Event structure remains: `event TokensBorrowed(address indexed mm, uint256 amount)`
- ✅ Frontend CLOB dropdown remains disabled showing "GTX"
- ✅ No CLOB selection logic in frontend
- ✅ One CLOB per pool (set by PO)

## Progress Legend

- ❌ Not Started
- 🔄 In Progress
- ✅ Completed
- 🚫 Blocked
