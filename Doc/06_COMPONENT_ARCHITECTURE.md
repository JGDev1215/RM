# 06 — Component Architecture

## Recommended Stack
Use the existing project stack if already present.

If starting fresh, use:

```txt
React
TypeScript preferred
CSS modules or plain CSS
Local storage
No backend required for v1
```

---

## Folder Structure

```txt
src/
  app/
    App.tsx
    routes.tsx
  components/
    AppShell.tsx
    BottomNav.tsx
    Card.tsx
    StatusCard.tsx
    MetricCard.tsx
    ProgressBar.tsx
    PillBadge.tsx
    MoneyValue.tsx
    NumberInput.tsx
    SegmentedControl.tsx
  screens/
    DashboardScreen.tsx
    RiskCalculatorScreen.tsx
    TradeLoggerScreen.tsx
    DynamicRiskEngineScreen.tsx
    PayoutTrackerScreen.tsx
    RestartTrackerScreen.tsx
    SettingsScreen.tsx
  logic/
    riskEngine.ts
    contractSizing.ts
    payoutLogic.ts
    drawdownLogic.ts
    stats.ts
    validation.ts
  storage/
    storageKeys.ts
    localStorage.ts
  data/
    defaults.ts
    types.ts
  styles/
    tokens.css
    global.css
```

---

## Core Components

### AppShell
Responsibility:

```txt
Provides mobile app frame
Renders active screen
Renders bottom navigation
```

### BottomNav
Items:

```txt
Dashboard
Calculator
Trades
Payouts
Settings
```

### Card
Generic card wrapper.

Props:

```ts
type CardProps = {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'amber' | 'red' | 'blue' | 'grey';
};
```

### StatusCard
Used for large dashboard decision.

Props:

```ts
type StatusCardProps = {
  status: string;
  reason: string;
  variant: 'green' | 'amber' | 'red' | 'blue' | 'grey';
};
```

### MetricCard
Used for money/risk/progress metrics.

Props:

```ts
type MetricCardProps = {
  label: string;
  value: string;
  subvalue?: string;
  progress?: number;
  footer?: string;
};
```

### ProgressBar
Props:

```ts
type ProgressBarProps = {
  value: number; // 0 to 1
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'grey';
};
```

### PillBadge
Props:

```ts
type PillBadgeProps = {
  label: string;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'grey';
};
```

---

## Logic Modules

### `riskEngine.ts`
Must export:

```ts
calculateRiskMode
calculateRecommendedRisk
calculateTradeApproval
buildRiskReason
```

### `contractSizing.ts`
Must export:

```ts
calculateStopPoints
calculateRiskPerContract
calculateContractsAllowed
calculatePotentialLoss
```

### `drawdownLogic.ts`
Must export:

```ts
calculateDrawdownUsed
calculateDrawdownRemaining
isAccountBlown
```

### `payoutLogic.ts`
Must export:

```ts
calculateNetPayout
calculatePayoutStatus
isPayoutAvailable
```

### `stats.ts`
Must export:

```ts
calculateDailyStats
calculateWeeklyStats
calculateMonthlyStats
hasHighRTradeThisWeek
```

### `validation.ts`
Must export:

```ts
validateTradeSetup
validateAccountConfig
validateTradeLog
```

---

## State Flow

1. Load account config and logs from local storage.
2. Derive daily, weekly, monthly stats from logs.
3. Build risk context.
4. Run risk engine.
5. Render status and recommendations.
6. On trade log save, update trade log and recalculate all derived values.
7. Persist updated data.

---

## Implementation Rule
Do not calculate risk directly inside UI components.

UI components should call logic functions and render results.

Bad:

```tsx
const risk = monthlyPnl > 1000 ? 75 : 150;
```

Good:

```tsx
const riskMode = calculateRiskMode(context);
const recommendedRisk = calculateRecommendedRisk(context);
```
