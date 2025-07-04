# IMMO - Initial Market Making Offering: Source of Truth Documentation

## Overview

IMMO (Initial Market Making Offering) is a DeFi protocol that enables project owners to launch tokens with integrated market making capabilities. The protocol supports two pool modes: Direct Pool and Bonding Curve, with registered Market Makers (MMs) able to borrow tokens for trading on CLOB DEXs.

### Key Features
- Two pool modes: Direct Pool and Bonding Curve
- Registered MM system with borrowing capabilities
- CLOB DEX integration for professional market making
- Bonding curve graduation mechanism
- Trust-based MM system with time-limited borrowing

### Target Network
- Arbitrum Sepolia (testnet)

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Project   │────────▶│  DirectPool │◀────────│   Market    │
│   Factory   │         │      or     │         │   Makers    │
└─────────────┘         │BondingCurve │         └─────────────┘
                        └──────┬──────┘                │
                               │                       │
                               ▼                       ▼
                        ┌─────────────┐         ┌─────────────┐
                        │    Token    │         │CLOBAdapter  │
                        │  (ERC20)    │         │  (per MM)   │
                        └─────────────┘         └─────────────┘
```

## Smart Contract Specifications

### 1. ProjectFactory Contract

**Purpose**: Central contract for creating new IMMO projects

**Key Functions**:
```solidity
function createProject(
    bool isNewToken,
    address existingToken,        // if isNewToken == false
    string memory name,           // if isNewToken == true
    string memory symbol,         // if isNewToken == true
    string memory description,    // if isNewToken == true
    uint256 tokenAmount,          // amount to deposit if existing token
    PoolMode mode,               // DIRECT_POOL or BONDING_CURVE
    uint256 initialPrice,        // for Direct Pool (6 decimals USDC)
    uint256 targetMarketCap,     // for Bonding Curve graduation
    uint256 borrowTimeLimit      // in seconds
) external returns (address projectAddress)

enum PoolMode {
    DIRECT_POOL,
    BONDING_CURVE
}
```

**State Variables**:
- `mapping(address => address[]) public projectsByOwner`
- `address[] public allProjects`

### 2. DirectPool Contract

**Purpose**: Pool for MM borrowing operations (no user trading)

**Key Functions**:
```solidity
// MM Management (only PO)
function registerMM(address mm) external onlyPO
function unregisterMM(address mm) external onlyPO
function finalizeMMs() external onlyPO
function emergencyWithdraw(address mm) external onlyPO // when borrow time expired

// MM Operations (only registered MMs)
function borrowTokens(uint256 amount) external onlyRegisteredMM
function repayTokens(uint256 amount) external onlyRegisteredMM

// View Functions
function getMaxBorrowAmount(address mm) external view returns (uint256)
function getBorrowedAmount(address mm) external view returns (uint256)
function getMMAllocation() external view returns (uint256) // per MM allocation
```

**State Variables**:
```solidity
address public projectOwner;
address public token;
uint256 public initialPrice; // in USDC (6 decimals)
uint256 public borrowTimeLimit;
bool public isFinalized;

mapping(address => bool) public registeredMMs;
mapping(address => uint256) public borrowedAmount;
mapping(address => uint256) public borrowTimestamp;
mapping(address => address) public mmToCLOBAdapter;
address[] public mmList;
```

**Business Logic**:
- MM allocation = Total Pool Liquidity / Number of MMs
- Each MM can borrow up to their allocation
- Unused allocation by one MM cannot be used by others
- When finalized, MM list cannot be changed
- Support multiple tokens in pool (after bonding curve graduation)

### 3. BondingCurve Contract

**Purpose**: Initial token sale with price discovery mechanism

**Key Functions**:
```solidity
// User Operations
function buy(uint256 usdcAmount) external returns (uint256 tokensReceived)
function sell(uint256 tokenAmount) external returns (uint256 usdcReceived)

// Graduation
function graduate() external // callable by anyone when target market cap reached

