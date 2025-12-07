// Script to generate admin keypair and print the values
// Run with: npx tsx scripts/generate-admin-keypair.ts

import nacl from "tweetnacl";

const keypair = nacl.sign.keyPair();

const privateKeyBase64 = Buffer.from(keypair.secretKey).toString("base64");
const publicKeyBase64 = Buffer.from(keypair.publicKey).toString("base64");
const publicKeyHex = Buffer.from(keypair.publicKey).toString("hex");

console.log("=== ADMIN KEYPAIR GENERATED ===\n");

console.log("Add these to your backend .env file:");
console.log("------------------------------------");
console.log(`ADMIN_PRIVATE_KEY_BASE64=${privateKeyBase64}`);
console.log(`ADMIN_PUBLIC_KEY_BASE64=${publicKeyBase64}`);
console.log("");

console.log("Use this public key in init_admin call:");
console.log("----------------------------------------");
console.log(`Public Key (hex): ${publicKeyHex}`);
console.log("");

console.log("Full init_admin command:");
console.log("------------------------");
console.log(`sui client call \\
  --package 0x4e5eb52670f8959fa1d39392641d7d63e9eec80bbd85c799b5c4d82576f1a6b8 \\
  --module core \\
  --function init_admin \\
  --args 0x${publicKeyHex} \\
  --gas-budget 10000000`);
