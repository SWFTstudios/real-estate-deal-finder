// Every data vendor maps its response into this shape.
// Swapping vendors means writing one new adapter that implements DataAdapter.

export interface NormalizedProperty {
  source: string;
  sourceId: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  propertyType?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  estimatedValue?: number;
  mortgageBalance?: number;
  equityPct?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  absenteeOwner?: boolean;
  taxDelinquent?: boolean;
  preForeclosure?: boolean;
  vacant?: boolean;
  owner?: {
    name?: string;
    ownerType?: string;
    mailingAddress?: string;
  };
  raw?: unknown;
}

export interface PropertySearch {
  states?: string[];
  counties?: string[];
  zips?: string[];
  propertyTypes?: string[];
  limit?: number;
}

export interface SkipTraceResult {
  phone?: string;
  email?: string;
}

export interface DataAdapter {
  name: string;
  searchProperties(query: PropertySearch): Promise<NormalizedProperty[]>;
  // Optional: only run on properties an investor said yes to.
  skipTrace?(property: NormalizedProperty): Promise<SkipTraceResult>;
}