// View Functions
function getCurrentPrice() external view returns (uint256)
function getCurrentMarketCap() external view returns (uint256)
function canGraduate() external view returns (bool)
```

**State Variables**:
```solidity
address public projectOwner;
address public token;
address public directPool;
uint256 public targetMarketCap;
uint256 public virtualUSDCReserve;
uint256 public tokenReserve;
bool public graduated;
```

**Bonding Curve Formula**:
- Uses virtual AMM: x * y = k
- x = token reserve
- y = virtual USDC reserve
- Initial virtual USDC = total supply * initial price
- No fees for buy/sell

**Graduation Logic**:
- When current market cap >= target market cap
- Transfer all remaining tokens and collected USDC to DirectPool
- Mark as graduated (bonding curve becomes inactive)

### 4. CLOBAdapter Contract

**Purpose**: Interface for MM to trade on CLOB DEXs

**Key Functions**:
```solidity
// Order Management
function placeLimitOrder(
    uint256 price,
    uint256 amount,
    bool isBuy
) external onlyMM returns (uint256 orderId)

function placeMarketOrder(
    uint256 amount,
    bool isBuy
) external onlyMM returns (uint256 executedAmount)

function cancelOrder(uint256 orderId) external onlyMM

// View Functions
function getBalance() external view returns (uint256 tokenBalance, uint256 usdcBalance)
function getOrders() external view returns (Order[] memory)
```

**State Variables**:
```solidity
address public mm;
address public directPool;
address public token;
mapping(uint256 => Order) public orders;
```

### 5. ERC20Token Contract

**Purpose**: Standard ERC20 token for newly created projects

**Specifications**:
- Basic ERC20 implementation
- Fixed supply: 1,000,000,000 (1 billion) tokens
- 18 decimals
- No additional features (burn, pause, etc.)

## State Management & User Flows

### Project States

```
CREATED → ACTIVE → (FINALIZED)
                    ↓
               MM_BORROWING
```

### Pool Mode Flows

#### Direct Pool Flow
1. PO creates project with Direct Pool mode
2. PO registers MMs
3. PO finalizes MM list
4. MMs borrow tokens → tokens transfer to their CLOBAdapter
5. MMs trade on CLOB DEX
6. MMs repay (partial or full)
7. If time limit expires, PO can emergency withdraw

#### Bonding Curve Flow
1. PO creates project with Bonding Curve mode
2. Users buy/sell tokens on bonding curve
3. When market cap reaches target → graduation
4. All tokens & USDC transfer to Direct Pool
5. PO registers and finalizes MMs
6. Continue with Direct Pool flow

### MM Borrowing States

```
REGISTERED → FINALIZED → BORROWING → REPAID
                ↓                      ↓
             EXPIRED ←─────────────────┘
