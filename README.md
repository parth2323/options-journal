# Options Trading Journal

A full-stack trading journal web app with dark Notion-style UI. Built with Next.js 15, Tailwind CSS, and local JSON storage (Supabase-ready).

## Quick Start

```bash
cd options-journal
npm run dev
# → http://localhost:3000
```

## Project Structure

```
options-journal/
├── data/                    ← DROP YOUR CSV FILES HERE
│   ├── Accounts.csv
│   ├── Trade_Journal.csv
│   └── db.json              ← auto-generated local database
├── scripts/
│   └── import-csv.ts        ← Notion CSV import script
└── src/
    ├── app/
    │   ├── (app)/           ← all app pages
    │   │   ├── page.tsx         Dashboard
    │   │   ├── trades/          Trade journal table
    │   │   ├── calendar/        Calendar view
    │   │   ├── accounts/        Account list + detail
    │   │   └── settings/        Manage accounts & tags
    │   └── api/             ← REST API routes (local JSON backend)
    ├── components/
    │   ├── dashboard/       AccountCard, EquityCurveChart, ResultDonutChart, SettingsClient
    │   ├── trades/          TradesTable, TradeDrawer, TradeForm, CalendarView
    │   └── layout/          Sidebar, QueryProvider
    └── lib/
        ├── db.ts            ← local JSON read/write (swap for Supabase here later)
        ├── types.ts         ← shared TypeScript types
        └── utils.ts         ← formatting helpers
```

## Importing Your Notion Data

1. Export your Notion databases as CSV and place them in the `/data` folder:
   - `data/Accounts.csv`
   - `data/Trade_Journal.csv`

2. Run the import script:
   ```bash
   npx tsx scripts/import-csv.ts
   ```

3. Refresh the app — all your data will appear instantly.

### CSV Column Mapping

| Notion Field | DB Field | Notes |
|---|---|---|
| `Profit/Loss` (🟢/🔴/🟡) | `result` | Emoji or text both supported |
| `Type Opt.` + `Type Opt.Personal` | `direction` | e.g. "Call Long" |
| `Status` | `status` | "Closed by T/P" → `closed_tp`, etc. |
| `Confluence` | `confluences[]` | Comma-separated string → array |
| `Open` | `opened_at` | Any date format |
| `Close` | `closed_at` | Any date format |
| `Account` (relation) | `account_id` | Matched by name |

## Pages

| Route | Description |
|---|---|
| `/` | Dashboard — account cards, summary stats, equity curve, donut chart |
| `/trades` | Sortable/filterable trade table with footer sums, click to open drawer |
| `/trades/new` | Add trade form with full validation |
| `/trades/[id]/edit` | Edit existing trade |
| `/calendar` | Month calendar — colored dots per day, click to see trades |
| `/accounts` | All account cards |
| `/accounts/[id]` | Single account — stats, equity curve, filtered trades |
| `/settings` | Manage accounts + confluence tags, export CSV |

## API Routes

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/accounts` | List / create accounts |
| GET/PATCH/DELETE | `/api/accounts/[id]` | Single account |
| GET/POST | `/api/trades` | List / create trades |
| GET/PATCH/DELETE | `/api/trades/[id]` | Single trade |
| GET/POST/PATCH/DELETE | `/api/tags` | Confluence tags |
| GET | `/api/stats` | Per-account stats + equity curve data |
| GET | `/api/export` | Download all trades as CSV |

## Migrating to Supabase Later

The entire backend is isolated in `src/lib/db.ts`. To switch to Supabase:

1. Install `@supabase/ssr` and `@supabase/supabase-js`
2. Create `.env.local` from `.env.local.example`
3. Replace functions in `src/lib/db.ts` with Supabase client queries
4. Run `supabase/migrations/001_initial_schema.sql`

Zero frontend changes needed — only `db.ts` and the API routes change.

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript strict
- **Styling:** Tailwind CSS v4 + shadcn/ui (dark theme)
- **Charts:** Recharts
- **Forms:** react-hook-form + zod
- **Storage:** Local JSON file (`data/db.json`)
- **Future:** Supabase Postgres + Auth + RLS
