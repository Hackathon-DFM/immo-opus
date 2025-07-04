# 🚀 IMMO Protocol - Complete Deployment & Integration Guide

This guide walks you through deploying IMMO contracts to Arbitrum Sepolia and integrating them with the frontend.

## 📋 Prerequisites

1. **Node.js & pnpm**: For frontend development
2. **Foundry**: For smart contract deployment
3. **Arbitrum Sepolia ETH**: For gas fees
4. **WalletConnect Project ID**: For wallet connections

## 🔧 Step 1: Environment Setup

### Contracts Environment

```bash
cd contracts
cp .env.example .env
# Edit .env with your values:
# - PRIVATE_KEY (without 0x prefix)
# - ARBITRUM_SEPOLIA_RPC_URL
# - ARBISCAN_API_KEY (optional, for verification)
```

### Frontend Environment

```bash
cd interface
cp .env.example .env.local
# Edit .env.local with your values:
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
# - Set NEXT_PUBLIC_MOCK_MODE=false after deployment
```

## 🏗️ Step 2: Deploy Contracts

### Compile and Test

```bash
cd contracts
forge build
forge test
```

### Deploy to Arbitrum Sepolia

```bash
forge script script/DeployIMMO.s.sol \
  --rpc-url arbitrum_sepolia \
  --broadcast \
  --verify
```

**What gets deployed:**
- `MockUSDC`: Test USDC with 1M tokens minted to deployer
- `ProjectFactory`: Main factory contract for creating IMMO projects
- Deployment addresses saved to `./deployments/arbitrum-sepolia.json`

### Example Output

```
== Logs ==
Deploying IMMO Protocol to Arbitrum Sepolia...
MockUSDC deployed at: 0x1234567890abcdef1234567890abcdef12345678
ProjectFactory deployed at: 0xabcdef1234567890abcdef1234567890abcdef12
Minted 1,000,000 USDC to deployer: 0x...
Deployment info saved to ./deployments/arbitrum-sepolia.json
```

## 🔄 Step 3: Sync to Frontend

### Automatic Sync

```bash
# From project root
./scripts/sync-deployment.sh
```

### Manual Sync

```bash
cp contracts/deployments/arbitrum-sepolia.json interface/src/config/
```

## 🎯 Step 4: Launch Frontend

### Install Dependencies & Start

```bash
cd interface
pnpm install
pnpm dev
```

### Update Environment

```bash
# In interface/.env.local
NEXT_PUBLIC_MOCK_MODE=false
```

## 🧪 Step 5: Test the Integration

### Get Test Funds

1. **Arbitrum Sepolia ETH**: [Arbitrum Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
2. **Test USDC**: Your deployed MockUSDC contract minted 1M tokens to the deployer

### Test Flow

1. **Connect Wallet**: Use RainbowKit to connect to Arbitrum Sepolia
2. **Transfer USDC**: Send some test USDC from deployer to test accounts
3. **Create Project**: Use the frontend to create a new IMMO project
4. **Test Trading**: If using bonding curve, test buy/sell functionality
5. **MM Dashboard**: Register as MM and test borrowing

## 📊 Monitoring & Verification

### Contract Addresses

Check deployment at: https://sepolia.arbiscan.io/

### Frontend Logs

```bash
# Check browser console for contract interactions
# Check network tab for transaction broadcasts
```

### Contract Interactions via Cast

```bash
# Check ProjectFactory
cast call $PROJECT_FACTORY_ADDRESS "usdc()" --rpc-url arbitrum_sepolia

# Check projects count  
cast call $PROJECT_FACTORY_ADDRESS "projectsCount()" --rpc-url arbitrum_sepolia

# Check USDC balance
cast call $USDC_ADDRESS "balanceOf(address)" $YOUR_ADDRESS --rpc-url arbitrum_sepolia
```

## 🐛 Troubleshooting

### Common Issues

**1. "Insufficient funds" errors**
```bash
# Check ETH balance for gas
cast balance $YOUR_ADDRESS --rpc-url arbitrum_sepolia
```

**2. "Network mismatch" in frontend**
- Ensure wallet is connected to Arbitrum Sepolia (Chain ID: 421614)
- Check `NEXT_PUBLIC_MOCK_MODE=false` in `.env.local`

**3. "Contract not found" errors**
- Verify deployment addresses in `interface/src/config/arbitrum-sepolia.json`
- Check contracts are verified on Arbiscan

**4. Transaction failures**
- Check gas prices and limits
- Verify contract state and permissions
- Check USDC allowances for trading

### Deployment Issues

**1. RPC errors**
```bash
# Try alternative RPC
ARBITRUM_SEPOLIA_RPC_URL=https://arbitrum-sepolia.infura.io/v3/YOUR_KEY
```

**2. Verification failures**
```bash
# Manual verification
forge verify-contract $CONTRACT_ADDRESS src/core/ProjectFactory.sol:ProjectFactory \
  --chain arbitrum-sepolia --constructor-args $(cast abi-encode "constructor(address)" $USDC_ADDRESS)
```

## 🔗 Useful Resources

- **Arbitrum Sepolia Explorer**: https://sepolia.arbiscan.io/
- **Arbitrum Faucet**: https://faucet.quicknode.com/arbitrum/sepolia
- **RPC Providers**: https://docs.arbitrum.io/build-decentralized-apps/reference/node-providers
- **WalletConnect**: https://cloud.walletconnect.com/

## 📝 Next Steps

After successful deployment:

1. **Create test projects** with different configurations
2. **Test MM registration** and borrowing flows  
3. **Verify bonding curve** trading mechanics
4. **Monitor gas costs** and optimize if needed
5. **Set up monitoring** for production deployment

## 🚨 Security Notes

- **Never commit** `.env` files with real private keys
- **Use separate accounts** for testing vs production
- **Verify all contracts** on Arbiscan before mainnet
- **Test thoroughly** on testnet before real funds