```

## Integration Points

### 1. Frontend ↔ Smart Contracts

**Project Creation Form**:
- Token selection (new/existing)
- Pool mode selection
- Parameter inputs with validation
- Default values:
  - MM Borrow Time Limit: 7 days
  - Initial Price: $0.0001
  - Target Market Cap: $10,000

**MM Dashboard**:
- Borrow interface with max amount display
- Repay interface with current balance
- CLOB trading interface
- P&L tracking

**PO Dashboard**:
- MM registration/management
- Finalize MMs button
- Emergency withdraw for expired borrows
- Pool statistics

### 2. Smart Contracts ↔ CLOB DEX

- CLOBAdapter acts as custody for borrowed tokens
- Integration with CLOB DEX protocols via standard interfaces
- Order placement and management
- Balance tracking

## Parameters & Constraints

### Creation Parameters

| Parameter | Direct Pool | Bonding Curve | Constraints |
|-----------|------------|---------------|-------------|
| Token Amount | Required if existing token | N/A (100% of supply) | > 0 |
| Initial Price | Required | Calculated from virtual reserve | 0.1x - 10x of $0.0001 |
| Target Market Cap | N/A | Required | > 0 |
| Borrow Time Limit | Required | Required | 1-30 days |

### Operating Constraints

- **MM Allocation**: Total liquidity / Number of registered MMs
- **Borrow Amount**: 0 < amount <= MM allocation
- **Repay**: Can be partial, no minimum
- **Price Range**: Determined by CLOB DEX
- **Graduation**: Automatic when market cap reached

## Frontend Requirements

### Pages/Components

1. **Home/Explorer**
   - List all projects
   - Filter by pool mode, status
   - Search functionality

2. **Create Project**
   - Multi-step form
   - Parameter validation
   - Cost estimation

3. **Project Detail**
   - Pool statistics
   - MM list and status
   - Trading charts (for bonding curve)
   - Buy/Sell interface (for bonding curve)

4. **MM Dashboard**
   - Available projects
   - Borrow/Repay interface
   - CLOB trading interface
   - Position tracking

5. **PO Dashboard**
   - My projects
   - MM management
   - Emergency controls
   - Revenue tracking

### Web3 Integration

- **RainbowKit** for wallet connection
  - Support MetaMask, WalletConnect, Coinbase Wallet, etc.
  - Custom theme matching IMMO branding
  - Network switching to Arbitrum Sepolia
- Transaction management with status tracking
- Event listening for real-time updates
- Gas estimation with buffer (1.2x)

## Testing Scenarios

### Happy Path Tests

1. **Direct Pool with Existing Token**
   - PO deposits tokens
   - Registers 3 MMs
   - Finalizes
   - MM borrows 50%
   - MM profits and repays 100%+

2. **Bonding Curve to Direct Pool**
   - Create with new token
   - Users buy until graduation
   - Auto-transfer to Direct Pool
   - MM operations begin

### Edge Case Tests

1. **MM Loss Scenario**
   - MM borrows 100%
   - Loses 50% trading
   - Can only repay 50%
   - PO absorbs loss

2. **Time Limit Expiry**
   - MM borrows but doesn't repay
   - Time limit expires
   - PO emergency withdraws
   - MM keeps profits, PO takes remaining

3. **Partial Operations**
   - MM borrows 30% of allocation
   - Multiple partial repays
   - Final settlement

## Security Considerations

- Reentrancy protection on all external calls
- Overflow/underflow protection (use SafeMath or Solidity 0.8+)
- Access control for all privileged functions
- Validation of all input parameters
- Emergency pause mechanism (optional for PoC)

## CLOB DEX Integration Details

### Mock CLOB Interface (for PoC)

Since CLOB DEX partner is TBD, create a mock interface:

```solidity
interface ICLOBDex {
    function deposit(address token, uint256 amount) external;
    function withdraw(address token, uint256 amount) external;
    function placeLimitOrder(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 priceInB,
        bool isBuy
    ) external returns (uint256 orderId);
    function cancelOrder(uint256 orderId) external;
    function getBalance(address trader, address token) external view returns (uint256);
}
```

### CLOBAdapter Implementation Notes

1. **Custody Model**:
   - Tokens borrowed from DirectPool sent to CLOBAdapter
   - CLOBAdapter deposits to CLOB DEX on MM's behalf
   - All trades executed through adapter

2. **Profit Distribution**:
   - When MM trades profitably, USDC accumulates in adapter
   - MM can withdraw profits anytime
   - On repay, only borrowed token amount returns to pool

3. **Loss Handling**:
   - If MM has insufficient tokens to repay, partial repay
   - Remaining loss absorbed by DirectPool (PO's risk)

### Future CLOB Partners Considerations

- Design adapter pattern for easy integration
- Standard interface for multiple CLOB DEXs
- Consider different fee structures
- Handle various order types

## Events

```solidity
// ProjectFactory
event ProjectCreated(address indexed project, address indexed owner, PoolMode mode);

// DirectPool
event MMRegistered(address indexed mm);
event MMUnregistered(address indexed mm);
event MMsFinalized();
event TokensBorrowed(address indexed mm, uint256 amount);
event TokensRepaid(address indexed mm, uint256 amount);
event EmergencyWithdraw(address indexed mm, uint256 amount);

