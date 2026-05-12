---
inclusion: fileMatch
fileMatchPattern: '**/circle-*/**|**/*circle*|**/*wallet*|**/*usdc*'
---

# Circle Skills Reference (Kiro version)

These patterns come from the official [Circle Skills](https://github.com/circlefin/skills) repo. Use them whenever working on Circle / USDC / Wallet features in this repo.

## When to use Developer-Controlled Wallets

- Backend custody (app manages keys on behalf of users)
- Payouts, treasury, automation, payments, AI agents
- High TPS needs on Solana / EOA chains

Alternatives:
- User-controlled wallets -> social login / PIN, user controls keys
- Modular wallets -> passkey (WebAuthn), ERC-4337 / ERC-6900

## Required Environment Variables

```
CIRCLE_API_KEY=TEST_API_KEY:...   # from console.circle.com
CIRCLE_ENTITY_SECRET=<64-char hex> # one-time generated and registered
```

NEVER commit `.env`, `*-recovery-file.json`, or any `*.pem`.
ALWAYS add them to `.gitignore`.

## SDK Initialization (Node.js)

```ts
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});
```

The SDK auto-generates a fresh `entitySecretCiphertext` for each API call.

## Core Flows

### 1. Create Wallet Set + Wallets

```ts
const walletSet = await client.createWalletSet({ name: 'Apt Tea Wallets' });
const walletSetId = walletSet.data?.walletSet?.id;

const wallets = await client.createWallets({
  accountType: 'SCA',            // use SCA on L2s for gas sponsorship; EOA on ETH mainnet/SOL/APT/NEAR
  blockchains: ['MATIC-AMOY'],   // testnet default
  count: 1,
  walletSetId,
});
```

### 2. Check Balance

```ts
const balance = await client.getWalletTokenBalance({ id: walletId });
const tokens = balance.data?.tokenBalances ?? [];
```

IMPORTANT: `getWallet` / `getWallets` do NOT return balances. Always use `getWalletTokenBalance`.

### 3. Transfer Tokens

```ts
const tx = await client.createTransaction({
  walletId,
  tokenAddress,                    // USDC token address
  destinationAddress,
  amounts: ['0.01'],
  fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
});
```

### 4. Transaction States (poll or use webhooks)

Happy path: `INITIATED -> CLEARED -> QUEUED -> SENT -> CONFIRMED -> COMPLETE`

Terminal: `COMPLETE | FAILED | DENIED | CANCELLED`

Prefer webhook notifications over polling in production.

## Account Type Decision

| Chain                     | Account  |
|---------------------------|----------|
| Ethereum L1               | EOA      |
| Solana / Aptos / NEAR     | EOA      |
| Arbitrum / Base / Polygon | SCA      |
| Optimism / Unichain       | SCA      |

## Security Rules (non-negotiable)

1. NEVER hardcode / log / commit secrets.
2. NEVER reuse entity secret ciphertexts.
3. NEVER register an entity secret on behalf of user on mainnet.
4. ALWAYS require explicit user confirmation for mainnet transfers >$100 USDC.
5. ALWAYS default to testnet; warn before mainnet.
6. ALWAYS validate addresses, amounts, and chain IDs.
7. ALWAYS add `idempotencyKey` (UUID v4) on mutating calls.

## Reference Links

- Docs: <https://developers.circle.com>
- LLMS index: <https://developers.circle.com/llms.txt>
- Skills repo: <https://github.com/circlefin/skills>
- Faucet: <https://faucet.circle.com>
- Console: <https://console.circle.com>
- MCP server: <https://api.circle.com/v1/codegen/mcp>

DISCLAIMER: This skill is provided "as is" without warranties. Subject to Circle Developer Terms. Content was rephrased/adapted for Kiro compatibility.
