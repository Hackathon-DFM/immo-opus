# IMMO Test Suite Documentation

This document describes the comprehensive test suite for the IMMO (Initial Market Making Offering) protocol.

## Overview

The test suite covers all smart contracts and provides both unit and integration testing to ensure the protocol works correctly across all scenarios.

## Test Structure

```
contracts/test/
├── BaseTest.sol              # Base test contract with common setup
├── unit/                     # Unit tests for individual contracts
│   ├── ERC20Token.t.sol     # ERC20 token functionality
│   ├── ProjectFactory.t.sol  # Project creation and validation
│   ├── DirectPool.t.sol     # MM registration and borrowing
│   └── BondingCurve.t.sol   # AMM mechanics and graduation
├── integration/              # Integration tests for complete flows
│   ├── HappyPath.t.sol      # Successful end-to-end scenarios
│   └── EdgeCases.t.sol      # Edge cases and error conditions
└── test_runner.sh           # Automated test execution script
```

## Running Tests

### Quick Start

```bash
cd contracts
./test_runner.sh
```

### Individual Test Files

```bash
# Unit tests
forge test --match-path "test/unit/ERC20Token.t.sol" -vv
forge test --match-path "test/unit/ProjectFactory.t.sol" -vv
forge test --match-path "test/unit/DirectPool.t.sol" -vv
forge test --match-path "test/unit/BondingCurve.t.sol" -vv

# Integration tests
forge test --match-path "test/integration/HappyPath.t.sol" -vv
forge test --match-path "test/integration/EdgeCases.t.sol" -vv
```

### Specific Test Functions

```bash
# Happy path scenarios
forge test --match-test "test_CompleteDirectPoolFlow" -vvv
forge test --match-test "test_CompleteBondingCurveToDirectPoolFlow" -vvv

# Edge cases
forge test --match-test "test_BondingCurve_GraduationAtExactTarget" -vvv
forge test --match-test "test_EmergencyWithdraw_MultipleExpiredMMs" -vvv
```

## Test Coverage

### Unit Tests

#### ERC20Token.t.sol
- ✅ Token deployment with correct parameters
- ✅ Initial supply allocation
- ✅ Transfer functionality
- ✅ Approval and allowance mechanisms
- ✅ Transfer from functionality
- ✅ Edge cases and error conditions
- ✅ Fuzz testing for transfers

#### ProjectFactory.t.sol
- ✅ Direct Pool project creation (new token)
- ✅ Bonding Curve project creation (new token)
- ✅ Project creation with existing tokens
- ✅ Parameter validation (price, time limits)
- ✅ Project tracking and ownership
- ✅ Event emissions
- ✅ Multiple projects per owner

#### DirectPool.t.sol
- ✅ Initial state verification
- ✅ MM registration and unregistration
- ✅ MM finalization
- ✅ Allocation calculations
- ✅ Token borrowing mechanics
- ✅ Repayment functionality (full and partial)
- ✅ Emergency withdrawal after expiry
- ✅ CLOB adapter creation and management
- ✅ Access control and permissions

#### BondingCurve.t.sol
- ✅ Initial state and virtual AMM setup
- ✅ Buy operations with price calculations
- ✅ Sell operations with slippage
- ✅ Price discovery and market cap tracking
- ✅ Graduation mechanism
- ✅ Constant product formula (x*y=k)
- ✅ Post-graduation behavior
- ✅ Fuzz testing for buy/sell operations

### Integration Tests

#### HappyPath.t.sol
- ✅ **Complete Direct Pool Flow**
  - Project creation → MM registration → Finalization → Borrowing → Trading → Repayment → Emergency withdrawal
- ✅ **Complete Bonding Curve to Direct Pool Flow**
  - Project creation → Public trading → Graduation → MM operations
- ✅ **Multiple MMs with Partial Repayments**
  - Various MM strategies and repayment patterns
- ✅ **CLOB Adapter Trading Simulation**
  - Order placement and management

#### EdgeCases.t.sol
- ✅ Graduation at exact target market cap
- ✅ All MMs borrowing maximum allocation
- ✅ Single MM scenarios
- ✅ Minimum buy amounts on bonding curve
- ✅ Multiple expired MM emergency withdrawals
- ✅ Overpayment scenarios
- ✅ Race conditions during graduation
- ✅ Zero allocation edge cases

## Frontend Mock Testing

### Mock Data (`interface/lib/mock/`)

The frontend includes comprehensive mock data for testing without deployed contracts:

- **Mock Addresses**: Contract and user addresses for testing
- **Mock Projects**: Sample Direct Pool and Bonding Curve projects
- **Mock Positions**: MM borrowing positions with various states
- **Mock Price History**: Dynamic price data for charts
- **Mock Transactions**: Sample transaction history

### Mock Hooks

Mock implementations of all Web3 hooks for frontend testing:

```typescript
// Enable mock mode in development
NEXT_PUBLIC_MOCK_MODE=true

// Available mock hooks
useMockAllProjects()
useMockDirectPool()
useMockBondingCurve()
useMockTokenInfo()
useMockPriceHistory()
useMockBondingCurveBuy()
useMockDirectPoolBorrow()
// ... and more
```

## Key Test Scenarios

### 1. Direct Pool Happy Path
1. Project Owner creates Direct Pool project
2. Registers multiple Market Makers
3. Finalizes MM list
4. MMs borrow tokens at different amounts
5. Tokens transferred to CLOB adapters
6. MMs trade and generate profits/losses
7. MMs repay borrowed amounts
8. Emergency withdrawal for expired positions

### 2. Bonding Curve to Direct Pool
1. Project Owner creates Bonding Curve project
2. Users buy/sell tokens on curve
3. Price discovery and market cap growth
4. Graduation when target reached
5. Automatic transfer to Direct Pool
6. MM registration and operations begin

### 3. Edge Cases
- Exact graduation scenarios
- Maximum allocation utilization
- Time expiry handling
- Race conditions
- Zero allocation scenarios
- Overpayment protection

## Gas Usage Analysis

The test suite includes gas reporting for optimization:

```bash
forge test --gas-report
```

Key metrics tracked:
- Project creation gas costs
- Borrowing operation costs
- Repayment transaction costs
- Bonding curve trading costs
- Graduation gas usage

## Coverage Reports

Generate coverage reports to ensure comprehensive testing:

```bash
forge coverage --report lcov
```

Target coverage: >95% for all critical paths

## Testing Best Practices

1. **Isolation**: Each test is independent and sets up its own state
2. **Realistic Data**: Test with realistic token amounts and time periods
3. **Edge Cases**: Comprehensive testing of boundary conditions
4. **Gas Optimization**: Monitor gas usage for expensive operations
5. **Event Verification**: Ensure proper event emissions
6. **Access Control**: Verify permission systems work correctly
7. **State Transitions**: Test all valid state changes
8. **Error Conditions**: Verify proper error handling

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example CI configuration
- name: Run Tests
  run: |
    cd contracts
    forge install
    forge test --gas-report
    forge coverage --report lcov
```

## Contributing

When adding new features:

1. Write unit tests first (TDD approach)
2. Add integration tests for new flows
3. Update mock data for frontend testing
4. Ensure all tests pass
5. Maintain >95% coverage
6. Document new test scenarios

## Troubleshooting

Common issues and solutions:

- **Build failures**: Run `forge clean && forge build`
- **RPC issues**: Check network configuration
- **Mock mode**: Ensure `NEXT_PUBLIC_MOCK_MODE=true` for frontend testing
- **Coverage gaps**: Use `forge coverage --report debug` for detailed analysis