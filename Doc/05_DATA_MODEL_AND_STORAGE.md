# 05 — Data Model and Storage

## Storage Requirement
Use browser local storage first.

The app must persist:

```txt
Account settings
Trade logs
Payout logs
Risk state
Current account phase
Daily / weekly / monthly summaries
```

Use React state for UI and local storage for persistence.

---

## Local Storage Keys

```ts
const STORAGE_KEYS = {
  accountConfig: 'riskguard.accountConfig',
  trades: 'riskguard.trades',
  payouts: 'riskguard.payouts',
  accountState: 'riskguard.accountState'
};
```

---

## AccountConfig

```ts
type AccountConfig = {
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
  drawdownType: 'fixed' | 'trailing' | 'end_of_day';
  instruments: Record<string, InstrumentConfig>;
};
```

---

## InstrumentConfig

```ts
type InstrumentConfig = {
  symbol: 'MNQ' | 'NQ' | string;
  pointValue: number;
  tickSize: number;
  tickValue: number;
};
```

Default:

```ts
const instruments = {
  MNQ: {
    symbol: 'MNQ',
    pointValue: 2,
    tickSize: 0.25,
    tickValue: 0.5
  },
  NQ: {
    symbol: 'NQ',
    pointValue: 20,
    tickSize: 0.25,
    tickValue: 5
  }
};
```

---

## AccountState

```ts
type AccountState = {
  phase: 'evaluation' | 'funded' | 'payout_protection' | 'restart_required';
  startingBalance: number;
  currentBalance: number;
  highWatermark: number;
  dailyStartingBalance: number;
  lastUpdated: string;
};
```

---

## TradeLog

```ts
type TradeLog = {
  id: string;
  date: string;
  instrument: 'MNQ' | 'NQ' | string;
  direction: 'long' | 'short';
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
```

---

## PayoutLog

```ts
type PayoutLog = {
  id: string;
  requestedAt: string;
  grossAmount: number;
  netAmount: number;
  status: 'available' | 'requested' | 'paid' | 'cancelled';
};
```

---

## Derived Stats
Do not manually store derived stats unless necessary. Prefer calculating from trade logs.

### DailyStats

```ts
type DailyStats = {
  date: string;
  pnl: number;
  lossUsed: number;
  riskRemaining: number;
  trades: TradeLog[];
};
```

### WeeklyStats

```ts
type WeeklyStats = {
  weekStart: string;
  weekEnd: string;
  pnl: number;
  targetProgress: number;
  hasHighRTrade: boolean;
};
```

### MonthlyStats

```ts
type MonthlyStats = {
  month: string;
  pnl: number;
  targetProgress: number;
  payoutsTaken: number;
};
```

---

## Utility Functions

```ts
function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
```

---

## Reset Behaviour

Settings screen should allow:

```txt
Reset app data
Reset account state only
Export trade logs as JSON or CSV later
```

For first version, export can be deferred. Do not block the main build on export.
