# MM Dashboard Updates Task List

## Overview
This document tracks the required updates to the MM Dashboard based on the requirements in `catetan.txt` and the whitelisted projects discussion.

## Branch: mm-pool-borrow

## Tasks

### 1. ✅ Available Projects Component - Filter to Whitelisted Only
**Priority**: High  
**Status**: Completed  
**Description**: Filter projects to only show those where the current MM is registered (whitelisted)

- [x] Modify `AvailableProjects` component to filter projects where `isRegistered === true`
- [x] Remove "Not Registered" status badge (all shown projects will be registered)
- [x] Add empty state message: "No whitelisted projects available"
- [x] Update loading state to account for registration checks

### 2. ✅ Update Table Headers
**Priority**: Low  
**Status**: Completed  
**Description**: Minor text updates to match requirements

- [x] Change "Allocation" to "Total Allocation" in table header
- [x] Verify "Whitelisted Projects" title is correct (already done)

### 3. ✅ Create Borrow Modal
**Priority**: High  
**Status**: Completed  
**Description**: Implement modal for borrow action instead of direct callback

- [x] Create `BorrowModal` component in `/components/mm-dashboard/` (already existed)
- [x] Modal should include:
  - [x] Amount input field with validation
  - [x] Max amount button
  - [x] CLOB dropdown (showing "GTX", disabled)
  - [x] Display available amount to borrow
  - [x] Confirm/Cancel buttons
- [x] Add proper form validation:
  - [x] Amount must be > 0
  - [x] Amount must be <= maxBorrowAmount
  - [x] Show helpful error messages

### 4. ✅ Update Borrow Button Behavior
**Priority**: High  
**Status**: Completed  
**Description**: Connect borrow button to modal

- [x] Update `ProjectRow` to use modal instead of `onSelectProject`
- [x] Add modal state management
- [x] Pass necessary project data to modal
- [x] Handle successful borrow transaction

**Note**: This functionality was already implemented correctly. The borrow button calls `onSelectProject`, which is handled by the parent component (mm-dashboard/page.tsx) that manages the modal state. When a project is selected, the parent renders the BorrowModal with the selected project address. This architecture is actually preferable as it keeps the modal state management at the parent level (single source of truth) and makes the AvailableProjects component more reusable.

### 5. ❌ Current Positions Component Updates
**Priority**: Medium  
**Status**: Not Started  
**Description**: Updates based on catetan.txt

- [ ] Remove "View CLOB Trading" link
- [ ] Add "Repay" button in action column
- [ ] Change "Current Balance" column to show "Connected to CLOB" text
- [ ] Mock P&L data for now

### 6. ❌ Testing Requirements
**Priority**: High  
**Status**: Not Started  
**Description**: Ensure all scenarios work correctly

- [ ] Test with MM that has no registered projects
- [ ] Test with MM that has multiple registered projects
- [ ] Test borrow flow with various amounts
- [ ] Test when allocation is fully borrowed
- [ ] Test when MM list not finalized
- [ ] Verify transaction states (pending, confirming, success, error)

## Implementation Notes

### Data Flow
1. `useAllProjects()` → Get all projects
2. For each project, check if current MM is registered using `useDirectPool()`
3. Filter to only show registered projects
4. Display in table with borrow action

### Key Validations
- MM must be registered (handled by filtering)
- MM list must be finalized
- Borrow amount must be > 0 and <= available allocation
- Proper error handling for failed transactions

### State Management
- Modal open/close state
- Selected project for borrowing
- Transaction state (idle, pending, success, error)
- Form validation state

## Dependencies
- Existing hooks: `useDirectPool`, `useAllProjects`, `useDirectPoolBorrow`
- New components: `BorrowModal`
- UI components: Modal, Input, Button, Select (disabled)

## Acceptance Criteria
1. MM only sees projects they're registered for
2. Borrow action opens modal with amount input and disabled CLOB dropdown
3. Successful borrow updates the available amount in real-time
4. Current positions shows "Connected to CLOB" and repay action
5. All edge cases handled gracefully

## References
- Requirements: `/catetan.txt`
- Source of Truth: `/immo-source-of-truth-new.md`
- Related Components: 
  - `/interface/components/mm-dashboard/available-projects.tsx`
  - `/interface/components/mm-dashboard/current-positions.tsx`

## Progress Legend
- ❌ Not Started
- 🔄 In Progress
- ✅ Completed
- 🚫 Blocked