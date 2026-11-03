-- Investors you talk to, and what they are looking for.
CREATE TABLE investors (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  company      TEXT,
  notes        TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One investor can have several buy boxes (criteria sets).
CREATE TABLE criteria (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  investor_id       INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  label             TEXT NOT NULL DEFAULT 'Primary',
  states            TEXT NOT NULL DEFAULT '[]',   -- JSON array, e.g. ["NJ","NY"]
  counties          TEXT NOT NULL DEFAULT '[]',   -- JSON array
  zips              TEXT NOT NULL DEFAULT '[]',   -- JSON array
  property_types    TEXT NOT NULL DEFAULT '[]',   -- JSON array: sfr, multi, condo, townhome, land
  min_price         INTEGER,
  max_price         INTEGER,
  min_beds          INTEGER,
  min_baths         REAL,
  min_sqft          INTEGER,
  min_equity_pct    REAL,                         -- 0-100
  distress_types    TEXT NOT NULL DEFAULT '[]',   -- JSON array: absentee, tax_delinquent, pre_foreclosure, vacant, high_equity
  rehab_appetite    TEXT,                         -- light, medium, heavy, any
  active            INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_criteria_investor ON criteria(investor_id);

-- Cached property records, normalized from any data source.
CREATE TABLE properties (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  source            TEXT NOT NULL,                -- adapter name, e.g. rentcast
  source_id         TEXT NOT NULL,                -- the vendor's own ID
  address           TEXT NOT NULL,
  city              TEXT,
  state             TEXT,
  zip               TEXT,
  county            TEXT,
  property_type     TEXT,
  beds              INTEGER,
  baths             REAL,
  sqft              INTEGER,
  year_built        INTEGER,
  estimated_value   INTEGER,
  mortgage_balance  INTEGER,
  equity_pct        REAL,
  last_sale_date    TEXT,
  last_sale_price   INTEGER,
  absentee_owner    INTEGER,
  tax_delinquent    INTEGER,
  pre_foreclosure   INTEGER,
  vacant            INTEGER,
  raw               TEXT,                         -- original vendor JSON for debugging
  fetched_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (source, source_id)
);
CREATE INDEX idx_properties_zip ON properties(zip);
CREATE INDEX idx_properties_state ON properties(state);

-- Owner info. Contact details are filled only after a skip trace on shortlisted deals.
CREATE TABLE owners (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id       INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name              TEXT,
  owner_type        TEXT,                         -- individual, llc, trust, corporation
  mailing_address   TEXT,
  phone             TEXT,
  email             TEXT,
  skip_traced_at    TEXT
);
CREATE INDEX idx_owners_property ON owners(property_id);

-- Every property you send an investor, and where it stands.
CREATE TABLE deals_sent (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  investor_id       INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  property_id       INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'sent', -- sent, interested, passed, under_contract, closed, dead
  sent_at           TEXT NOT NULL DEFAULT (datetime('now')),
  notes             TEXT,
  UNIQUE (investor_id, property_id)
);

-- Finder's fee tracking per deal.
CREATE TABLE fees (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id           INTEGER NOT NULL REFERENCES deals_sent(id) ON DELETE CASCADE,
  amount_cents      INTEGER NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending', -- pending, invoiced, paid
  paid_at           TEXT,
  notes             TEXT
);
