# TradeVault — Full Project Documentation

> **Last Updated:** August 7, 2026 (Post-12:43 AM Commits)  
> **Version:** 0.1.0  
> **Brand Name:** TradeVault  
> **Official Slogan:** *Vault Your Trades* | *"Master Your Edge. Vault Your Trades."*  
> **Environment:** Next.js 16 (Turbopack) · React 19 · TypeScript 5 · Supabase · TailwindCSS v4  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication System & Security Hardening](#4-authentication-system--security-hardening)
5. [Database Schema & RLS Policies (Supabase)](#5-database-schema--rls-policies-supabase)
6. [Application Pages](#6-application-pages)
7. [Component Library & Live Market Terminal](#7-component-library--live-market-terminal)
8. [AI Trading Mentor (Coach)](#8-ai-trading-mentor-coach)
9. [Legal & Regulatory Disclaimer Fencing](#9-legal--regulatory-disclaimer-fencing)
10. [Data Layer & Multi-Tenant Isolation](#10-data-layer--multi-tenant-isolation)
11. [Summary of Commits Since August 7, 2026 12:43 AM](#11-summary-of-commits-since-august-7-2026-1243-am)

---

## 1. Project Overview

**TradeVault** is an enterprise-grade, multi-tenant SaaS trading journal, risk management, and analytics platform built for options, stock, futures, and crypto traders. It allows traders to log trades, track equity performance, analyze behavioral leaks, receive AI-driven coaching, journal chart setups, monitor real-time market data, and maintain a disciplined pre-market routine.

### Core Value Propositions
- **Accurate P&L Tracking** — Commission-aware net P&L computation with options contract multiplier support (100x).
- **Dual-Intelligence AI Mentor** — Powered by DeepSeek LLM with live context of the user's isolated trade history, capable of analyzing personal win rates/leaks *and* answering general sector/options questions (e.g. Energy sector picks, IV crush, spreads).
- **Hardened SEC/FINRA Legal Disclaimer Fencing** — Comprehensive educational disclaimers embedded across AI system prompts, chat interfaces, report pages, and market data widgets.
- **FAANG-Grade Market Terminal & Live Ticker** — Real-time market quotes via Finnhub & Yahoo Finance, high-definition SVG chart with explicit numeric Y-axis price labels ($746.16, $684.20, $621.24, $558.28) and X-axis date/time labels (Aug 26, Oct 14, Dec 02, Jan 20, Feb 07), and active candle hover tracking.
- **Custom Watchlist Ticker Preferences** — In **Settings > Account & Security**, traders can add/remove custom ticker symbols (`NVDA`, `AAPL`, `TSLA`, `AMD`, `BTC-USD`) or select 1-click quick presets (`Indices`, `Tech Leaders`, `Options Movers`).
- **Performance Analytics Engine** — Heatmaps, streak tracking, hold-time distribution, session breakdowns, and symbol profit factor rankings.
- **Multi-Account Support** — Unified tracking for live brokerage accounts and backtest/paper accounts.
- **Chart Ideas Journal** — Screenshot uploads to Supabase Storage with mood tagging and hypothetical setup tracking.
- **Routine Builder** — Structured pre/post-market trading routines with live countdown timer and regime rules.
- **Strict Multi-Tenant Isolation & RLS** — Every user sees strictly their own data enforced at the database policy layer (`auth.uid()::text = user_id::text`) and server mutation layer (`.eq('user_id', user.id)`).

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.11 (Turbopack) | Full-stack React framework (App Router) |
| **React** | 19.2.4 | UI rendering |
| **TypeScript** | 5.x | Static type safety |
| **TailwindCSS** | 4.x | Utility-first responsive styling |
| **Recharts** | 3.10.0 | Equity curves, heatmaps, histograms, bar charts |
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

### Backend / Cloud Services
| Service | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, Auth, Row Level Security (RLS), Storage Buckets |
| **DeepSeek API** | LLM powering the AI Trading Mentor (`deepseek-chat`) |
| **Finnhub API** | Real-time market news feed & ticker quotes |
| **Yahoo Finance (Chart API)** | Historical market candles & timeframe chart data |
| **ForexFactory** (scraped) | Real-time economic calendar events |

---

## 3. Project Structure

```
trade-vault/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (app)/                    # Authenticated route group
│   │   │   ├── layout.tsx            # Full h-screen layout with adaptive Sidebar
│   │   │   ├── page.tsx              # Dashboard (/) with LiveMarketBar & KPI Cards
│   │   │   ├── analytics/page.tsx    # Performance Analytics (/analytics)
│   │   │   ├── trades/
│   │   │   │   ├── page.tsx          # Trades table (/trades)
│   │   │   │   ├── new/page.tsx      # Log new trade (/trades/new)
│   │   │   │   └── [id]/edit/page.tsx # Edit trade
│   │   │   ├── accounts/
│   │   │   │   ├── page.tsx          # Account list (/accounts)
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
│   │   │   │   ├── chat/             # POST: conversational AI chat
│   │   │   │   ├── preferences/      # GET/PATCH: coach preferences
│   │   │   │   ├── request-code/     # POST: passcode request email
│   │   │   │   └── verify-code/      # POST: access code verification
│   │   │   ├── export/               # GET: CSV download
│   │   │   ├── market/
│   │   │   │   ├── quotes/           # GET: Finnhub quotes API
│   │   │   │   ├── chart/            # GET: Yahoo Finance candle API
│   │   │   │   ├── news/             # GET: Finnhub news feed
│   │   │   │   └── calendar/         # GET: ForexFactory econ calendar
│   │   │   ├── observations/         # CRUD: chart ideas
│   │   │   │   ├── [id]/
│   │   │   │   └── upload/           # POST: screenshot upload to Supabase Storage
│   │   │   ├── routine/              # GET/PATCH: routine data
│   │   │   ├── stats/                # GET: account statistics
│   │   │   ├── tags/                 # GET, POST, DELETE: confluence tags
│   │   │   ├── user/
│   │   │   │   ├── profile/          # GET/PATCH: identity & watchlist preferences
│   │   │   │   ├── password/         # POST: in-app password update
│   │   │   │   └── security-logs/    # GET: security audit history
│   │   ├── auth/callback/route.ts    # OAuth callback + Open Redirect sanitizer
│   ├── components/
│   │   ├── analytics/                # Performance Analytics (8 files)
│   │   ├── coach/                    # AI Coach dashboard + CoachChatBox + CodeModal + Legal Disclaimer Strip
│   │   ├── dashboard/                # Dashboard widgets (5 files)
│   │   ├── feedback/                 # FeedbackModal component
│   │   ├── layout/                   # Sidebar, ThemeToggle, QueryProvider
│   │   ├── market/                   # LiveMarketBar, TickerDetailModal, EconomicCalendar, NewsFeed
│   │   ├── observations/             # Chart Ideas page + drawer + form
│   │   ├── routine/                  # RoutineDashboard, RoutineEditorDrawer
│   │   ├── settings/                 # SettingsDashboard (6 tabs, Watchlist controls)
│   │   ├── trades/                   # TradesTable, TradeForm, TradeDrawer, CalendarView
│   │   └── ui/                       # shadcn/ui base components (dialog, sheet, select, etc.)
│   ├── lib/
│   │   ├── auth.ts                   # getAuthenticatedUserId()
│   │   ├── db.ts                     # All Supabase CRUD functions with .eq('user_id', user.id)
│   │   ├── types.ts                  # All TypeScript interfaces
│   │   ├── utils.ts                  # P&L calculators, formatters, helpers
│   │   ├── routineData.ts            # Default routine data seed
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client
│   │       └── server.ts             # Server Supabase client (cookie-based)
│   └── middleware.ts                 # Auth guard + route protection
├── public/                           # Static assets, logo.png, logo_light.png, sw.js
├── scripts/
│   └── purge_orphaned_data.ts        # Database script purging legacy 'local' test rows
├── package.json                      # "name": "trade-vault"
├── next.config.ts                    # Enterprise HTTP Security Headers
└── .env.local                        # SUPABASE_URL, ANON_KEY, DEEPSEEK_API_KEY, FINNHUB_API_KEY, AI_BETA_ACCESS_CODE
```

---

## 4. Authentication System & Security Hardening

### Authentication Flow
- **Supabase Auth** supporting Email + Password authentication and Google OAuth PKCE flow.
- **Middleware Guard** (`src/middleware.ts`): Intercepts all incoming HTTP requests. Unauthenticated requests to protected pages are redirected to `/login?next=<path>`, and unauthenticated API calls return `401 Unauthorized`.
- **Open Redirect Protection**: `/auth/callback/route.ts` runs `sanitizeRedirectPath()` to prevent open redirect vulnerabilities.

### Security Audit Hardening
1. **Elimination of Unauthenticated Fallback IDs**: Updated database insertion functions (`createTrade`, `createAccount`, `createObservation`, `createConfluenceTag`) in `src/lib/db.ts` to strictly enforce `if (!user) throw new Error('Unauthenticated')`. Prevents inserting rows with fallback `'local'` or unverified user IDs.
2. **Explicit Server Client Cookie Scoping**: All API routes (`/api/export`, `/api/stats`, `/api/routine`, `/api/tags`) instantiate `createSupabaseServerClient()` and explicitly pass cookie-authenticated server client instances down to database helpers.
3. **Database Orphan Cleanup Script**: Executed `scripts/purge_orphaned_data.ts` to verify and purge any legacy test data saved under `user_id = 'local'`.
4. **Access Code Protection**: Removed hardcoded fallback credentials (`'SPYLONG2026$p'`) from all API endpoints (`/api/coach`, `/api/coach/chat`, `/api/coach/verify-code`). Verification now strictly checks `process.env.AI_BETA_ACCESS_CODE`.
5. **Disabled Debug Endpoints**: Deactivated `/api/observations/debug` (returns 404).
6. **Enterprise HTTP Security Headers**: Configured in `next.config.ts`:
   - `X-Frame-Options: DENY` (Anti-Clickjacking)
   - `X-Content-Type-Options: nosniff` (Anti-MIME Sniffing)
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 5. Database Schema & RLS Policies (Supabase)

All tables have **Row Level Security (RLS)** enabled with policies enforcing `auth.uid()::text = user_id::text`.

### Table: `user_profiles`
```sql
CREATE TABLE user_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name           text,
  trader_handle       text,
  avatar_url          text,
  preferred_timezone  text DEFAULT 'America/New_York',
  preferred_currency  text DEFAULT 'USD',
  theme_preference    text DEFAULT 'dark',
  preferred_tickers   text[] DEFAULT '{"SPY","QQQ","VIX","IWM"}',
  ai_access_disabled  boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
```

### Table: `accounts`
```sql
CREATE TABLE accounts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name             text NOT NULL,
  account_type     text NOT NULL,     -- 'live' | 'backtest'
  initial_balance  numeric DEFAULT 1000,
  goal             numeric DEFAULT 10000,
  created_at       timestamptz DEFAULT now()
);
```

### Table: `trades`
```sql
CREATE TABLE trades (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id      uuid REFERENCES accounts(id),
  symbol          text NOT NULL,          -- e.g. 'SPY', 'QQQ', 'NVDA'
  contract_label  text,                   -- e.g. 'SPY 480C 12/15'
  instrument_type text NOT NULL,          -- 'options' | 'stock' | 'futures' | 'crypto'
  direction       text,                   -- 'call_long' | 'call_short' | 'put_long' | 'put_short'
  opened_at       timestamptz NOT NULL,
  closed_at       timestamptz,
  timezone        text DEFAULT 'America/New_York',
  quantity        integer DEFAULT 1,
  entry_price     numeric,
  exit_price      numeric,
  gross_pnl       numeric DEFAULT 0,
  commission      numeric DEFAULT 0,
  net_pnl         numeric DEFAULT 0,      -- gross_pnl - commission (auto-computed)
  result          text,                   -- 'win' | 'loss' | 'breakeven'
  status          text DEFAULT 'open',    -- 'open' | 'closed_tp' | 'closed_sl' | 'closed_manual'
  session         text,                   -- 'new_york' | 'london' | 'asia' | 'sydney'
  percent_risk    numeric,
  amount_risked   numeric,                -- entry_price × multiplier × qty
  roi_percent     numeric,                -- net_pnl / amount_risked × 100
  confluences     text[] DEFAULT '{}',
  notes           text,
  screenshot_url  text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### Table: `chart_observations`
```sql
CREATE TABLE chart_observations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  observed_at        timestamptz NOT NULL,
  symbol             text NOT NULL,
  timeframe          text,
  title              text NOT NULL,
  body               text,
  screenshot_urls    text[] DEFAULT '{}',
  mood               text,                   -- 'confident' | 'uncertain' | 'regret' | 'neutral' | 'excited'
  tags               text[] DEFAULT '{}',
  would_have_result  text,                   -- 'profit' | 'loss' | 'unknown'
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);
```

---

## 6. Application Pages

1. **Dashboard (`/`)** — Real-time Market Ticker, KPI Cards (Balance, Net P&L, Win Rate, Return %), Equity Curve Chart, Win/Loss Donut Chart, Today's Trades list, and Accounts Overview.
2. **Trades (`/trades`)** — Data table with searching, filtering, sorting, pagination, multi-select bulk operations, and CSV export.
3. **Analytics (`/analytics`)** — Performance Analytics engine with Day-of-Week, Session, Heatmap, Hold-Time, Streaks, Symbol Rankings, and Commissions tabs.
4. **Ideas (`/ideas`)** — Chart setups journal with mood filters, multi-screenshot upload, setup tags, and hypothetical trade outcome tracking.
5. **Market (`/market`)** — Real-time Finnhub news feed and ForexFactory economic calendar with impact filters and Market Data Disclaimer strip.
6. **Routine (`/routine`)** — Interactive pre/post-market routine builder with live phase countdown timer and regime rules.
7. **AI Coach (`/coach`)** — DeepSeek AI scoring dashboard, weakness analysis, action plan, conversational AI mentor, and mandatory Legal Disclaimer Box.
8. **Calendar (`/calendar`)** — Monthly P&L calendar with daily net gains/losses and trade drawers.
9. **Accounts (`/accounts`)** — Manage live and backtest trading accounts with progress bars toward balance goals.
10. **Settings (`/settings`)** — Account & Security Center, Trader Identity, **Dashboard Watchlist Tickers Manager**, SPY Routine Defaults, Confluence Tag Manager, AI Coach Preferences, and Data Export/Deletion.

---

## 7. Component Library & Live Market Terminal

### Live Market Ticker & Terminal (`<LiveMarketBar />` & `<TickerDetailModal />`)
- **Real-Time Quotes**: Fetches quotes for custom preferred symbols via Finnhub & Yahoo Finance API.
- **Adaptive Theme Styling**: Works in Light Mode (`bg-white`) and Dark Mode (`dark:bg-[#0a0a0f]`).
- **Background Auto-Refresh**: Background 30-second polling runs silently without intrusive spinning icons.
- **Spacious Interactive Terminal Modal**:
  - Desktop 2-column terminal (`sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl`) scaling up to **1150px wide**, alongside a fluid phone view drawer.
  - **High-Definition SVG Price Chart**:
    - **Y-Axis Price Labels** on the right edge ($746.16, $684.20, $621.24, $558.28).
    - **X-Axis Date/Time Labels** on the bottom edge (Aug 26, Oct 14, Dec 02, Jan 20, Feb 07).
    - **Interactive Candle Tracking**: Hovering over the curve displays the exact timestamp and price close, falling back to the latest close price when not hovered.
  - **Price Extremes**: Day's Range and 52-Week Range sliders.
  - **Key Market Stats**: Open Price, Prev Close, YTD Return %, Volume.
  - **Actions**: Direct 1-click `Log Trade` and `Add Observation` CTAs.

### Custom Watchlist Management (Settings)
- Allows traders to add custom symbols (`NVDA`, `AAPL`, `TSLA`, `AMD`, `BTC-USD`) or select 1-click quick presets (*Indices*, *Tech Leaders*, *Options Movers*).
- Persisted to Supabase profile (`user_profiles.preferred_tickers`).

---

## 8. AI Trading Mentor (Coach)

### Dual-Intelligence System Prompt
The AI Coach (`/api/coach/chat`) operates on a dual-intelligence model:
1. **Personal Journal Performance Analysis**: References the trader's isolated win rate, PnL, average win vs average loss, largest drawdown, and recent trade logs.
2. **General Market & Sector Guidance**: Answers questions about market sectors (e.g. Energy sector picks like XOM, CVX, XLE), stock recommendations, options mechanics (e.g. credit spreads, straddles, IV crush, delta/gamma risk).

---

## 9. Legal & Regulatory Disclaimer Fencing

To mitigate legal exposure under SEC / FINRA / FTC rules regarding automated AI trading commentary, TradeVault implements **multi-layered disclaimer fencing**:

1. **AI LLM System Prompts**: Explicitly instruct DeepSeek LLM that it is an **educational trade journaling reflection tool**, not a registered investment advisor, and MUST NEVER provide buy/sell recommendations or guarantee profits.
2. **AI Chat Interface**: Embedded `ShieldAlert` Legal Disclaimer Strip directly above the chat input box.
3. **AI Coach Dashboard**: Permanent, styled Regulatory Risk Disclaimer Box rendered at the bottom of the AI Coach report.
4. **Market Overview Page**: Dedicated Market Data Disclaimer strip at the bottom of `/market`.

---

## 10. Data Layer & Multi-Tenant Isolation

- **Authentication Guard**: All API routes check Supabase session token via cookie middleware + explicit `getAuthenticatedUserId()` server check.
- **Unauthenticated Insert Rejection**: Creation functions (`createTrade`, `createAccount`, `createObservation`, `createConfluenceTag`) throw `Unauthenticated` errors if `user` is null.
- **Strict Data Isolation**: Queries and mutations explicitly include `.eq('user_id', user.id)` alongside Supabase RLS.
- **HTTP Security Headers**: Enforced via `next.config.ts`.
- **Passcode Protection**: AI Coach feature protected by `process.env.AI_BETA_ACCESS_CODE`.

---

## 11. Summary of Commits Since August 7, 2026 12:43 AM

| Commit | Author | Description |
|---|---|---|
| `fbff845` | Parth Patel | **legal:** Add comprehensive SEC/FINRA regulatory risk disclaimers across AI Coach API, UI, and Market pages. |
| `5b8d6f7` | Parth Patel | **docs:** Update TradeVault project documentation covering all features since Aug 7, 2026 12:43 AM. |
| `fb9037e` | Parth Patel | **brand:** Update branding to TradeVault with official slogan *"Vault Your Trades"*. |
| `85ab3f7` | Parth Patel | **brand:** Rebrand app with theme-adaptive Light Mode (`logo_light.png`) & Dark Mode (`logo.png`) 3D glassmorphic emblems. |
| `5deac6c` | Parth Patel | **feat:** FAANG-grade Live Market Ticker & Interactive Terminal (`<TickerDetailModal />`), complete security hardening, custom watchlist ticker settings, and mobile responsive polish. |
| `2fb0499` | Parth Patel | **feat:** AI Coach token protection, access code verification modal, passcode request system, Terms/Privacy legal pages, and strict user data isolation. |
| `e5ebd38` | Parth Patel | **fix:** Strict `user_id` data isolation for multi-tenant privacy & empty state UI graphics. |
| `2957490` | Parth Patel | **feat:** FAANG-grade Analytics Engine, AI Coach DeepSeek configuration, and Account & Security Center. |

---

*Generated from comprehensive codebase audit on August 7, 2026.*
