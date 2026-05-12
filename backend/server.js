/**
 * Apt Tea Backend
 * ----------------
 * Thin Express API wrapping Circle Developer-Controlled Wallets SDK.
 *
 * Endpoints:
 *   GET  /api/health                         -> health check
 *   POST /api/wallet-sets                    -> create a wallet set
 *   GET  /api/wallet-sets                    -> list wallet sets
 *   POST /api/wallets                        -> create wallet(s) in a set
 *   GET  /api/wallets                        -> list wallets
 *   GET  /api/wallets/:id/balance            -> token balances for a wallet
 *   POST /api/transfers                      -> create a transfer
 *   GET  /api/transactions/:id               -> get transaction status
 *   POST /api/faucet                         -> request testnet USDC (helper URL)
 *
 * Security: API key + entity secret come from .env only. Never expose to frontend.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

const PORT = process.env.PORT || 3000;
const DEFAULT_BLOCKCHAIN = process.env.DEFAULT_BLOCKCHAIN || 'MATIC-AMOY';
const DEFAULT_ACCOUNT_TYPE = process.env.DEFAULT_ACCOUNT_TYPE || 'SCA';

// ----- Validate env -----
const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

if (!apiKey || !entitySecret) {
  console.error('\n[FATAL] Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env');
  console.error('See README.md for setup steps.\n');
  process.exit(1);
}

// ----- Init Circle SDK -----
const circle = initiateDeveloperControlledWalletsClient({
  apiKey,
  entitySecret,
});

// ----- Express setup -----
const app = express();
app.use(cors());
app.use(express.json());

// Helper: structured error wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('[API ERROR]', err?.response?.data || err.message);
    const status = err?.response?.status || 500;
    res.status(status).json({
      error: {
        code: status,
        message: err?.response?.data?.message || err.message || 'Internal error',
      },
    });
  });

// ----- Routes -----
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, blockchain: DEFAULT_BLOCKCHAIN, accountType: DEFAULT_ACCOUNT_TYPE });
});

app.post('/api/wallet-sets', asyncHandler(async (req, res) => {
  const { name = 'Apt Tea Wallet Set' } = req.body || {};
  const result = await circle.createWalletSet({ name, idempotencyKey: uuidv4() });
  res.json(result.data);
}));

app.get('/api/wallet-sets', asyncHandler(async (_req, res) => {
  const result = await circle.listWalletSets();
  res.json(result.data);
}));

app.post('/api/wallets', asyncHandler(async (req, res) => {
  const {
    walletSetId,
    blockchains = [DEFAULT_BLOCKCHAIN],
    accountType = DEFAULT_ACCOUNT_TYPE,
    count = 1,
    name,
  } = req.body || {};

  if (!walletSetId) {
    return res.status(400).json({ error: { code: 400, message: 'walletSetId is required' } });
  }

  const result = await circle.createWallets({
    walletSetId,
    blockchains,
    accountType,
    count,
    idempotencyKey: uuidv4(),
    ...(name ? { metadata: [{ name }] } : {}),
  });
  res.json(result.data);
}));

app.get('/api/wallets', asyncHandler(async (req, res) => {
  const { walletSetId } = req.query;
  const result = await circle.listWallets(walletSetId ? { walletSetId } : {});
  res.json(result.data);
}));

app.get('/api/wallets/:id/balance', asyncHandler(async (req, res) => {
  const result = await circle.getWalletTokenBalance({ id: req.params.id });
  res.json(result.data);
}));

app.post('/api/transfers', asyncHandler(async (req, res) => {
  const {
    walletId,
    tokenAddress,
    destinationAddress,
    amount,
    feeLevel = 'MEDIUM',
  } = req.body || {};

  if (!walletId || !destinationAddress || !amount) {
    return res.status(400).json({
      error: { code: 400, message: 'walletId, destinationAddress, amount are required' },
    });
  }

  const result = await circle.createTransaction({
    walletId,
    ...(tokenAddress ? { tokenAddress } : {}),
    destinationAddress,
    amounts: [String(amount)],
    fee: { type: 'level', config: { feeLevel } },
    idempotencyKey: uuidv4(),
  });
  res.json(result.data);
}));

app.get('/api/transactions/:id', asyncHandler(async (req, res) => {
  const result = await circle.getTransaction({ id: req.params.id });
  res.json(result.data);
}));

app.post('/api/faucet', asyncHandler(async (req, res) => {
  const { address } = req.body || {};
  if (!address) {
    return res.status(400).json({ error: { code: 400, message: 'address required' } });
  }
  // Circle faucet is a web UI only; we return the URL with pre-filled chain + address.
  const faucetUrl = `https://faucet.circle.com/?chain=${DEFAULT_BLOCKCHAIN}&address=${address}`;
  res.json({
    faucetUrl,
    message: 'Open this URL to request testnet USDC for your wallet.',
  });
}));

// ----- 404 & Error -----
app.use((_req, res) => res.status(404).json({ error: { code: 404, message: 'Not found' } }));

app.listen(PORT, () => {
  console.log(`\nApt Tea backend running on http://localhost:${PORT}`);
  console.log(`Default chain:        ${DEFAULT_BLOCKCHAIN}`);
  console.log(`Default account type: ${DEFAULT_ACCOUNT_TYPE}`);
  console.log(`\nEndpoints: /api/health /api/wallet-sets /api/wallets /api/transfers /api/transactions/:id\n`);
});
