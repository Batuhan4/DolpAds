import "dotenv/config";

export const PORT = Number(process.env.PORT ?? 4000);
export const ADMIN_PRIVATE_KEY_BASE64 = process.env.ADMIN_PRIVATE_KEY_BASE64 ?? "";
export const ADMIN_PUBLIC_KEY_BASE64 = process.env.ADMIN_PUBLIC_KEY_BASE64;

