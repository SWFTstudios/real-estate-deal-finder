# real-estate-deal-finder

A deal-finding tool for wholesalers and investors. Capture what an investor is looking for on a call, match cached properties to their buy box, and send them a deal sheet. Built to earn finder's fees as the middle man.

## Stack

- Cloudflare Workers with Hono (API) and a Vite + React frontend served from the same Worker
- Cloudflare D1 (SQLite) for investors, criteria, properties, owners, deals sent, and fees
- Cron Trigger for scheduled data refresh (wired in a later phase)
- Data sources plug in through `src/worker/adapters`, so switching vendors is a one-file change

## Status

| Phase | What | State |
| --- | --- | --- |
| 0 | Pick data source (RentCast, ATTOM, or BatchData) | Not started |
| 1 | Schema and project foundation | Done |
| 2 | Investor profile form and API | Done |
| 3 | Data adapter and cached property refresh | Next |
| 4 | Match and rank properties to a buy box | Planned |
| 5 | Deal sheets (shareable link, print to PDF) and email | Planned |
| 6 | Pipeline and finder's fee tracking | Planned |

## Setup

```bash
npm install

# Create the D1 database, then paste the returned database_id into wrangler.jsonc
npx wrangler d1 create deal-finder

# Apply the schema
npm run db:migrate:local    # local dev
npm run db:migrate:remote   # production

npm run dev                 # local dev server
npm run deploy              # build and deploy to Cloudflare
```

## Deploying from GitHub

In the Cloudflare dashboard, go to Workers & Pages, create a Worker, connect this repo, and use:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

Every push to `main` then deploys automatically.

Protect the app with Cloudflare Access (Zero Trust, free tier) so only you can open it. The API has no login of its own.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/investors` | List investors with their buy boxes |
| POST | `/api/investors` | Create an investor and first buy box |
| POST | `/api/investors/:id/criteria` | Add another buy box |
| PATCH | `/api/investors/:id` | Update contact details |
| DELETE | `/api/investors/:id` | Delete an investor |

## Notes

Taking a fee for connecting buyers to properties can fall under real estate licensing rules in some states, including New Jersey. Confirm your finder's fee setup with a real estate attorney before collecting fees.
