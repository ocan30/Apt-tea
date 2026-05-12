# Circle Setup - Entity Secret Generator

Scripts to set up Circle Developer-Controlled Wallets credentials.

## Step 1: Install Dependencies

```bash
cd circle-setup
npm install
```

## Step 2: Generate Entity Secret (one-time)

```bash
npm run generate-secret
```

Copy the 64-character hex string that appears.

## Step 3: Register Entity Secret in Circle Console

1. Go to <https://console.circle.com>
2. Navigate: **Configurator** → **Dev-Controlled Wallets**
3. Click **"Register Entity Secret"**
4. Paste your secret
5. **Download the Recovery File** (keep it safe!)

## Step 4: Configure .env

```bash
cp .env.example .env
```

Edit `.env` and fill in:

- `CIRCLE_API_KEY` — from Console → Keys
- `CIRCLE_ENTITY_SECRET` — the secret you generated in Step 2

## Step 5: Generate Ciphertext (for each API call)

```bash
npm run generate-ciphertext
```

This outputs a fresh ciphertext. Use it as `entitySecretCiphertext` in your API requests.

## Security Notes

- **NEVER** commit `.env` to git
- **NEVER** share your entity secret
- The Recovery File is your only way to restore access if lost
- Ciphertexts are single-use; regenerate before each sensitive call
