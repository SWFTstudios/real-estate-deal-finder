import type { DataAdapter } from "./types";

// Phase 0 decides which vendor goes here (RentCast, ATTOM, BatchData).
// Until then no adapter is registered and the app works off manually
// inserted or imported properties.
export function getAdapter(_env: Env): DataAdapter | null {
  return null;
}

export type { DataAdapter, NormalizedProperty, PropertySearch } from "./types";
