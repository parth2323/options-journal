export type AccountType = 'backtest' | 'live';
export type InstrumentType = 'options' | 'stock' | 'futures' | 'crypto';
export type Direction = 'call_long' | 'call_short' | 'put_long' | 'put_short';
export type TradeResult = 'win' | 'loss' | 'breakeven';
export type TradeStatus = 'open' | 'closed_tp' | 'closed_sl' | 'closed_manual';
export type Session = 'new_york' | 'london' | 'asia' | 'sydney';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  account_type: AccountType;
  initial_balance: number;
  goal: number;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  account_id: string;
  symbol: string;
  contract_label?: string;
  instrument_type: InstrumentType;
  direction?: Direction;
  opened_at: string;
  closed_at?: string;
  timezone: string;
  quantity: number;
  entry_price?: number;
  exit_price?: number;
  gross_pnl: number;
  commission: number;
  net_pnl: number; // computed: gross_pnl - commission
  result: TradeResult;
  status: TradeStatus;
  session?: Session;
  percent_risk?: number;
  amount_risked?: number;   // entry_price × multiplier × qty (max capital at risk)
  roi_percent?: number;     // net_pnl / amount_risked × 100
  confluences: string[];
  notes?: string;
  screenshot_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ConfluenceTag {
  id: string;
  user_id: string;
  label: string;
  color: string;
}

export interface Database {
  accounts: Account[];
  trades: Trade[];
  confluence_tags: ConfluenceTag[];
  routine?: RoutineData;
}

// Computed stats for each account
export interface AccountStats {
  account_id: string;
  name: string;
  account_type: AccountType;
  initial_balance: number;
  goal: number;
  current_balance: number;
  total_net_pnl: number;
  total_trades: number;
  total_wins: number;
  win_rate: number;
}

// For forms
export type TradeFormData = Omit<Trade, 'id' | 'user_id' | 'net_pnl' | 'created_at' | 'updated_at'>;
export type AccountFormData = Omit<Account, 'id' | 'user_id' | 'created_at'>;

// ── AI Coach & Feedback Types ────────────────────────────────────────────────
export type TimeframeOption = 'today' | 'week' | 'all';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CoachScores {
  overall: number;
  discipline: number;
  riskManagement: number;
  tradeSelection: number;
  executionQuality: number;
  emotionalControl: number;
  consistency: number;
  strategyAdherence: number;
}

export interface CoachStrength {
  title: string;
  observation: string;
  evidence: string;
  impact: string;
}

export interface CoachWeakness {
  title: string;
  flaw: string;
  evidence: string;
  estimatedPnlLeak: number;
}

export interface CoachPattern {
  pattern: string;
  category: 'day_of_week' | 'time_of_day' | 'confluence' | 'holding_time' | 'sizing' | 'general';
  statisticalProof: string;
  recommendation: string;
}

export interface CoachActionItem {
  priority: number;
  action: string;
  rationale: string;
  dataSupport: string;
  targetMetric: string;
}

export interface CoachGoldenHabit {
  habit: string;
  whyItMatters: string;
  projectedImpact: string;
}

export interface CoachMetricsSnapshot {
  totalTrades: number;
  winRate: number;
  netPnl: number;
  grossPnl: number;
  totalCommission: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  avgRiskRewardRatio: number;
  avgAmountRisked: number;
  avgRoiPercent: number;
  largestWinner: number;
  largestLoser: number;
  avgHoldingMinutes: number;
  bestDayOfWeek: string;
  worstDayOfWeek: string;
  bestSession: string;
  totalLeakPnl: number;
}

export interface CoachReport {
  timeframe: TimeframeOption;
  generatedAt: string;
  summary: string;
  mentorHeadline: string;
  scores: CoachScores;
  scoreExplanations: Record<keyof CoachScores, string>;
  metrics: CoachMetricsSnapshot;
  strengths: CoachStrength[];
  weaknesses: CoachWeakness[];
  patterns: CoachPattern[];
  actionPlan: CoachActionItem[];
  goldenHabit: CoachGoldenHabit;
}

// ── SPY Trader Routine Types ──────────────────────────────────────────────────
export interface RoutinePhaseItem {
  time?: string;
  tool?: string;
  action: string;
}

export interface RoutinePhase {
  id: string;
  phaseNumber: number;
  title: string;
  timeWindow: string;
  startMinutes: number; // e.g. 6:30 AM = 390
  endMinutes: number;   // e.g. 8:00 AM = 480
  description?: string;
  items: RoutinePhaseItem[];
}

export interface RoutineRegime {
  id: string;
  regime: string;
  condition: string;
  action: string;
}

export interface RoutineRule {
  id: number;
  title: string;
  text: string;
}

export interface RoutineData {
  id: string;
  title: string;
  subtitle: string;
  timezone: string;
  phases: RoutinePhase[];
  regimes: RoutineRegime[];
  rules: RoutineRule[];
  resetCommitment: string;
  updated_at: string;
}

// ── Chart Observations / Trade Ideas Journal ──────────────────────────────────

export type ObservationMood = 'confident' | 'uncertain' | 'regret' | 'neutral' | 'excited';
export type ObservationResult = 'profit' | 'loss' | 'unknown';

export interface ChartObservation {
  id: string;
  user_id: string;
  observed_at: string;            // ISO date string — when you spotted this on the chart
  symbol: string;                 // e.g. "SPY", "QQQ"
  timeframe?: string;             // e.g. "5m", "1h", "Daily"
  title: string;                  // short headline / what you saw
  body?: string;                  // longer markdown-friendly text
  screenshot_urls: string[];      // array of Supabase Storage public URLs
  mood?: ObservationMood;
  tags: string[];                 // e.g. ["missed setup", "supply zone"]
  would_have_result?: ObservationResult; // hypothetical outcome
  created_at: string;
  updated_at: string;
}

export type ObservationFormData = Omit<ChartObservation, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
