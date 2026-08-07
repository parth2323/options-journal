# Options Journal

> **A full-stack, multi-tenant SaaS trading journal and performance analytics platform** built for options, stock, futures, and crypto traders.

**Live stack:** Next.js 16 · React 19 · TypeScript 5 · Supabase (Postgres + Auth + RLS + Storage) · DeepSeek AI · TailwindCSS v4

---

## Quick Start

```bash
# Install dependencies
npm install

# Add environment variables
cp .env.local.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, DEEPSEEK_API_KEY, FINNHUB_API_KEY

# Start dev server
npm run dev
# → http://localhost:3000
```

---

## Feature Overview

| Feature | Description |
|---|---|
| 📊 **Dashboard** | KPI cards, equity curve, result donut, today's P&L |
| 📈 **Analytics** | Day/hour heatmap, session breakdown, hold-time histogram, streak tracker, symbol ranking |
| 📋 **Trade Journal** | Full CRUD with auto P&L compute, confluence tags, screenshots |
| 🤖 **AI Coach** | DeepSeek-powered analysis with 8 score categories + interactive chat |
| 📅 **Calendar** | Monthly P&L calendar view |
| 💡 **Chart Ideas** | Observations journal with screenshot uploads + mood tracking |
| 📰 **Market** | Real-time news (Finnhub) + economic calendar (ForexFactory) |
| ⏱️ **Routine** | Structured pre/post-market routine with live phase tracker |
| ⚙️ **Settings** | Accounts, confluence tags, CSV export, profile |

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16.2 (App Router) |
| **Language** | TypeScript 5 (strict) |
| **UI** | React 19, TailwindCSS v4, shadcn/ui |
| **Charts** | Recharts 3 |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Supabase Auth — Email/Password + Google OAuth |
| **Storage** | Supabase Storage (screenshots) |
| **AI** | DeepSeek API (deepseek-reasoner model) |
| **News** | Finnhub API |
| **Forms** | React Hook Form + Zod |
| **State** | TanStack Query |
| **Tables** | TanStack Table |
| **Toasts** | Sonner |
| **Icons** | Lucide React |

---

## Database Tables (Supabase)

| Table | Purpose |
|---|---|
| `accounts` | Trading accounts (live / backtest) with balance + goal |
| `trades` | Full trade records with auto-computed net P&L |
| `confluence_tags` | User-defined setup/strategy tags |
| `routine` | Structured pre-market trading routine (JSONB) |
| `chart_observations` | Chart ideas journal with screenshot URLs |

All tables use **Row Level Security** — users can only access their own data.

---

## Application Routes

### Pages

| Route | Description |
|---|---|
| `/` | Dashboard |
| `/analytics` | Performance analytics (heatmap, sessions, streaks, symbols) |
| `/trades` | Trade table |
| `/trades/new` | Log trade |
| `/trades/[id]/edit` | Edit trade |
| `/calendar` | P&L calendar |
| `/coach` | AI Trading Mentor |
| `/ideas` | Chart observations journal |
| `/market` | News + economic calendar |
| `/routine` | Pre-market routine |
| `/accounts` | Account list |
| `/accounts/[id]` | Account detail |
| `/settings` | Settings (profile, accounts, tags, export) |
| `/login` | Email + Google OAuth sign-in |
| `/signup` | Account registration |
| `/forgot-password` | Password reset |

### API Routes

| Route | Methods | Description |
|---|---|---|
| `/api/trades` | GET, POST | List / create trades |
| `/api/trades/[id]` | GET, PATCH, DELETE | Single trade |
| `/api/trades/[id]/duplicate` | POST | Clone trade |
| `/api/accounts` | GET, POST | List / create accounts |
| `/api/accounts/[id]` | PATCH, DELETE | Update / delete account |
| `/api/coach` | POST | Generate AI coaching report |
| `/api/coach/chat` | POST | Interactive AI chat |
| `/api/export` | GET | Download trades as CSV |
| `/api/market/news` | GET | Finnhub news feed (15-min cache) |
| `/api/market/calendar` | GET | Economic calendar (1-hr cache) |
| `/api/observations` | GET, POST | Chart observations |
| `/api/observations/[id]` | GET, PATCH, DELETE | Single observation |
| `/api/observations/upload` | POST | Screenshot upload → Supabase Storage |
| `/api/routine` | GET, PATCH | Routine data |
| `/api/stats` | GET | Account statistics |
| `/api/tags` | GET, POST, DELETE | Confluence tags |

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key (RLS enforced)
DEEPSEEK_API_KEY=               # DeepSeek LLM for AI Coach
FINNHUB_API_KEY=                # Financial news
```

---

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated pages (10 routes)
│   ├── (auth)/         # Login / Signup / Forgot Password
│   └── api/            # 16 API route handlers
├── components/
│   ├── analytics/      # 8 analytics chart components
│   ├── coach/          # AI Coach dashboard + chatbox
│   ├── dashboard/      # Dashboard widgets
│   ├── layout/         # Sidebar, ThemeToggle
│   ├── market/         # News + calendar components
│   ├── observations/   # Chart Ideas components
│   ├── routine/        # Routine dashboard + editor
│   ├── settings/       # Settings dashboard
│   ├── trades/         # Trade table, form, drawer
│   └── ui/             # shadcn/ui primitives (20 components)
└── lib/
    ├── auth.ts         # Server-side auth helper
    ├── db.ts           # All Supabase CRUD functions
    ├── types.ts        # TypeScript interfaces
    ├── utils.ts        # P&L calculators + formatters
    └── supabase/       # Browser + server Supabase clients
```

---

## Development Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # ESLint check
npx tsc --noEmit   # TypeScript type check
```

---

## Full Documentation

See [project_documentation.md](./docs/project_documentation.md) for the complete technical reference including:
- Full database schemas with SQL
- Complete component inventory
- AI Coach architecture
- Security model
- Analytics engine breakdown
- Feature roadmap
