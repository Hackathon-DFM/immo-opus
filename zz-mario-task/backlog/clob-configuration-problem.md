# CLOB Configuration Problem

## Issue Summary
Market Makers (MMs) cannot borrow tokens from Direct Pools due to missing CLOB configuration.

## Problem Description
When an MM attempts to borrow tokens using the "Borrow" button in the MM Dashboard, the transaction fails because the DirectPool contract requires CLOB configuration (clobDex and usdc addresses) to be set first.

## Root Cause
1. The DirectPool contract's `borrowTokens` function checks for CLOB configuration:
   ```solidity
   require(clobDex != address(0) && usdc != address(0), "CLOB not configured");
   ```

2. CLOB configuration must be set by the Project Owner using `setCLOBConfig`:
   ```solidity
   function setCLOBConfig(address _clobDex, address _usdc) external onlyPO
   ```

3. The frontend doesn't provide any UI for Project Owners to call this function.

## Impact
- Blocks core MM functionality - MMs cannot borrow tokens
- Prevents the main use case of the protocol from working
- Affects all Direct Pool projects

## Important Notes
1. **Source of Truth Mismatch**: The source of truth document doesn't mention CLOB configuration as a manual step. It assumes MMs can borrow immediately after pool finalization.

2. **Current System**: Only one CLOB exists (GTX/MockCLOBDex), so this could be automated rather than requiring manual configuration.

## Error Flow
1. PO creates Direct Pool ✓
2. PO registers MMs ✓
3. PO finalizes MMs ✓
4. MM tries to borrow → **FAILS** with "CLOB not configured"

## Potential Solutions Discussed
1. Auto-configure CLOB during pool creation in ProjectFactory
2. Add UI in PO Dashboard to configure CLOB
3. Modify contract to auto-configure on first borrow (requires redeploy)

## Status
**Pending team discussion** - Need to decide on approach before implementing fix.