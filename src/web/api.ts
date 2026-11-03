export interface Criteria {
  id: number;
  label: string;
  states: string[];
  counties: string[];
  zips: string[];
  propertyTypes: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minBeds: number | null;
  minBaths: number | null;
  minSqft: number | null;
  minEquityPct: number | null;
  distressTypes: string[];
  rehabAppetite: string | null;
}

export interface Investor {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  createdAt: string;
  criteria: Criteria[];
}

export interface NewInvestorPayload {
  investor: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
  };
  criteria: {
    label: string;
    states: string[];
    counties: string[];
    zips: string[];
    propertyTypes: string[];
    minPrice: number | null;
    maxPrice: number | null;
    minBeds: number | null;
    minBaths: number | null;
    minSqft: number | null;
    minEquityPct: number | null;
    distressTypes: string[];
    rehabAppetite: "light" | "medium" | "heavy" | "any" | null;
  };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export const api = {
  listInvestors: () => request<Investor[]>("/api/investors"),
  createInvestor: (p: NewInvestorPayload) =>
    request<{ id: number }>("/api/investors", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  deleteInvestor: (id: number) =>
    request<{ ok: boolean }>(`/api/investors/${id}`, { method: "DELETE" }),
};