// BondingCurve
event TokensPurchased(address indexed buyer, uint256 usdcAmount, uint256 tokensReceived);
event TokensSold(address indexed seller, uint256 tokenAmount, uint256 usdcReceived);
event Graduated(uint256 finalMarketCap);

// CLOBAdapter
event OrderPlaced(uint256 orderId, uint256 price, uint256 amount, bool isBuy);
event OrderCancelled(uint256 orderId);
event OrderExecuted(uint256 orderId, uint256 executedAmount);
```

## Next Steps

1. **Smart Contract Development**
   - Start with ERC20Token and ProjectFactory
   - Implement DirectPool with basic MM operations
   - Add BondingCurve with graduation
   - Create CLOBAdapter interface

2. **Frontend Development**
   - Setup Next.js with Web3 integration
   - Create project creation flow
   - Implement MM dashboard
   - Add PO management features

3. **Integration Testing**
   - Deploy to Arbitrum Sepolia
   - Test complete user journeys
   - Verify CLOB integration
   - Performance testing

## Notes for Implementation

- Keep contracts modular and upgradeable for future iterations
- Use events extensively for frontend state management
- Implement comprehensive error messages
- Consider gas optimization for frequent operations (borrow/repay)
- Mock CLOB DEX integration for initial testing

## Additional Implementation Details

### Foundry Project Setup

```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
# No optimizer for easier verification
optimizer = false

[rpc_endpoints]
arbitrum_sepolia = "${ARBITRUM_SEPOLIA_RPC_URL}"

[etherscan]
arbitrum_sepolia = { key = "${ARBISCAN_API_KEY}" }
```

### Project Structure
```
immo-contracts/
├── src/
│   ├── core/
│   │   ├── ProjectFactory.sol
│   │   ├── DirectPool.sol
│   │   └── BondingCurve.sol
│   ├── tokens/
│   │   └── ERC20Token.sol
│   ├── adapters/
│   │   └── CLOBAdapter.sol
│   ├── interfaces/
│   │   ├── IProjectFactory.sol
│   │   ├── IDirectPool.sol
│   │   ├── IBondingCurve.sol
│   │   └── ICLOBDex.sol
│   └── mocks/
│       ├── MockUSDC.sol
│       └── MockCLOBDex.sol
├── test/
│   ├── unit/
│   ├── integration/
│   └── invariant/
├── script/
│   ├── Deploy.s.sol
│   └── DeployTestnet.s.sol
├── foundry.toml
└── .env.example
```

### Deployment Commands
```bash
# Deploy without optimizer
forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia --broadcast --verify

# Verify if needed separately
forge verify-contract <address> src/ProjectFactory.sol:ProjectFactory --chain arbitrum_sepolia --watch
```

### Token Approval Flows

1. **For Existing Token Projects**:
   - User must approve ProjectFactory to spend tokens before creation
   - `token.approve(projectFactory, amount)`

2. **For Bonding Curve Purchases**:
   - User must approve BondingCurve to spend USDC
   - `usdc.approve(bondingCurve, usdcAmount)`

3. **For MM Repayment**:
   - If MM has tokens outside CLOBAdapter, need approval
   - `token.approve(directPool, repayAmount)`

### External Dependencies

```solidity
// Arbitrum Sepolia addresses
address constant USDC = 0x... // Mock USDC for testnet
address constant CLOB_DEX = 0x... // To be determined

// For mainnet later
// address constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831 // Arbitrum USDC
```

### Error Codes & Messages

```solidity
// ProjectFactory errors
error InvalidTokenAmount();        // "Token amount must be > 0"
error InvalidInitialPrice();       // "Price must be between 0.1x and 10x of default"
error InvalidTimeLimit();          // "Time limit must be between 1 and 30 days"

// DirectPool errors  
error NotProjectOwner();          // "Only project owner can call"
error NotRegisteredMM();          // "Caller is not registered MM"
error AlreadyFinalized();         // "MMs already finalized"
error BorrowExceedsAllocation();  // "Cannot borrow more than allocation"
error BorrowNotExpired();         // "Borrow time not expired yet"

