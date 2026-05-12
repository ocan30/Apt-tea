# Apt Tea — USDC Wallet Dashboard

A beginner-friendly web dashboard built on top of [Circle's Developer-Controlled Wallets](https://developers.circle.com/wallets/dev-controlled) SDK. Create wallet sets, create USDC wallets, check balances, and send USDC on **Polygon Amoy testnet** — all from a simple browser UI.

Powered by [Circle Skills](https://github.com/circlefin/skills) and the Circle Developer Platform.

## Features

- Vanilla HTML/CSS/JS dashboard with dark/light mode
- Node.js + Express backend wrapping Circle SDK
- Create wallet sets and wallets on MATIC-AMOY (default)
- View USDC + token balances
- Send USDC transfers with fee-level control
- Track transaction status by ID
- One-click faucet link for testnet funding
- Ready-to-extend: CCTP, Paymaster, Arc, Smart Contracts

## Quick Start

### 1. Get Circle credentials (one-time)

1. Sign up at <https://console.circle.com>
2. Create a **Sandbox API key** — save it
3. Generate an **Entity Secret** and register it (see `circle-setup/` for helper scripts)
4. Download the Recovery File and store it somewhere safe

### 2. Run the backend

```bash
cd backend
npm install
cp .env.example .env          # then paste your API key + entity secret
npm start                     # http://localhost:3000
```

### 3. Open the dashboard

Open `dashboard/index.html` directly in your browser, or serve it locally with any static server. The UI will connect to `http://localhost:3000` by default (configurable in Settings page).

### 4. First-time flow

1. Dashboard → **Wallets** → click **+ New Wallet Set**
2. Click **+ Wallet** on the set row
3. Click **Faucet** on your new wallet → request test USDC
4. Return, hit **Balance** → your USDC appears
5. Go to **Transfer** page, try sending 0.01 USDC to another address

## Repo Layout

```
/Apt-tea
├── /.kiro/steering       # Kiro AI steering files (Circle Skills knowledge)
├── /circle-setup         # Entity secret generation scripts
├── /backend              # Express API wrapping Circle SDK
├── /dashboard            # Static frontend (HTML/CSS/JS)
└── README.md             # this file
```

## Supported Blockchains

Default: **MATIC-AMOY** (Polygon testnet, SCA wallet). Change via backend `.env`:

```
DEFAULT_BLOCKCHAIN=MATIC-AMOY   # or ETH-SEPOLIA, BASE-SEPOLIA, ARB-SEPOLIA, SOL-DEVNET, etc.
DEFAULT_ACCOUNT_TYPE=SCA        # or EOA
```

## Security

- `.env` is gitignored — never commit it.
- Entity secret lives only on the backend.
- Frontend never sees the API key.
- Always start on testnet; require confirmation for mainnet.

## Learn More

- [Circle Developer Docs](https://developers.circle.com)
- [Circle Skills (AI)](https://github.com/circlefin/skills)
- [Testnet Faucet](https://faucet.circle.com)
- [Arc Network](https://arc.network)

## License

MIT — see source headers where applicable.
