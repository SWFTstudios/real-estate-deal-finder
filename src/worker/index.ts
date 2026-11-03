import { Hono } from "hono";
import { zValidator } from "./validate";
import {
  criteriaInput,
  investorInput,
  investorWithCriteriaInput,
  type CriteriaInput,
} from "./schemas";

const app = new Hono<{ Bindings: Env }>();

const json = (v: unknown) => JSON.stringify(v ?? []);
const parse = (v: unknown) => {
  try {
    return JSON.parse(String(v ?? "[]"));
  } catch {
    return [];
  }
};

function criteriaRow(r: Record<string, unknown>) {
  return {
    id: r.id,
    investorId: r.investor_id,
    label: r.label,
    states: parse(r.states),
    counties: parse(r.counties),
    zips: parse(r.zips),
    propertyTypes: parse(r.property_types),
    minPrice: r.min_price,
    maxPrice: r.max_price,
    minBeds: r.min_beds,
    minBaths: r.min_baths,
    minSqft: r.min_sqft,
    minEquityPct: r.min_equity_pct,
    distressTypes: parse(r.distress_types),
    rehabAppetite: r.rehab_appetite,
    active: !!r.active,
    createdAt: r.created_at,
  };
}

function insertCriteria(db: D1Database, investorId: number, c: CriteriaInput) {
  return db
    .prepare(
      `INSERT INTO criteria
        (investor_id, label, states, counties, zips, property_types,
         min_price, max_price, min_beds, min_baths, min_sqft,
         min_equity_pct, distress_types, rehab_appetite)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      investorId,
      c.label,
      json(c.states),
      json(c.counties),
      json(c.zips),
      json(c.propertyTypes),
      c.minPrice ?? null,
      c.maxPrice ?? null,
      c.minBeds ?? null,
      c.minBaths ?? null,
      c.minSqft ?? null,
      c.minEquityPct ?? null,
      json(c.distressTypes),
      c.rehabAppetite ?? null,
    );
}

app.get("/api/health", (c) => c.json({ ok: true }));

// Investors with their criteria
app.get("/api/investors", async (c) => {
  const investors = await c.env.DB.prepare(
    "SELECT * FROM investors ORDER BY created_at DESC",
  ).all();
  const criteria = await c.env.DB.prepare("SELECT * FROM criteria").all();
  const byInvestor = new Map<number, unknown[]>();
  for (const row of criteria.results as Record<string, unknown>[]) {
    const list = byInvestor.get(row.investor_id as number) ?? [];
    list.push(criteriaRow(row));
    byInvestor.set(row.investor_id as number, list);
  }
  return c.json(
    (investors.results as Record<string, unknown>[]).map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      phone: i.phone,
      company: i.company,
      notes: i.notes,
      createdAt: i.created_at,
      criteria: byInvestor.get(i.id as number) ?? [],
    })),
  );
});

// Create an investor and a first buy box in one call (live-call intake)
app.post("/api/investors", zValidator(investorWithCriteriaInput), async (c) => {
  const { investor, criteria } = c.req.valid("json");
  const res = await c.env.DB.prepare(
    "INSERT INTO investors (name, email, phone, company, notes) VALUES (?,?,?,?,?)",
  )
    .bind(
      investor.name,
      investor.email || null,
      investor.phone ?? null,
      investor.company ?? null,
      investor.notes ?? null,
    )
    .run();
  const investorId = res.meta.last_row_id as number;
  await insertCriteria(c.env.DB, investorId, criteria).run();
  return c.json({ id: investorId }, 201);
});

// Add another buy box to an existing investor
app.post("/api/investors/:id/criteria", zValidator(criteriaInput), async (c) => {
  const id = Number(c.req.param("id"));
  const exists = await c.env.DB.prepare("SELECT id FROM investors WHERE id = ?")
    .bind(id)
    .first();
  if (!exists) return c.json({ error: "Investor not found" }, 404);
  const res = await insertCriteria(c.env.DB, id, c.req.valid("json")).run();
  return c.json({ id: res.meta.last_row_id }, 201);
});

app.patch("/api/investors/:id", zValidator(investorInput.partial()), async (c) => {
  const id = Number(c.req.param("id"));
  const v = c.req.valid("json");
  await c.env.DB.prepare(
    `UPDATE investors SET
       name = COALESCE(?, name), email = COALESCE(?, email),
       phone = COALESCE(?, phone), company = COALESCE(?, company),
       notes = COALESCE(?, notes)
     WHERE id = ?`,
  )
    .bind(v.name ?? null, v.email ?? null, v.phone ?? null, v.company ?? null, v.notes ?? null, id)
    .run();
  return c.json({ ok: true });
});

app.delete("/api/investors/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM investors WHERE id = ?")
    .bind(Number(c.req.param("id")))
    .run();
  return c.json({ ok: true });
});

// Anything that is not /api falls through to the static frontend.
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default {
  fetch: app.fetch,
  // Phase 3: refresh cached property data via the adapter.
  async scheduled(_event: ScheduledController, _env: Env, _ctx: ExecutionContext) {},
} satisfies ExportedHandler<Env>;
