# IMMO Interface

Frontend application for the IMMO (Initial Market Making Offering) protocol.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Get from https://cloud.walletconnect.com
- Contract addresses after deployment

3. Extract contract ABIs (after building contracts):
```bash
node scripts/extract-abis.js
```

4. Run development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **RainbowKit Integration**: Wallet connection for Arbitrum Sepolia
- **Project Explorer**: Browse all active IMMO projects
- **Create Project**: Launch new tokens with Direct Pool or Bonding Curve
- **MM Dashboard**: Manage borrowing and trading operations
- **PO Dashboard**: Manage projects and market makers

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- RainbowKit & wagmi for Web3
- Tailwind CSS for styling
- Viem for Ethereum interactions
- TanStack Query for data fetching

## Contract Integration

Contract ABIs are automatically extracted from the compiled contracts and stored in `lib/contracts/`. The extraction script reads from `../contracts/out/` and generates TypeScript-ready imports.

## Project Structure

```
interface/
├── app/                 # Next.js app router pages
├── components/          # React components
├── lib/                 # Utilities and configurations
│   ├── contracts/      # Contract ABIs and addresses
│   └── wagmi.ts        # wagmi configuration
├── public/             # Static assets
└── scripts/            # Build scripts
```
