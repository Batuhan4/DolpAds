import { WalrusStoreResult } from "../types.js";
import { storeJson } from "./walrus.js";
import { readStateFromWalrus } from "./state-reader.js";

export interface PersistedState<T> {
  data: T;
  walrus: WalrusStoreResult;
}

export async function saveState<T>(data: T, fileName: string): Promise<PersistedState<T>> {
  const walrus = await storeJson(data, { fileName });
  return { data, walrus };
}

export const loadState = readStateFromWalrus;

