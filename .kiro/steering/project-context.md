---
inclusion: always
---

# Apt Tea Project Context

## What this project is

A **web dashboard** for showcasing USDC wallet operations using
Circle's Developer-Controlled Wallets SDK on testnet (Polygon Amoy).

Target audience: beginners / community builders exploring Arc & Circle ecosystem.

## Stack

- **Frontend**: vanilla HTML + CSS + JavaScript (no framework, no build step)
- **Backend**: Node.js + Express (simple REST API wrapping Circle SDK)
- **SDK**: `@circle-fin/developer-controlled-wallets`
- **Network**: Polygon Amoy Testnet (MATIC-AMOY) by default

## Repo Layout

```
/Apt-tea
  /dashboard           # Static frontend (index.html, styles.css, app.js)
  /circle-setup        # One-time scripts: generate-entity-secret.js, etc.
  /backend             # Express server exposing wallet APIs
  /.kiro/steering      # Knowledge for Kiro (this folder)
  /.env.example        # Template - copy to .env
```

## Local Development

```bash
# 1. Setup Circle credentials (one-time)
cd circle-setup && npm install && npm run generate-secret

# 2. Register the secret in Circle Console (manual step)

# 3. Configure .env (copy from .env.example, fill API key + entity secret)

# 4. Run backend
cd backend && npm install && npm start

# 5. Open dashboard/index.html in browser
```

## Coding Conventions

- Keep UI vanilla (no framework migration yet).
- Backend endpoints live under `/api/*`.
- Always validate request bodies before passing to Circle SDK.
- Use structured errors: `{ error: { code, message } }`.
- Never expose API key or entity secret to the frontend.
