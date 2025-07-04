# IMMO Protocol Deployment Guide

## 🚀 Deploying to Arbitrum Sepolia

### Prerequisites

1. **Install Foundry** (if not already installed):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Setup Environment Variables**:
```bash
cd contracts
cp .env.example .env
# Edit .env with your values
```

Required environment variables:
- `PRIVATE_KEY`: Your wallet private key (without 0x prefix)
- `ARBITRUM_SEPOLIA_RPC_URL`: Arbitrum Sepolia RPC endpoint
- `ARBISCAN_API_KEY`: For contract verification (optional)

### 🔧 Deployment Steps

1. **Compile Contracts**:
```bash
cd contracts
forge build
```

2. **Run Tests** (optional but recommended):
```bash
forge test
```

3. **Deploy to Arbitrum Sepolia**:
```bash
forge script script/DeployIMMO.s.sol --rpc-url arbitrum_sepolia --broadcast --verify
```

This will deploy:
- `MockUSDC` contract (for testing)
- `ProjectFactory` contract (main factory)
- Save addresses to `./deployments/arbitrum-sepolia.json`

### 📝 Deployment Output

After successful deployment, you'll get:
```
MockUSDC deployed at: 0x1234...
ProjectFactory deployed at: 0x5678...
Minted 1,000,000 USDC to deployer: 0xABCD...
Deployment info saved to ./deployments/arbitrum-sepolia.json
```

### 🔍 Contract Verification

Contracts will be automatically verified if you provide `ARBISCAN_API_KEY`. 

Manual verification:
```bash
forge verify-contract <CONTRACT_ADDRESS> src/core/ProjectFactory.sol:ProjectFactory --chain arbitrum-sepolia
```

### ⚡ Frontend Integration

1. **Copy deployment file**:
```bash
cp contracts/deployments/arbitrum-sepolia.json interface/src/config/
```

2. **Update frontend config** to use deployed addresses instead of mock mode.

### 🧪 Testing Deployed Contracts

1. **Get testnet ETH**: Use [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)

2. **Test contract interaction**:
```bash
# Example: Create a test project
cast send <PROJECT_FACTORY_ADDRESS> "createProject(bool,address,string,string,string,uint256,uint8,uint256,uint256,uint256)" \
  true 0x0000000000000000000000000000000000000000 "Test Token" "TEST" "Test Description" 0 0 100000 0 604800 \
  --rpc-url arbitrum_sepolia --private-key $PRIVATE_KEY
```

### 🔗 Useful Links

- **Arbitrum Sepolia Explorer**: https://sepolia.arbiscan.io/
- **Arbitrum Sepolia Faucet**: https://faucet.quicknode.com/arbitrum/sepolia
- **RPC Endpoints**: https://docs.arbitrum.io/build-decentralized-apps/reference/node-providers

### 🐛 Troubleshooting

**Insufficient funds error**:
- Make sure you have ETH for gas on Arbitrum Sepolia

**RPC errors**:
- Check your `ARBITRUM_SEPOLIA_RPC_URL` is correct
- Try alternative RPC endpoints

**Private key errors**:
- Ensure `PRIVATE_KEY` is without "0x" prefix
- Make sure the account has ETH for gas

**Verification failed**:
- Check `ARBISCAN_API_KEY` is valid
- Try manual verification with flattened source