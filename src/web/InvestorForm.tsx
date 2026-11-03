import { useState } from "react";
import { api, type NewInvestorPayload } from "./api";

const PROPERTY_TYPES = [
  ["sfr", "Single family"],
  ["multi", "Multi-family"],
  ["condo", "Condo"],
  ["townhome", "Townhome"],
  ["land", "Land"],
] as const;

const DISTRESS = [
  ["absentee", "Absentee owner"],
  ["tax_delinquent", "Tax delinquent"],
  ["pre_foreclosure", "Pre-foreclosure"],
  ["vacant", "Vacant"],
  ["high_equity", "High equity"],
] as const;

const REHAB = ["any", "light", "medium", "heavy"] as const;

const list = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const num = (v: string) => (v.trim() === "" ? null : Number(v));

export function InvestorForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [states, setStates] = useState("NJ");
  const [counties, setCounties] = useState("");
  const [zips, setZips] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [distress, setDistress] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");
  const [minSqft, setMinSqft] = useState("");
  const [minEquity, setMinEquity] = useState("");
  const [rehab, setRehab] = useState<(typeof REHAB)[number]>("any");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: NewInvestorPayload = {
      investor: { name, email, phone, company, notes },
      criteria: {
        label: "Primary",
        states: list(states).map((s) => s.toUpperCase()),
        counties: list(counties),
        zips: list(zips),
        propertyTypes: types,
        minPrice: num(minPrice),
        maxPrice: num(maxPrice),
        minBeds: num(minBeds),
        minBaths: num(minBaths),
        minSqft: num(minSqft),
        minEquityPct: num(minEquity),
        distressTypes: distress,
        rehabAppetite: rehab,
      },
    };
    try {
      await api.createInvestor(payload);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setNotes("");
      setCounties("");
      setZips("");
      setTypes([]);
      setDistress([]);
      setMinPrice("");
      setMaxPrice("");
      setMinBeds("");
      setMinBaths("");
      setMinSqft("");
      setMinEquity("");
      setRehab("any");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <h2>New investor</h2>

      <div className="grid">
        <label>
          Name *
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Company
          <input value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      </div>

      <h3>Buy box</h3>
      <div className="grid">
        <label>
          States (comma separated)
          <input value={states} onChange={(e) => setStates(e.target.value)} />
        </label>
        <label>
          Counties
          <input
            value={counties}
            onChange={(e) => setCounties(e.target.value)}
            placeholder="Bergen, Hudson"
          />
        </label>
        <label>
          ZIP codes
          <input value={zips} onChange={(e) => setZips(e.target.value)} placeholder="07601, 07302" />
        </label>
        <label>
          Rehab appetite
          <select value={rehab} onChange={(e) => setRehab(e.target.value as typeof rehab)}>
            {REHAB.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label>
          Min price
          <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        </label>
        <label>
          Max price
          <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </label>
        <label>
          Min beds
          <input type="number" min="0" value={minBeds} onChange={(e) => setMinBeds(e.target.value)} />
        </label>
        <label>
          Min baths
          <input
            type="number"
            min="0"
            step="0.5"
            value={minBaths}
            onChange={(e) => setMinBaths(e.target.value)}
          />
        </label>
        <label>
          Min sqft
          <input type="number" min="0" value={minSqft} onChange={(e) => setMinSqft(e.target.value)} />
        </label>
        <label>
          Min equity %
          <input
            type="number"
            min="0"
            max="100"
            value={minEquity}
            onChange={(e) => setMinEquity(e.target.value)}
          />
        </label>
      </div>

      <fieldset>
        <legend>Property types</legend>
        {PROPERTY_TYPES.map(([v, l]) => (
          <label key={v} className="check">
            <input
              type="checkbox"
              checked={types.includes(v)}
              onChange={() => toggle(types, setTypes, v)}
            />
            {l}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Distress signals</legend>
        {DISTRESS.map(([v, l]) => (
          <label key={v} className="check">
            <input
              type="checkbox"
              checked={distress.includes(v)}
              onChange={() => toggle(distress, setDistress, v)}
            />
            {l}
          </label>
        ))}
      </fieldset>

      <label>
        Notes
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={saving || !name.trim()}>
        {saving ? "Saving..." : "Save investor"}
      </button>
    </form>
  );
}
