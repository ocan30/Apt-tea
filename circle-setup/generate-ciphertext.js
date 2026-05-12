/**
 * Circle - Generate Entity Secret Ciphertext
 * --------------------------------------------
 * This script generates a FRESH ciphertext every time you run it.
 * Each ciphertext is single-use - you need a new one per API call.
 *
 * Requires:
 *   - CIRCLE_API_KEY in .env
 *   - CIRCLE_ENTITY_SECRET in .env
 *
 * Install:
 *   npm install @circle-fin/developer-controlled-wallets dotenv
 *
 * Usage:
 *   node generate-ciphertext.js
 */

require('dotenv').config();
const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    console.error('ERROR: Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env');
    process.exit(1);
  }

  const client = initiateDeveloperControlledWalletsClient({
    apiKey,
    entitySecret,
  });

  // Generate a new ciphertext (single-use, regenerate for each API call)
  const ciphertext = await client.generateEntitySecretCiphertext();

  console.log('\n==========================================');
  console.log('  ENTITY SECRET CIPHERTEXT (single use)');
  console.log('==========================================\n');
  console.log(ciphertext);
  console.log('\nNote: Regenerate before each sensitive API call.\n');
}

main().catch((err) => {
  console.error('Error generating ciphertext:', err.message);
  process.exit(1);
});
