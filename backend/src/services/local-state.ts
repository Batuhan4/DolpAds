import fs from "node:fs/promises";
import path from "node:path";

const LOCAL_STATE_DIR = process.env.LOCAL_STATE_DIR ?? path.join(process.cwd(), ".local-state");
const FILE_PREFIX = "file:";

export function filePointer(filePath: string) {
  return `${FILE_PREFIX}${filePath}`;
}

export function isFilePointer(pointer: string) {
  return pointer.startsWith(FILE_PREFIX);
}

export function pointerToPath(pointer: string) {
  return pointer.replace(FILE_PREFIX, "");
}

function resolvePath(fileName: string) {
  return path.join(LOCAL_STATE_DIR, fileName);
}

export async function saveLocalState<T>(fileName: string, data: T) {
  const filePath = resolvePath(fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log(`[local-state] Saved ${fileName} to ${filePath}`);
  return filePath;
}

export async function loadLocalState<T>(fileName: string): Promise<T | null> {
  const filePath = resolvePath(fileName);
  return loadLocalStateByPath<T>(filePath);
}

export async function loadLocalStateByPath<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    console.log(`[local-state] Loaded from ${filePath}`);
    return JSON.parse(raw) as T;
  } catch {
    console.log(`[local-state] Failed to load from ${filePath}`);
    return null;
  }
}

