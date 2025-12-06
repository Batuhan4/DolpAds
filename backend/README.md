# DolpAds Backend (MVP)

Lightweight Express/TypeScript API that mirrors the Phase 1 design: serves ads quickly, tracks spend, and signs payout claims for publishers. Storage is in-memory for now to simplify local testing.

## Prerequisites

- Node 18+ with `pnpm` installed.
- Ed25519 keypair for signing claims (see env vars below).

## Setup

```bash
cd backend
pnpm install
pnpm dev
```

Environment variables:

- `PORT` (default: 4000)
- `ADMIN_PRIVATE_KEY_BASE64` — base64-encoded 64-byte Ed25519 private key (seed + public key) used to sign payout claims.
- `ADMIN_PUBLIC_KEY_BASE64` (optional) — base64 public key surfaced in responses to help the contract verify signatures.

## API Surface (initial)

- `GET /api/serve?publisher_address=0x...&slot_size=leaderboard`  
  Returns `{ ad_id, image_url, click_url, tracking_id }` for active campaigns.
- `POST /api/track` with `{ tracking_id, type: "view" | "click" }`  
  Records spend and earns for the publisher, flipping campaigns to `empty` when budgets are exhausted.
- `POST /api/claim` with `{ publisher_address, campaign_id }`  
  Computes pending earnings, bumps a nonce, and returns `{ amount, nonce, signature, admin_public_key, campaign_id }`.
- `GET /health` — liveness probe.

## Next Steps

- Swap in Postgres/Redis for state, then point the indexer at on-chain events.
- Replace the signature stub in the Move contract with the payload this backend emits.
- Wire the universal script to `/api/serve` and `/api/track`.

