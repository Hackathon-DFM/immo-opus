# IMMO - Initial Market Making Offering

IMMO is a DeFi protocol that enables project owners to launch tokens with integrated market making capabilities on Arbitrum Sepolia.

## Project Structure

```
opus-sot/
├── contracts/          # Smart contracts (Foundry)
│   ├── src/           # Contract source code
│   ├── test/          # Contract tests
│   └── script/        # Deployment scripts
├── frontend/          # Frontend application (Next.js) - Coming soon
└── docs/              # Documentation
```

## Features

- Two pool modes: Direct Pool and Bonding Curve
- Registered Market Maker (MM) system with borrowing capabilities
- CLOB DEX integration for professional market making
- Bonding curve graduation mechanism
- Trust-based MM system with time-limited borrowing

## Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 18+ and npm/yarn/pnpm
- Git

### Smart Contracts Setup

```bash
cd contracts
forge install
forge build
```

### Environment Setup

1. Copy the environment template:
```bash
cp contracts/.env.example contracts/.env
```

2. Fill in your environment variables:
- `PRIVATE_KEY`: Your wallet private key
- `ARBITRUM_SEPOLIA_RPC_URL`: Arbitrum Sepolia RPC endpoint
- `ARBISCAN_API_KEY`: For contract verification

### Deployment

Deploy to Arbitrum Sepolia:
```bash
cd contracts
forge script script/DeployTestnet.s.sol --rpc-url arbitrum_sepolia --broadcast --verify
```

## Contract Architecture

- **ProjectFactory**: Central contract for creating new IMMO projects
- **DirectPool**: Pool for MM borrowing operations (no user trading)
- **BondingCurve**: Initial token sale with price discovery mechanism
- **ERC20Token**: Standard ERC20 token for newly created projects
- **CLOBAdapter**: Interface for MM to trade on CLOB DEXs

## Development Status

- [x] Smart contracts initial structure
- [x] ERC20Token implementation
- [x] ProjectFactory with validation
- [ ] Complete DirectPool implementation
- [ ] Complete BondingCurve implementation
- [ ] Frontend application
- [ ] CLOB DEX integration
- [ ] Testing suite

## License

MIT