/**
 * Circle - Generate Entity Secret (One-Time Use)
 * ------------------------------------------------
 * Run this ONCE to generate your Entity Secret.
 * Save the output SAFELY - you'll need to:
 *   1. Register it via Circle Console (Configurator)
 *   2. Save it in your .env file as CIRCLE_ENTITY_SECRET
 *
 * Usage:
 *   node generate-entity-secret.js
 */

const crypto = require('crypto');

// Generate a 32-byte random hex string (64 chars)
const entitySecret = crypto.randomBytes(32).toString('hex');

console.log('\n==========================================');
console.log('  YOUR CIRCLE ENTITY SECRET (save this!)');
console.log('==========================================\n');
console.log(entitySecret);
console.log('\n==========================================');
console.log('  NEXT STEPS:');
console.log('==========================================');
console.log('1. Copy the secret above');
console.log('2. Go to: https://console.circle.com');
console.log('3. Navigate: Configurator -> Dev-Controlled Wallets');
console.log('4. Click "Register Entity Secret"');
console.log('5. Paste the secret and confirm');
console.log('6. DOWNLOAD the Recovery File (very important!)');
console.log('7. Save secret to .env as CIRCLE_ENTITY_SECRET=<your_secret>');
console.log('\nWARNING: Never commit this to git. Never share it.\n');
