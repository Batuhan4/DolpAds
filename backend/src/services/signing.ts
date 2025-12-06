import nacl from "tweetnacl";
import { bcs } from "@mysten/sui.js/bcs";
import { ADMIN_PRIVATE_KEY_BASE64, ADMIN_PUBLIC_KEY_BASE64 } from "../config.js";
import { hexToBytes } from "../utils/hex.js";

// BCS type for claim payload: mirrors on-chain verification.
const ClaimMessage = bcs.struct("ClaimMessage", {
  publisher: bcs.bytes(32),
  amount: bcs.u64(),
  nonce: bcs.u64(),
  campaignId: bcs.vector(bcs.u8()),
});

let cached: nacl.SignKeyPair | null = null;

function loadKeypair() {
  if (cached) return cached;

  if (ADMIN_PRIVATE_KEY_BASE64) {
    const secret = Buffer.from(ADMIN_PRIVATE_KEY_BASE64, "base64");
    if (secret.length === nacl.sign.secretKeyLength) {
      cached = nacl.sign.keyPair.fromSecretKey(secret);
      return cached;
    }
  }

  // Fallback to an ephemeral keypair for local development.
  cached = nacl.sign.keyPair();
  return cached;
}

export function buildClaimMessage(
  publisher: string,
  amount: number,
  nonce: number,
  campaignId: string,
) {
  const publisherBytes = hexToBytes(publisher);
  if (publisherBytes.length !== 32) {
    throw new Error("publisher_address must be 32 bytes");
  }
  let campaignBytes: Uint8Array;
  try {
    campaignBytes = hexToBytes(campaignId);
  } catch {
    campaignBytes = new TextEncoder().encode(campaignId);
  }

  return ClaimMessage.serialize({
    publisher: publisherBytes,
    amount: BigInt(amount),
    nonce: BigInt(nonce),
    campaignId: Array.from(campaignBytes),
  }).toBytes();
}

export function signClaim(message: Uint8Array) {
  const keypair = loadKeypair();
  const signature = nacl.sign.detached(message, keypair.secretKey);
  return {
    signature: Buffer.from(signature).toString("base64"),
    adminPublicKey: ADMIN_PUBLIC_KEY_BASE64 ?? Buffer.from(keypair.publicKey).toString("base64"),
  };
}

