#!/bin/bash

# Script to sync deployment addresses from contracts to frontend

DEPLOYMENT_FILE="contracts/deployments/arbitrum-sepolia.json"
FRONTEND_CONFIG_DIR="interface/src/config"

echo "🔄 Syncing deployment addresses to frontend..."

# Check if deployment file exists
if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo "❌ Deployment file not found: $DEPLOYMENT_FILE"
    echo "Please deploy contracts first using:"
    echo "cd contracts && forge script script/DeployIMMO.s.sol --rpc-url arbitrum_sepolia --broadcast"
    exit 1
fi

# Create frontend config directory if it doesn't exist
mkdir -p "$FRONTEND_CONFIG_DIR"

# Copy deployment file to frontend
cp "$DEPLOYMENT_FILE" "$FRONTEND_CONFIG_DIR/"

echo "✅ Deployment addresses synced to frontend!"
echo "📁 File copied to: $FRONTEND_CONFIG_DIR/arbitrum-sepolia.json"

# Show deployment info
echo ""
echo "📋 Deployment Information:"
cat "$DEPLOYMENT_FILE" | jq .

echo ""
echo "🚀 Next steps:"
echo "1. Set NEXT_PUBLIC_MOCK_MODE=false in your frontend .env"
echo "2. Start the frontend: cd interface && pnpm dev"
echo "3. Connect your wallet to Arbitrum Sepolia"
echo "4. Start creating IMMO projects!"