// BondingCurve errors
error AlreadyGraduated();         // "Bonding curve already graduated"
error CannotGraduateYet();        // "Target market cap not reached"
error InsufficientLiquidity();    // "Not enough liquidity for swap"
```

### Frontend Data Fetching Strategy

1. **Initial Load**:
   - Fetch all projects from ProjectFactory
   - Cache in localStorage with timestamp
   - Refresh every 60 seconds

2. **Real-time Updates**:
   - Subscribe to contract events via WebSocket
   - Update local state on events
   - Optimistic updates for user transactions

3. **Polling for Non-event Data**:
   - Current prices (every 10s)
   - MM positions (every 30s)
   - Pool statistics (every 30s)

### Contract Addresses Management

```typescript
// config/contracts.ts
export const contracts = {
  arbitrumSepolia: {
    projectFactory: "0x...",
    usdc: "0x...",
    // Add more as deployed
  }
};

// Auto-generate from deployment
// Store in .env for different environments
```

### Gas Optimization Considerations

1. **Batch Operations**:
   - Consider multicall for reading multiple values
   - Batch MM registration if possible

2. **Storage Optimization**:
   - Pack struct variables
   - Use mappings over arrays where possible
   - Minimize storage writes

3. **View Functions for Frontend**:
   ```solidity
   // In DirectPool
   function getPoolInfo() external view returns (
     uint256 totalLiquidity,
     uint256 availableLiquidity,
     uint256 numberOfMMs,
     bool isFinalized,
     uint256[] memory borrowedAmounts
   )
   
   // In BondingCurve  
   function getMarketInfo() external view returns (
     uint256 currentPrice,
     uint256 currentMarketCap,
     uint256 tokenReserve,
     uint256 usdcBalance,
     bool canGraduate
   )
   ```

### Deployment & Verification Script

```javascript
// scripts/deploy.js
async function main() {
  // 1. Deploy USDC mock (testnet only)
  // 2. Deploy ProjectFactory
  // 3. Verify all contracts on Arbiscan
  // 4. Update frontend config
  // 5. Run initial tests
}
```

### Frontend Tech Stack Details

- **Next.js 14** with App Router
- **RainbowKit** for wallet connection
- **wagmi** for hooks and contract interaction
- **viem** as the ethereum interface
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **recharts** for price charts
- **tanstack/react-query** for data fetching

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ALCHEMY_ID=
NEXT_PUBLIC_ENABLE_TESTNETS=true

# Contract addresses (auto-populated after deploy)
NEXT_PUBLIC_PROJECT_FACTORY_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=
```

## Quick Reference Cheatsheet

### Key Numbers
- **Token Supply**: 1,000,000,000 (1B) with 18 decimals
- **USDC Decimals**: 6
- **Initial Price Range**: $0.00001 - $0.001 (0.1x - 10x of default $0.0001)
- **Borrow Time Limit**: 1-30 days (default: 7 days)
- **Target Market Cap Default**: $10,000

### State Transitions
```
Project: CREATED → ACTIVE → FINALIZED
BondingCurve: ACTIVE → GRADUATED
MM: REGISTERED → FINALIZED → BORROWING → REPAID/EXPIRED
```

### Key Business Rules
1. **Direct Pool**: MM-only operations, no user trading
2. **Bonding Curve**: Must graduate before MM can borrow
3. **MM Allocation**: Fixed per MM (total liquidity / number of MMs)
4. **Profit/Loss**: MM keeps profits, PO absorbs losses
5. **Finalization**: Manual by PO, then MM list locked

### Contract Interaction Flow
```
User → Frontend → RainbowKit/wagmi → Smart Contracts → Events → Frontend Update
```

### Testing Checklist
- [ ] Create project with new token
- [ ] Create project with existing token  
- [ ] Register/unregister MMs
- [ ] Finalize MMs
- [ ] Buy/sell on bonding curve
- [ ] Graduate bonding curve
- [ ] MM borrow tokens
- [ ] MM repay (full and partial)
- [ ] Emergency withdraw on expiry
- [ ] Multiple MMs on same project