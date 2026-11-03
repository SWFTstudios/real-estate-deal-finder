import { useCallback, useEffect, useState } from "react";
import { api, type Criteria, type Investor } from "./api";
import { InvestorForm } from "./InvestorForm";

const money = (n: number | null) => (n == null ? "any" : `$${n.toLocaleString()}`);

function describe(c: Criteria) {
  const where = [...c.states, ...c.counties, ...c.zips].join(", ") || "anywhere";
  const types = c.propertyTypes.join(", ") || "any type";
  const extras = [
    c.minBeds != null ? `${c.minBeds}+ bd` : null,
    c.minBaths != null ? `${c.minBaths}+ ba` : null,
    c.minSqft != null ? `${c.minSqft}+ sqft` : null,
    c.minEquityPct != null ? `${c.minEquityPct}%+ equity` : null,
    c.distressTypes.length ? c.distressTypes.join(", ") : null,
    c.rehabAppetite && c.rehabAppetite !== "any" ? `${c.rehabAppetite} rehab` : null,
  ].filter(Boolean);
  return `${where} | ${types} | ${money(c.minPrice)} to ${money(c.maxPrice)}${
    extras.length ? " | " + extras.join(" | ") : ""
  }`;
}

export function App() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setInvestors(await api.listInvestors());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load investors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    if (!confirm("Delete this investor and their buy boxes?")) return;
    await api.deleteInvestor(id);
    load();
  }

  return (
    <main>
      <header>
        <h1>Deal Finder</h1>
        <p>Capture what each investor wants, then match deals to it.</p>
      </header>

      <InvestorForm onSaved={load} />

      <section>
        <h2>Investors</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !investors.length && <p>No investors yet. Add one above.</p>}
        {investors.map((i) => (
          <article key={i.id} className="card">
            <div className="row">
              <div>
                <h3>{i.name}</h3>
                <p className="muted">
                  {[i.company, i.email, i.phone].filter(Boolean).join(" | ")}
                </p>
              </div>
              <button className="danger" onClick={() => remove(i.id)}>
                Delete
              </button>
            </div>
            {i.criteria.map((c) => (
              <p key={c.id} className="criteria">
                <strong>{c.label}:</strong> {describe(c)}
              </p>
            ))}
            {i.notes && <p className="muted">{i.notes}</p>}
          </article>
        ))}
      </section>
    </main>
  );
}
