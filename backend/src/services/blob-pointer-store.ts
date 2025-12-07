import fs from "node:fs/promises";
import path from "node:path";

type PointerKey = "campaigns" | "counters" | "websites";

const POINTERS_PATH =
  process.env.WALRUS_POINTERS_PATH ?? path.join(process.cwd(), ".walrus-pointers.json");

console.log(`[blob-pointer-store] Using pointer file: ${POINTERS_PATH}`);

type PointerState = Partial<Record<PointerKey, string>>;

async function readPointerFile(): Promise<PointerState> {
  try {
    const raw = await fs.readFile(POINTERS_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as PointerState;
    }
  } catch {
    // File does not exist or is invalid; treat as empty state.
  }
  return {};
}

async function writePointerFile(state: PointerState) {
  try {
    await fs.mkdir(path.dirname(POINTERS_PATH), { recursive: true });
    await fs.writeFile(POINTERS_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    console.warn("[walrus-pointers] failed to write pointer file", err);
  }
}

export async function loadBlobPointer(key: PointerKey) {
  const state = await readPointerFile();
  console.log(`[blob-pointer-store] Loaded pointer for ${key}: ${state[key] ?? "(empty)"}`);
  return state[key] ?? "";
}

export async function saveBlobPointer(key: PointerKey, blobId: string) {
  const state = await readPointerFile();
  if (state[key] === blobId) return blobId;
  state[key] = blobId;
  await writePointerFile(state);
  return blobId;
}

