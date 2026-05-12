# Apt Tea Backend

Express API that wraps Circle Developer-Controlled Wallets SDK. Powers the USDC dashboard frontend.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env -> paste your CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET
npm start
```

Server runs at <http://localhost:3000>.

## Endpoints

| Method | Path                           | Purpose                            |
|--------|--------------------------------|------------------------------------|
| GET    | `/api/health`                  | Health check                       |
| POST   | `/api/wallet-sets`             | Create wallet set                  |
| GET    | `/api/wallet-sets`             | List wallet sets                   |
| POST   | `/api/wallets`                 | Create wallet(s)                   |
| GET    | `/api/wallets?walletSetId=...` | List wallets                       |
| GET    | `/api/wallets/:id/balance`     | Token balances for a wallet        |
| POST   | `/api/transfers`               | Create transfer transaction       |
| GET    | `/api/transactions/:id`        | Get transaction status             |
| POST   | `/api/faucet`                  | Returns faucet URL for an address  |

## Example Request — Create Wallet

```bash
curl -X POST http://localhost:3000/api/wallet-sets \
  -H "Content-Type: application/json" \
  -d '{"name":"My First Set"}'

# Then with the returned walletSetId:
curl -X POST http://localhost:3000/api/wallets \
  -H "Content-Type: application/json" \
  -d '{"walletSetId":"<id>", "blockchains":["MATIC-AMOY"], "accountType":"SCA", "count":1}'
```

## Security

- `.env` is in `.gitignore` — never commit it.
- Entity secret never leaves the server.
- Frontend never receives API key; it only calls local backend endpoints.
