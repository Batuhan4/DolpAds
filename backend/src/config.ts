import "dotenv/config";

export const PORT = Number(process.env.PORT ?? 4000);
export const ADMIN_PRIVATE_KEY_BASE64 = process.env.ADMIN_PRIVATE_KEY_BASE64 ?? "";
export const ADMIN_PUBLIC_KEY_BASE64 = process.env.ADMIN_PUBLIC_KEY_BASE64;

export const WALRUS_AGGREGATOR_URL =
  process.env.WALRUS_AGGREGATOR_URL ?? "https://aggregator.walrus-testnet.walrus.space";
export const WALRUS_PUBLISHER_URL =
  process.env.WALRUS_PUBLISHER_URL ?? "https://publisher.walrus-testnet.walrus.space";
export const WALRUS_EPOCHS = Number(process.env.WALRUS_EPOCHS ?? 5);
export const WALRUS_DELETABLE = (process.env.WALRUS_DELETABLE ?? "true").toLowerCase() === "true";
export const WALRUS_MAX_UPLOAD_BYTES = Number(process.env.WALRUS_MAX_UPLOAD_BYTES ?? 10 * 1024 * 1024);
export const WALRUS_REQUEST_TIMEOUT_MS = Number(process.env.WALRUS_REQUEST_TIMEOUT_MS ?? 10_000);
export const WALRUS_RETRY_COUNT = Number(process.env.WALRUS_RETRY_COUNT ?? 2);
export const WALRUS_COUNTERS_BLOB_ID = process.env.WALRUS_COUNTERS_BLOB_ID ?? "";
export const WALRUS_WEBSITES_BLOB_ID = process.env.WALRUS_WEBSITES_BLOB_ID ?? "";
export const WALRUS_CAMPAIGNS_BLOB_ID = process.env.WALRUS_CAMPAIGNS_BLOB_ID ?? "";

