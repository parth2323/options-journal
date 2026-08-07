# Options Journal — Full Project Documentation

> **Last Updated:** August 7, 2026  
> **Version:** 0.1.0  
> **Environment:** Next.js 16 · React 19 · TypeScript 5 · Supabase · TailwindCSS v4

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication System](#4-authentication-system)
5. [Database Schema (Supabase)](#5-database-schema-supabase)
6. [Application Pages](#6-application-pages)
7. [API Routes](#7-api-routes)
8. [Component Library](#8-component-library)
9. [AI Trading Mentor (Coach)](#9-ai-trading-mentor-coach)
10. [Data Layer & Utilities](#10-data-layer--utilities)
11. [Analytics Engine](#11-analytics-engine)
12. [User Workflow](#12-user-workflow)
13. [Security Model](#13-security-model)
14. [Feature Roadmap](#14-feature-roadmap)

---

## 1. Project Overview

**Options Journal** is a full-stack, multi-tenant SaaS trading journal and analytics platform built for options, stock, futures, and crypto traders. It allows users to log trades, track performance, analyze patterns, get AI-driven coaching, journal chart ideas, and maintain a structured pre-market routine.

### Core Value Propositions
- **Accurate P&L tracking** with commission-aware net P&L computation
- **AI Mentor** powered by DeepSeek LLM with full context of the user's trade history
- **Performance Analytics** with heatmaps, streak tracking, session breakdowns, and symbol rankings
- **Multi-account support** (live & backtest accounts in one dashboard)
- **Chart Ideas Journal** with screenshot uploads and mood tagging
- **Routine Builder** — structured pre/post-market trading routines with live timer
- **Market Intelligence** — real-time financial news (Finnhub) and economic calendar (ForexFactory)
- **Full multi-tenant isolation** — every user sees only their own data via Supabase Row Level Security

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.11 | Full-stack React framework (App Router) |
| **React** | 19.2.4 | UI rendering |
| **TypeScript** | 5.x | Static typing |
| **TailwindCSS** | 4.x | Utility-first styling |
| **Recharts** | 3.10.0 | Charts: equity curve, heatmaps, histograms, bar charts |
| **Lucide React** | 1.25.0 | Icon library (300+ icons used throughout) |
| **Sonner** | 2.0.7 | Toast notification system |
| **date-fns** | 4.4.0 | Date formatting and distance computation |

### Forms & Validation
| Technology | Version | Purpose |
|---|---|---|
| **React Hook Form** | 7.82.0 | Form state management |
| **Zod** | 4.4.3 | Runtime schema validation |
| **@hookform/resolvers** | 5.4.0 | Zod ↔ React Hook Form bridge |

### Data & State
| Technology | Version | Purpose |
|---|---|---|
| **@supabase/supabase-js** | 2.110.8 | Supabase client SDK |
| **@supabase/ssr** | 0.12.4 | Cookie-based auth for SSR/middleware |
| **@tanstack/react-query** | 5.101.4 | Server state caching |
| **@tanstack/react-table** | 8.21.3 | Trades table with sorting/filtering |
| **PapaParse** | 5.5.4 | CSV export parsing |

### UI Components
| Technology | Purpose |
|---|---|
| **shadcn/ui** | Base UI components (dialog, sheet, select, etc.) |
| **@base-ui/react** | Headless UI primitives |
| **class-variance-authority** | Component variant system |
| **tailwind-merge** | Class name deduplication |

### Backend / Cloud
| Service | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, Auth, Row Level Security, Storage |
| **DeepSeek API** | LLM powering the AI Trading Mentor |
| **Finnhub API** | Real-time financial news feed |
| **ForexFactory** (scraped) | Economic calendar events |

### Dev Tooling
| Tool | Version | Purpose |
|---|---|---|
| **ESLint** | 9 | Linting |
| **tsx** | 4.23.1 | TypeScript script runner |
| **postcss** | 4 | CSS processing |

---

## 3. Project Structure

```
options-journal/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (app)/                    # Authenticated route group
│   │   │   ├── layout.tsx            # h-screen flex layout with Sidebar
│   │   │   ├── page.tsx              # Dashboard (/)
│   │   │   ├── analytics/page.tsx    # Performance Analytics (/analytics)
│   │   │   ├── trades/
│   │   │   │   ├── page.tsx          # Trades table (/trades)
│   │   │   │   ├── new/page.tsx      # Log new trade (/trades/new)
│   │   │   │   └── [id]/edit/page.tsx # Edit trade
│   │   │   ├── accounts/
│   │   │   │   ├── page.tsx          # Account list
│   │   │   │   └── [id]/page.tsx     # Account detail
│   │   │   ├── calendar/page.tsx     # P&L calendar (/calendar)
│   │   │   ├── coach/page.tsx        # AI Coach (/coach)
│   │   │   ├── ideas/page.tsx        # Chart Ideas (/ideas)
│   │   │   ├── market/page.tsx       # Market overview (/market)
│   │   │   ├── routine/page.tsx      # Pre-market routine (/routine)
│   │   │   └── settings/page.tsx     # Settings (/settings)
│   │   ├── (auth)/                   # Public auth route group
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── api/                      # Server-side API routes
│   │   │   ├── trades/               # CRUD: GET, POST, PATCH, DELETE
│   │   │   │   └── [id]/duplicate/   # POST: clone a trade
│   │   │   ├── accounts/             # CRUD: GET, POST, PATCH, DELETE
│   │   │   ├── coach/                # POST: generate AI report
│   │   │   │   └── chat/             # POST: conversational AI chat
│   │   │   ├── export/               # GET: CSV download
│   │   │   ├── market/
│   │   │   │   ├── news/             # GET: Finnhub news feed
│   │   │   │   └── calendar/         # GET: ForexFactory econ calendar
│   │   │   ├── observations/         # CRUD: chart ideas
│   │   │   │   ├── [id]/
│   │   │   │   ├── upload/           # POST: screenshot upload to Supabase Storage
│   │   │   │   └── debug/
│   │   │   ├── routine/              # GET/PATCH: routine data
│   │   │   ├── stats/                # GET: account statistics
│   │   │   └── tags/                 # GET, POST, DELETE: confluence tags
│   │   ├── auth/callback/route.ts    # OAuth callback (Google)
│   │   └── sw.js/route.ts            # Service Worker PWA support
│   ├── components/
│   │   ├── analytics/                # Performance Analytics (8 files)
│   │   ├── coach/                    # AI Coach dashboard + chatbox
│   │   ├── dashboard/                # Dashboard widgets (5 files)
│   │   ├── layout/                   # Sidebar, ThemeToggle, QueryProvider
│   │   ├── market/                   # EconomicCalendar, NewsFeed
│   │   ├── observations/             # Chart Ideas page + drawer + form
│   │   ├── routine/                  # RoutineDashboard, RoutineEditorDrawer
│   │   ├── settings/                 # SettingsDashboard (6 tabs)
│   │   ├── trades/                   # TradesTable, TradeForm, TradeDrawer, CalendarView
│   │   └── ui/                       # shadcn/ui base components (20 files)
│   ├── lib/
│   │   ├── auth.ts                   # getAuthenticatedUserId()
│   │   ├── db.ts                     # All Supabase CRUD functions
│   │   ├── types.ts                  # All TypeScript interfaces
│   │   ├── utils.ts                  # P&L calculators, formatters, helpers
│   │   ├── routineData.ts            # Default routine data seed
│   │   ├── supabase.ts               # Re-export shim
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client
│   │       └── server.ts             # Server Supabase client (cookie-based)
│   └── middleware.ts                 # Auth guard + route protection
├── public/                           # Static assets
├── data/                             # Legacy local JSON data
├── scripts/                          # Migration / seed scripts
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local                        # SUPABASE_URL, ANON_KEY, DEEPSEEK_API_KEY, FINNHUB_API_KEY
```

---

## 4. Authentication System

### Provider
**Supabase Auth** with two sign-in methods:
1. **Email + Password** — standard credential auth with Supabase `signInWithPassword`
2. **Google OAuth** — via `signInWithOAuth({ provider: 'google' })` → redirects to `/auth/callback`

### Flow
```
User visits /login
    ↓
Email/Password OR Google button
    ↓
Supabase Auth validates credentials
    ↓
Session cookie set via @supabase/ssr
    ↓
Middleware verifies session on EVERY request
    ↓
Protected pages → render with user data
Auth pages with valid session → redirect to /
```

### Key Files
| File | Role |
|---|---|
| `src/middleware.ts` | Intercepts all routes, verifies Supabase session, redirects unauthenticated users to `/login?next=<path>`, returns 401 for unauthenticated API calls |
| `src/app/auth/callback/route.ts` | OAuth PKCE exchange — converts auth code → session |
| `src/lib/auth.ts` | `getAuthenticatedUserId()` — server-side session lookup |
| `src/lib/supabase/server.ts` | `createSupabaseServerClient()` — cookie-aware server client |
| `src/lib/supabase/client.ts` | `createSupabaseBrowserClient()` — browser client |

### Pages
| Route | Description |
|---|---|
| `/login` | Email/password login + Google OAuth button + forgot password link |
| `/signup` | Account registration with full name, email, password |
| `/forgot-password` | Password reset email via Supabase |

### Security Rules
- Middleware allows `/api/market/*` without auth (public market data)
- All other API routes → 401 JSON if unauthenticated
- All app pages → redirect to `/login` if unauthenticated

---

## 5. Database Schema (Supabase)

All tables have **Row Level Security (RLS)** enabled with `auth.uid() = user_id` policies.

### Table: `accounts`

```sql
CREATE TABLE accounts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  account_type text NOT NULL,     -- 'live' | 'backtest'
  initial_balance numeric DEFAULT 1000,
  goal         numeric DEFAULT 10000,
  created_at   timestamptz DEFAULT now()
);
```

**Fields:**
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `user_id` | uuid | FK → `auth.users`, RLS key |
| `name` | text | e.g. "Paper Trading", "Live TDA" |
| `account_type` | text | `'live'` or `'backtest'` |
| `initial_balance` | numeric | Starting capital — used for equity curve |
| `goal` | numeric | Target balance — shown as progress bar |
| `created_at` | timestamptz | Created timestamp |

---

### Table: `trades`

```sql
CREATE TABLE trades (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id      uuid REFERENCES accounts(id),
  symbol          text NOT NULL,          -- e.g. 'SPY', 'QQQ'
  contract_label  text,                   -- e.g. 'SPY 480C 12/15'
  instrument_type text NOT NULL,          -- 'options' | 'stock' | 'futures' | 'crypto'
  direction       text,                   -- 'call_long' | 'call_short' | 'put_long' | 'put_short'
  opened_at       timestamptz NOT NULL,
  closed_at       timestamptz,
  timezone        text DEFAULT 'America/New_York',
  quantity        integer DEFAULT 1,
  entry_price     numeric,
  exit_price      numeric,
  gross_pnl       numeric DEFAULT 0,      -- before commissions
  commission      numeric DEFAULT 0,
  net_pnl         numeric DEFAULT 0,      -- gross_pnl - commission (computed on write)
  result          text,                   -- 'win' | 'loss' | 'breakeven'
  status          text DEFAULT 'open',    -- 'open' | 'closed_tp' | 'closed_sl' | 'closed_manual'
  session         text,                   -- 'new_york' | 'london' | 'asia' | 'sydney'
  percent_risk    numeric,                -- % return on capital risked
  amount_risked   numeric,                -- entry_price × multiplier × qty
  roi_percent     numeric,                -- net_pnl / amount_risked × 100
  confluences     text[] DEFAULT '{}',    -- array of confluence tag labels
  notes           text,                   -- trade notes / markdown
  screenshot_url  text,                   -- URL to uploaded screenshot
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

**Key Computed Fields (calculated at write time in `createTrade`/`updateTrade`):**
- `net_pnl = gross_pnl - commission`
- `amount_risked = entry_price × multiplier × quantity` (multiplier=100 for options, 1 for stock)
- `roi_percent = net_pnl / amount_risked × 100`

**Instrument Multipliers:**
| Instrument | Multiplier |
|---|---|
| Options | 100 (1 contract = 100 shares) |
| Futures | Contract-specific (1 for simplicity) |
| Stock | 1 |
| Crypto | 1 |

---

### Table: `confluence_tags`

```sql
CREATE TABLE confluence_tags (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label    text NOT NULL,    -- e.g. 'VWAP Reclaim', 'Support Level'
  color    text NOT NULL     -- Tailwind color name: 'indigo', 'emerald', etc.
);
```

User-created tags that can be attached to trades as `confluences[]`. Used for setup identification and later filtering/grouping.

---

### Table: `routine`

```sql
CREATE TABLE routine (
  id          uuid PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  title       text,
  subtitle    text,
  timezone    text,
  phases      jsonb,          -- RoutinePhase[] — time-blocked trading routine steps
  regimes     jsonb,          -- RoutineRegime[] — market condition rules
  rules       jsonb,          -- RoutineRule[] — personal trading rules
  reset_commitment text,
  updated_at  timestamptz
);
```

One row per user (upserted). Stores the full structured pre/post-market routine as JSONB.

**JSONB Sub-structures:**
- **`phases`** — Array of `RoutinePhase`: `{ id, phaseNumber, title, timeWindow, startMinutes, endMinutes, items[] }`
- **`regimes`** — Array of `RoutineRegime`: `{ id, regime, condition, action }`
- **`rules`** — Array of `RoutineRule`: `{ id, title, text }`

---

### Table: `chart_observations`

```sql
CREATE TABLE chart_observations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  observed_at        timestamptz NOT NULL,   -- when you spotted the setup
  symbol             text NOT NULL,          -- 'SPY', 'QQQ', etc.
  timeframe          text,                   -- '5m', '1h', 'Daily'
  title              text NOT NULL,          -- short headline
  body               text,                   -- markdown-friendly notes
  screenshot_urls    text[] DEFAULT '{}',    -- Supabase Storage URLs
  mood               text,                   -- 'confident' | 'uncertain' | 'regret' | 'neutral' | 'excited'
  tags               text[] DEFAULT '{}',    -- e.g. ['missed setup', 'supply zone']
  would_have_result  text,                   -- 'profit' | 'loss' | 'unknown'
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);
```

**Supabase Storage:** Screenshots are uploaded to `chart-observation-screenshots` bucket via `/api/observations/upload` and stored as public URLs.

---

### Supabase Storage Buckets

| Bucket | Purpose | Access |
|---|---|---|
| `chart-observation-screenshots` | User chart screenshots from Ideas journal | Public URL |
| `trade-screenshots` | Trade screenshot uploads | Public URL |

---

## 6. Application Pages

### Dashboard `/`

**Type:** Server Component (SSR)  
**Data fetched server-side:** `getTrades()`, `getAccounts()`, `getAccountStats()`, `getEquityCurve()`

**Features:**
- KPI cards: Current Balance, Total Net P&L, Win Rate, Total Return %, Best Trade, Today's P&L
- **Equity Curve Chart** — interactive area chart with balance overlay and per-trade tooltips
- **Result Donut Chart** — Win/Loss/Breakeven distribution
- **Today's Trades** section — all trades opened or closed today
- **Account Cards** — per-account stats with progress toward goal

---

### Analytics `/analytics`

**Type:** Server Component → Client tabbed shell  
**Data fetched server-side:** `getTrades()` → `computeAnalytics()` (pure computation)

**4 Tabs:**

| Tab | Contents |
|---|---|
| **Overview** | Streak Tracker · Commission Drain · Day-of-Week bar chart |
| **Timing** | Performance Heatmap (7×15 day/hour grid) · Session Breakdown · Hold Time Histogram |
| **Symbols** | Symbol Breakdown table (profit factor, win rate, total P&L per ticker) |
| **Risk & Costs** | Detailed Commission Drain with weekly trend · Day-of-week risk view |

**Top KPI row (6 cards):** Total Trades · Win Rate · Profit Factor · Expectancy · Avg Win · Avg Loss

---

### Trades `/trades`

**Type:** Server Component → `TradesTable` (Client)  
**Data:** All user trades with account mapping

**Features:**
- Full-featured data table (TanStack Table) with sorting, filtering by symbol/status/result
- Quick-view drawer per trade (`TradeDrawer`) — shows all fields, screenshots, notes
- Inline delete and duplicate actions
- Account filter dropdown
- Status badges, P&L color coding, hold time display

---

### Log Trade `/trades/new` & Edit `/trades/[id]/edit`

**Type:** Server → `TradeForm` (Client)  
**Features:**
- Fields: Symbol, Contract Label, Instrument Type, Direction, Session
- Timestamps: Open time (date + hour/minute), Close time
- Pricing: Entry price, Exit price, Quantity → auto-computes Gross P&L
- Commission → auto-computes Net P&L, Amount Risked, ROI%
- Result: auto-suggested from net P&L (override available)
- Status: Open / Closed T/P / Closed S/L / Manual Close
- Confluence tags: multi-select from user's saved tags
- Notes textarea
- Screenshot upload field

---

### Calendar `/calendar`

**Type:** Server → `CalendarView` (Client)  
**Features:**
- Month grid showing each trading day
- P&L color intensity: deep green (big win) → deep red (big loss)
- Cell shows: date, daily P&L, number of trades
- Navigatable by month

---

### AI Coach `/coach`

**Type:** Server → `CoachDashboard` (Client)  
**Data:** User's accounts (passed as prop); trades & observations fetched via API

**Features:**
- **Timeframe selector:** Today / This Week / All Time
- **Generate Report** button → calls `/api/coach` → DeepSeek LLM
- **Radial Score Gauge** — animated SVG gauge showing 0–100 overall score
- **7 Score Categories:** Discipline, Risk Management, Trade Selection, Execution Quality, Emotional Control, Consistency, Strategy Adherence
- **Collapsible sections:** Mentor Headline · Summary · Strengths · Weaknesses · Patterns · Action Plan · Golden Habit
- **Metrics Snapshot** — 15+ computed metrics shown as a grid
- **Interactive AI Chat** (`CoachChatBox`) — multi-turn conversation with the AI using trade context as system prompt

---

### Chart Ideas `/ideas`

**Type:** Server → `IdeasPage` (Client)  
**Data:** All user chart observations

**Features:**
- Grid of observation cards with mood emoji, symbol badge, timeframe, tags
- Filter by mood, symbol, would-have result
- Full observation drawer (`ObservationDrawer`) — view screenshots, body, tags
- Create / Edit observation form (`ObservationForm`) — screenshot upload via Supabase Storage
- Mood tracking: Confident / Uncertain / Regret / Neutral / Excited
- Would-have-result: Profit / Loss / Unknown (for hypothetical trades)

---

### Market `/market`

**Type:** Server → Client components  
**External APIs:** Finnhub (news) · ForexFactory (economic calendar)

**Features:**
- **News Feed** — real-time financial news with category filter (General / Forex / Crypto / Merger)
  - 15-minute in-memory cache on the server
  - Links to full articles
- **Economic Calendar** — weekly economic events with impact level (High/Medium/Low) and previous/forecast/actual values
  - Scrapes ForexFactory HTML with server-side parsing

---

### Routine `/routine`

**Type:** Server → `RoutineDashboard` (Client)  
**Data:** User's saved routine (or default SPY trader routine)

**Features:**
- **Live Phase Tracker** — detects current routine phase based on local clock (minute-based)
- **Collapsible phases** with timestamps and action items
- **Market Regime Playbook** — condition → action rules for different market states
- **Trading Rules** — numbered list of personal rules
- **Reset Commitment** — accountability statement
- **Edit Mode** via `RoutineEditorDrawer` — full CRUD for phases, items, regimes, rules
- Saves to Supabase `routine` table via `/api/routine`

---

### Accounts `/accounts` & `/accounts/[id]`

**Type:** Server Components  
**Features:**
- List of all accounts with type badge, balance, goal progress
- Account detail: equity curve, win rate, trade list filtered to that account
- Create/Edit/Delete accounts from Settings page

---

### Settings `/settings`

**Type:** Server → `SettingsDashboard` (Client)  
**6 Tabs:**

| Tab | Features |
|---|---|
| **Profile** | Display name, email, avatar, change password, Google link status |
| **Accounts** | Create/Edit/Delete trading accounts (name, type, starting balance, goal) |
| **Routine** | Link to routine editor, quick stats |
| **Tags** | Create/Edit/Delete confluence tags with color picker |
| **Coach** | AI Coach settings, DeepSeek API key status |
| **Data** | Export trades to CSV (calls `/api/export`), import info |

---

## 7. API Routes

All routes require authentication except `/api/market/*`.

| Route | Method | Description |
|---|---|---|
| `/api/trades` | `GET` | List all trades for authenticated user |
| `/api/trades` | `POST` | Create new trade (auto-computes net_pnl) |
| `/api/trades/[id]` | `GET` | Get single trade |
| `/api/trades/[id]` | `PATCH` | Update trade (recomputes net_pnl if prices change) |
| `/api/trades/[id]` | `DELETE` | Delete trade |
| `/api/trades/[id]/duplicate` | `POST` | Clone trade (resets to open status) |
| `/api/accounts` | `GET` | List all accounts |
| `/api/accounts` | `POST` | Create account |
| `/api/accounts/[id]` | `PATCH` | Update account |
| `/api/accounts/[id]` | `DELETE` | Delete account + cascade trades |
| `/api/coach` | `POST` | Generate AI coaching report (DeepSeek LLM) |
| `/api/coach/chat` | `POST` | Multi-turn AI chat with trade context |
| `/api/export` | `GET` | Download trades as CSV file |
| `/api/market/news` | `GET` | Finnhub financial news (15-min cache) |
| `/api/market/calendar` | `GET` | ForexFactory economic calendar (1-hr cache) |
| `/api/observations` | `GET` | List chart observations |
| `/api/observations` | `POST` | Create chart observation |
| `/api/observations/[id]` | `GET` | Get single observation |
| `/api/observations/[id]` | `PATCH` | Update observation |
| `/api/observations/[id]` | `DELETE` | Delete observation |
| `/api/observations/upload` | `POST` | Upload screenshot → Supabase Storage |
| `/api/routine` | `GET` | Get user routine (or default) |
| `/api/routine` | `PATCH` | Save/update routine (upsert) |
| `/api/stats` | `GET` | Account statistics summary |
| `/api/tags` | `GET` | List confluence tags |
| `/api/tags` | `POST` | Create confluence tag |
| `/api/tags` | `DELETE` | Delete confluence tag |
| `/auth/callback` | `GET` | OAuth PKCE exchange |

---

## 8. Component Library

### Layout
| Component | File | Description |
|---|---|---|
| `Sidebar` | `layout/Sidebar.tsx` | Desktop sidebar + mobile sheet menu. 10 nav items. Shows user name/email + logout. Theme toggle. |
| `ThemeToggle` | `layout/ThemeToggle.tsx` | Dark/light mode switcher (CSS class on `<html>`) |
| `QueryProvider` | `layout/QueryProvider.tsx` | TanStack Query root provider |

### Dashboard
| Component | File | Description |
|---|---|---|
| `EquityCurveChart` | `dashboard/EquityCurveChart.tsx` | Recharts AreaChart with account selector, % return display |
| `ResultDonutChart` | `dashboard/ResultDonutChart.tsx` | Wins/Losses/Breakeven donut with animated legend |
| `AccountCard` | `dashboard/AccountCard.tsx` | Per-account KPI card with goal progress bar |
| `TodaysTradesSection` | `dashboard/TodaysTradesSection.tsx` | Collapsible today's trades list |
| `SettingsClient` | `dashboard/SettingsClient.tsx` | Account management client-side mutations |

### Analytics
| Component | File | Description |
|---|---|---|
| `AnalyticsClient` | `analytics/AnalyticsClient.tsx` | Tabbed shell: Overview / Timing / Symbols / Risk |
| `analyticsCompute` | `analytics/analyticsCompute.ts` | Pure TS functions: 7 analytics computation engines |
| `PerformanceHeatmap` | `analytics/PerformanceHeatmap.tsx` | 7×15 day-hour heatmap grid with P&L intensity coloring |
| `DayOfWeekChart` | `analytics/DayOfWeekChart.tsx` | Mon–Fri avg P&L bar chart + per-day stat cards |
| `SessionBreakdown` | `analytics/SessionBreakdown.tsx` | NY/London/Asia/Sydney session bar chart |
| `HoldTimeHistogram` | `analytics/HoldTimeHistogram.tsx` | 7-bucket hold-time histogram (wins vs losses) |
| `StreakTracker` | `analytics/StreakTracker.tsx` | Current streak hero + best/worst streak records |
| `SymbolBreakdown` | `analytics/SymbolBreakdown.tsx` | Symbol table ranked by P&L with profit factor bars |
| `CommissionDrain` | `analytics/CommissionDrain.tsx` | Commission % of gross P&L with severity alert |

### Trades
| Component | File | Description |
|---|---|---|
| `TradesTable` | `trades/TradesTable.tsx` | TanStack Table with sorting, filtering, pagination |
| `TradeForm` | `trades/TradeForm.tsx` | Full trade entry/edit form with auto-compute |
| `TradeDrawer` | `trades/TradeDrawer.tsx` | Side drawer showing full trade details |
| `CalendarView` | `trades/CalendarView.tsx` | Month calendar grid with P&L per day |
| `DuplicateButton` | `trades/DuplicateButton.tsx` | Clone trade action button |

### Coach (AI)
| Component | File | Description |
|---|---|---|
| `CoachDashboard` | `coach/CoachDashboard.tsx` | Full AI report display: scores, strengths, weaknesses, patterns, action plan |
| `CoachChatBox` | `coach/CoachChatBox.tsx` | Multi-turn chat interface with trade-context-aware AI |

### Ideas (Chart Observations)
| Component | File | Description |
|---|---|---|
| `IdeasPage` | `observations/IdeasPage.tsx` | Main grid + filter bar |
| `ObservationDrawer` | `observations/ObservationDrawer.tsx` | Full observation viewer with screenshots |
| `ObservationForm` | `observations/ObservationForm.tsx` | Create/edit form with screenshot upload |

### Routine
| Component | File | Description |
|---|---|---|
| `RoutineDashboard` | `routine/RoutineDashboard.tsx` | Live phase tracker, collapsible phases, regimes, rules |
| `RoutineEditorDrawer` | `routine/RoutineEditorDrawer.tsx` | Full CRUD editor for routine structure |

### Market
| Component | File | Description |
|---|---|---|
| `NewsFeed` | `market/NewsFeed.tsx` | Filterable news cards from Finnhub |
| `EconomicCalendar` | `market/EconomicCalendar.tsx` | Weekly events with impact color coding |

### Settings
| Component | File | Description |
|---|---|---|
| `SettingsDashboard` | `settings/SettingsDashboard.tsx` | 6-tab settings panel |

### UI Primitives (shadcn/ui)
`badge` · `button` · `card` · `checkbox` · `command` · `dialog` · `drawer` · `dropdown-menu` · `input` · `input-group` · `label` · `popover` · `progress` · `select` · `separator` · `sheet` · `skeleton` · `table` · `tabs` · `textarea` · `tooltip`

---

## 9. AI Trading Mentor (Coach)

### Architecture

```
User clicks "Generate Report" (timeframe: today/week/all)
    ↓
POST /api/coach { timeframe, accounts }
    ↓
Server fetches: getTrades() + getObservations() [per-user, Supabase RLS]
    ↓
computeMetrics() → 15+ quantitative metrics calculated in TypeScript
    ↓
System prompt built: metrics + trade list + chart observations
    ↓
DeepSeek LLM (deepseek-reasoner model) called with structured JSON schema
    ↓
Response parsed → CoachReport typed object
    ↓
CoachDashboard renders: scores, strengths, weaknesses, patterns, action plan
```

### Report Structure (`CoachReport`)

| Section | Content |
|---|---|
| `mentorHeadline` | One-sentence character assessment |
| `summary` | 2–3 paragraph narrative analysis |
| `scores` | 8 categories (0–100): Overall, Discipline, Risk Mgmt, Trade Selection, Execution, Emotional Control, Consistency, Strategy Adherence |
| `scoreExplanations` | Per-category explanation text |
| `metrics` | Full `CoachMetricsSnapshot` — 15 numeric metrics |
| `strengths` | Array of `{ title, observation, evidence, impact }` |
| `weaknesses` | Array of `{ title, flaw, evidence, estimatedPnlLeak }` |
| `patterns` | Array of behavioral patterns with category + recommendation |
| `actionPlan` | 5 prioritized actions with data support + target metric |
| `goldenHabit` | The #1 habit to focus on this week |

### Metrics Computed for AI Context
`winRate` · `netPnl` · `grossPnl` · `totalCommission` · `avgWin` · `avgLoss` · `profitFactor` · `expectancy` · `avgRiskRewardRatio` · `avgAmountRisked` · `avgRoiPercent` · `largestWinner` · `largestLoser` · `avgHoldingMinutes` · `bestDayOfWeek` · `worstDayOfWeek` · `bestSession` · `totalLeakPnl`

### AI Chat (`/api/coach/chat`)

Interactive multi-turn conversation. Each request:
1. Fetches fresh trade + observation data from Supabase (per-user scoped)
2. Injects full metrics context into system prompt
3. Sends conversation history + new message to DeepSeek API
4. Streams back response to `CoachChatBox` component

---

## 10. Data Layer & Utilities

### `src/lib/db.ts` — Database Functions

```typescript
// Accounts
getAccounts(client?)          → Account[]
getAccount(id, client?)       → Account | undefined
createAccount(data, client?)  → Account
updateAccount(id, data, client?) → Account | null
deleteAccount(id, client?)    → boolean

// Trades
getTrades(accountId?, client?) → Trade[]
getTrade(id, client?)          → Trade | undefined
createTrade(data, client?)     → Trade    // auto-computes net_pnl
updateTrade(id, data, client?) → Trade | null  // recomputes net_pnl
deleteTrade(id, client?)       → boolean
duplicateTrade(id, client?)    → Trade | null

// Confluence Tags
getConfluenceTags(client?)          → ConfluenceTag[]
createConfluenceTag(data, client?)  → ConfluenceTag
updateConfluenceTag(id, data, client?) → ConfluenceTag | null
deleteConfluenceTag(id, client?)    → boolean

// Computed Stats
getAccountStats(accountId?, accounts?, trades?, client?) → AccountStats[]
getEquityCurve(accountId?, accounts?, trades?, client?)  → EquityPoint[]

// Routine
getRoutine(client?)               → RoutineData
updateRoutine(data, client?)      → RoutineData

// Chart Observations
getObservations(client?)               → ChartObservation[]
getObservation(id, client?)           → ChartObservation | undefined
createObservation(data, client?)      → ChartObservation
updateObservation(id, data, client?)  → ChartObservation | null
deleteObservation(id, client?)        → boolean
```

**Pattern:** All functions accept an optional `SupabaseClient` parameter. When passed (from server components/API routes), they use that authenticated client for per-user RLS scoping. When omitted, they create their own server client.

**Timeout protection:** All Supabase queries wrapped in `withTimeout(promise, 3000ms)` to prevent hanging requests.

### `src/lib/utils.ts` — Calculation Helpers

```typescript
// P&L Computation
calculateGrossPnl({ entryPrice, exitPrice, quantity, direction, instrumentType })
  → number | null   // accounts for long/short, multiplier

calculateAmountRisked({ entryPrice, quantity, instrumentType })
  → number | null   // max capital at risk

calculatePercentRisk({ entryPrice, exitPrice, quantity, commission, direction, instrumentType })
  → number | null   // return on capital risked

calculateRoiPercent({ netPnl, amountRisked })
  → number | null   // net_pnl / amount_risked × 100

// Trade Filtering
isEvaluatedTrade(trade)
  → boolean   // true if trade has net_pnl, exit_price, closed_at, or non-open status

// Formatting
formatCurrency(value, showSign?)   → string  // $1,234.56
formatPercent(value, showSign?)    → string  // 12.34%
formatDate(dateStr)                → string  // Aug 7, 2026
formatDateTime(dateStr)            → string  // Aug 7, 2026 9:30:00 AM
formatTradeDuration(opened, closed) → string // 15 minutes

// Label Helpers
getResultLabel(result)   → 'Win' | 'Loss' | 'Breakeven'
getStatusLabel(status)   → 'Open' | 'Closed T/P' | 'Closed S/L' | 'Manual'
getDirectionLabel(dir)   → 'Call Long' | 'Call Short' | 'Put Long' | 'Put Short'
getSessionLabel(session) → 'New York' | 'London' | 'Asia' | 'Sydney'
suggestResult(netPnl)    → TradeResult  // auto-suggests from P&L sign
```

---

## 11. Analytics Engine

### `src/components/analytics/analyticsCompute.ts`

Pure TypeScript computation module — no React, no side effects. Safe to call from server components.

**Input:** `Trade[]` (all closed/evaluated trades)  
**Output:** `AnalyticsData` containing 7 computed datasets:

| Dataset | Algorithm | Output |
|---|---|---|
| `dayOfWeek` | Groups trades by `getDay()`, computes avg P&L, win rate, trade count per weekday | `DayOfWeekStat[]` (Mon–Fri) |
| `sessions` | Groups by `trade.session`, same metrics | `SessionStat[]` |
| `heatmap` | Groups by `day:hour` key from close timestamp | `HeatmapCell[]` with avg P&L and trade count |
| `holdTime` | Computes `closed_at - opened_at` in ms, buckets into 7 ranges (<5m … >1d) | `HoldTimeBucket[]` with wins/losses |
| `streaks` | Linear scan of time-sorted trades, tracks consecutive win/loss runs | `StreakData` with current, longest win/loss streaks |
| `symbols` | Groups by `symbol.toUpperCase()`, computes profit factor (gross wins ÷ gross losses) | `SymbolStat[]` |
| `commission` | Totals commission vs gross P&L, weekly breakdown | `CommissionData` |

---

## 12. User Workflow

### Daily Trading Workflow

```
Pre-Market (6:00–9:30 AM ET)
├── Open /routine → check current phase highlight
├── Review SPY levels, economic calendar (/market)
├── Review news feed for catalysts
└── Set watchlist for the session

During Market (9:30 AM–4:00 PM ET)
├── Execute trades
├── Log each trade in /trades/new
│   ├── Symbol + contract
│   ├── Entry/exit prices → auto-computes P&L
│   ├── Confluences tags
│   └── Session + notes
└── Log chart ideas/missed setups in /ideas

Post-Market (After 4:00 PM ET)
├── Review /dashboard → today's P&L summary
├── Check /analytics → patterns, session performance
├── Generate AI Coach report (/coach)
│   ├── Review scores + weaknesses
│   └── Chat with AI for specific questions
└── Update /routine if new rules/adjustments needed
```

### Trade Lifecycle

```
Create Trade (status: 'open')
    ↓
Trade executes
    ↓
Update Trade: add exit_price, closed_at
    ↓
net_pnl = gross_pnl - commission (auto-computed)
result = 'win' | 'loss' | 'breakeven' (auto-suggested)
status = 'closed_tp' | 'closed_sl' | 'closed_manual'
    ↓
Trade appears in:
  - Dashboard (today's P&L)
  - Equity Curve (chronological balance)
  - Analytics (all computed breakdowns)
  - AI Coach context (next report includes this trade)
```

---

## 13. Security Model

### Row Level Security (Supabase RLS)

Every table has RLS enabled. All policies enforce `auth.uid() = user_id`:

```sql
-- Example: trades table
CREATE POLICY "Users can only see their own trades"
  ON trades FOR ALL
  USING (auth.uid() = user_id);
```

### API Route Protection

Two-layer auth on every protected API route:

1. **Middleware layer** (`src/middleware.ts`) — verifies Supabase session cookie on every request before it reaches the route handler. Returns 401 for API routes or redirects for page routes.

2. **Route handler layer** — `getAuthenticatedUserId()` called explicitly in sensitive routes. Even if middleware fails, the route independently verifies auth.

### Client Isolation

All `db.ts` functions that accept a `SupabaseClient` parameter use the authenticated client scoped to the current user's session. This ensures queries automatically filter to the authenticated user via RLS — no manual `WHERE user_id = ?` required.

### Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon/public key (RLS enforced)
DEEPSEEK_API_KEY=               # DeepSeek API key for AI Coach
FINNHUB_API_KEY=                # Finnhub for financial news
```

---

## 14. Feature Roadmap

> Planned features in priority order (see `implementation_plan.md`)

### Tier 1 — In Progress / Up Next

| Sprint | Feature | Status |
|---|---|---|
| ✅ S1 | Performance Analytics page (`/analytics`) | **Done** |
| 🔄 S2 | Calendar upgrade (P&L heatmap coloring, metric toggle, day drawer) | Next |
| 🔄 S3 | **Playbooks & Setup System** — named strategies, trade tagging, setup comparison | Planned |

### Tier 2 — Planned

| Sprint | Feature | DB Changes |
|---|---|---|
| S4 | Psychology Tracking — emotional state, confidence, rule adherence on trade form | ALTER `trades` + new columns |
| S5 | Risk Management Dashboard — max drawdown tracker, daily loss limit monitor | No DB changes |
| S6 | AI Coach Proactive Alerts + Weekly Reports archive | New `coach_reports` table |

### Tier 3 — Future

| Sprint | Feature |
|---|---|
| S7 | CSV Import (Thinkorswim, IBKR, Robinhood, Tastytrade format parsers) |
| S8 | Goals & Milestones system with celebration animations |
| Future | Mentor/Share mode — read-only shareable journal link |
| Future | PWA mobile app (service worker already scaffolded in `sw.js/route.ts`) |

---

## File Count Summary

| Category | Files | Approx. Lines |
|---|---|---|
| App pages (routes) | 18 | ~3,200 |
| API routes | 16 | ~1,800 |
| Components | 46 | ~9,500 |
| Library / utils | 8 | ~1,200 |
| **Total** | **88** | **~15,700** |

---

*Generated from full codebase audit on August 7, 2026.*
