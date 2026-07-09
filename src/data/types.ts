export type AccountPhase = 'evaluation' | 'funded' | 'payout_protection' | 'restart_required';
export type DrawdownType = 'fixed' | 'trailing' | 'end_of_day';
export type InstrumentSymbol = 'MNQ' | 'NQ' | string;
export type Direction = 'long' | 'short';
export type RiskMode = 'normal' | 'reduced' | 'protection' | 'minimum' | 'stop';
export type TradeApproval =
  | 'APPROVED'
  | 'APPROVED WITH REDUCED SIZE'
  | 'REJECTED - DAILY LIMIT'
  | 'REJECTED - DRAWDOWN LIMIT'
  | 'REJECTED - PAYOUT PROTECTION'
  | 'REJECTED - ACCOUNT BLOWN'
  | 'REJECTED - INVALID INPUT';

export type InstrumentConfig = {
  symbol: InstrumentSymbol;
  pointValue: number;
  tickSize: number;
  tickValue: number;
};

export type AccountConfig = {
  accountSize: number;
  evaluationTarget: number;
  maxDrawdown: number;
  dailyMaxLoss: number;
  monthlyTarget: number;
  weeklyTarget: number;
  maxPayouts: number;
  maxPayoutAmount: number;
  profitSplit: number;
  houseMoneyMode: boolean;
  drawdownType: DrawdownType;
  instruments: Record<string, InstrumentConfig>;
};

export type AccountState = {
  phase: AccountPhase;
  startingBalance: number;
  currentBalance: number;
  highWatermark: number;
  dailyStartingBalance: number;
  lastUpdated: string;
  payoutPending: boolean;
  fundedAt?: string;
  fundedBaseline?: number;
};

export type TradeLog = {
  id: string;
  date: string;
  instrument: InstrumentSymbol;
  direction: Direction;
  entry: number;
  stop: number;
  exit: number;
  contracts: number;
  plannedRisk: number;
  actualPnl: number;
  rMultiple: number;
  result: 'win' | 'loss' | 'breakeven';
  notes?: string;
  createdAt: string;
};

export type PayoutLog = {
  id: string;
  requestedAt: string;
  grossAmount: number;
  netAmount: number;
  status: 'available' | 'requested' | 'paid' | 'cancelled';
};

export type DailyStats = {
  date: string;
  pnl: number;
  lossUsed: number;
  riskRemaining: number;
  trades: TradeLog[];
};

export type WeeklyStats = {
  weekStart: string;
  weekEnd: string;
  pnl: number;
  targetProgress: number;
  hasHighRTrade: boolean;
};

export type MonthlyStats = {
  month: string;
  pnl: number;
  targetProgress: number;
  payoutsTaken: number;
};

export type RiskContext = {
  accountPhase: AccountPhase;
  accountSize: number;
  currentBalance: number;
  startingBalance: number;
  highWatermark: number;
  maxDrawdown: number;
  drawdownType: DrawdownType;
  dailyMaxLoss: number;
  dailyPnl: number;
  weeklyPnl: number;
  monthlyPnl: number;
  monthlyTarget: number;
  weeklyTarget: number;
  fundedProfit: number;
  payoutPending: boolean;
  payoutsTaken: number;
  maxPayouts: number;
  maxPayoutAmount: number;
  hasHighRTradeThisWeek: boolean;
  dayOfWeek: number;
  houseMoneyMode: boolean;
};

export type TradeSetup = {
  instrument: InstrumentSymbol;
  direction: Direction;
  entry: number;
  stop: number;
};
