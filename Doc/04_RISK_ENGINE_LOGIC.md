# 04 — Risk Engine Logic

## Core Principle
The risk engine must protect capital and payout eligibility.

```txt
When ahead, reduce risk.
When near payout, protect payout.
When near drawdown, stop trading.
When blown, restart.
```

---

## Risk Modes

```ts
type RiskMode = 'normal' | 'reduced' | 'protection' | 'minimum' | 'stop';
```

Default risk amounts:

```ts
const defaultRiskAmounts = {
  normal: 150,
  reduced: 75,
  protection: 50,
  minimum: 25,
  stop: 0
};
```

---

## Priority Order
Risk mode must be calculated in this order:

1. Account blown check
2. Daily loss check
3. Drawdown danger check
4. Payout pending / payout available check
5. Monthly target progress check
6. Weekly target progress check
7. High-R trade check
8. Default normal mode

Highest protection rule always wins.

---

## Context Object

```ts
type RiskContext = {
  accountPhase: 'evaluation' | 'funded' | 'payout_protection' | 'restart_required';
  accountSize: number;
  currentBalance: number;
  startingBalance: number;
  highWatermark: number;
  maxDrawdown: number;
  drawdownType: 'fixed' | 'trailing' | 'end_of_day';
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
  hasHighRTradeThisWeek: boolean;
  dayOfWeek: number;
  houseMoneyMode: boolean;
};
```

---

## Drawdown Calculations

### Fixed Drawdown

```ts
function calculateFixedDrawdownUsed(startingBalance, currentBalance) {
  return Math.max(0, startingBalance - currentBalance);
}
```

### Trailing Drawdown

```ts
function calculateTrailingDrawdownUsed(highWatermark, currentBalance) {
  return Math.max(0, highWatermark - currentBalance);
}
```

### Drawdown Remaining

```ts
function calculateDrawdownRemaining(maxDrawdown, drawdownUsed) {
  return maxDrawdown - drawdownUsed;
}
```

If drawdown remaining <= 0:

```txt
Account state = Restart Required
Risk mode = Stop
Recommended risk = $0
Trade approvals = rejected
```

---

## Daily Risk Remaining

```ts
function calculateDailyRiskRemaining(dailyMaxLoss, dailyPnl) {
  if (dailyPnl >= 0) return dailyMaxLoss;
  return Math.max(0, dailyMaxLoss - Math.abs(dailyPnl));
}
```

If House Money Mode is enabled later, implement separately and clearly.

Default is OFF.

---

## Monthly Progress

```ts
function calculateMonthlyTargetProgress(monthlyPnl, monthlyTarget) {
  if (monthlyTarget <= 0) return 0;
  return Math.max(0, monthlyPnl / monthlyTarget);
}
```

Progress brackets:

```txt
0% to 24% = Normal Mode
25% to 49% = Reduced Risk Mode
50% to 74% = Protection Mode
75% to 99% = Minimum Risk Mode
100%+ = Minimum or Stop Mode, default Minimum unless user disables trading
```

---

## Weekly Progress

```ts
function calculateWeeklyTargetProgress(weeklyPnl, weeklyTarget) {
  if (weeklyTarget <= 0) return 0;
  return Math.max(0, weeklyPnl / weeklyTarget);
}
```

Default weekly target:

```txt
$4,000 monthly target / 4 = $1,000 weekly target
```

Rules:

```txt
If weekly profit >= $1,000: Protection Mode
If weekly profit >= $500 before Wednesday: Reduced Risk Mode
If weekly profit >= $1,000 before Wednesday: Protection Mode
```

---

## High-R Trade Logic

A high-R trade means:

```txt
Any trade with R multiple >= 2.0R
```

If user has a 2R+ trade early in the week:

```txt
Risk Mode = Reduced Risk
Recommended Risk = $75
```

Reason:
The user has already captured a meaningful profit. The system should prevent giving it back.

---

## Payout Logic

### Payout Available

```ts
function isPayoutAvailable(fundedProfit, maxPayoutAmount) {
  return fundedProfit >= maxPayoutAmount;
}
```

Default max payout:

```txt
$1,000 gross
$900 net after 90% split
```

If payout is available:

```txt
Risk Mode = Protection Mode
Recommended Risk = $50 or lower
Status = Payout Available
```

If payout is pending:

```txt
Risk Mode = Minimum Risk Mode
Recommended Risk = $25
Status = Payout Pending
```

If payouts taken >= 5:

```txt
Status = Payout cycle complete
Risk Mode = Minimum Risk Mode
```

---

## Risk Mode Function

```ts
function calculateRiskMode(ctx: RiskContext): RiskMode {
  const drawdownRemaining = calculateDrawdownRemaining(
    ctx.maxDrawdown,
    calculateDrawdownUsed(ctx)
  );

  const dailyRiskRemaining = calculateDailyRiskRemaining(ctx.dailyMaxLoss, ctx.dailyPnl);
  const monthlyProgress = calculateMonthlyTargetProgress(ctx.monthlyPnl, ctx.monthlyTarget);
  const weeklyProgress = calculateWeeklyTargetProgress(ctx.weeklyPnl, ctx.weeklyTarget);
  const isBeforeWednesday = ctx.dayOfWeek === 1 || ctx.dayOfWeek === 2;

  if (ctx.accountPhase === 'restart_required') return 'stop';
  if (drawdownRemaining <= 0) return 'stop';
  if (dailyRiskRemaining <= 0) return 'stop';

  if (drawdownRemaining <= 150) return 'stop';
  if (drawdownRemaining <= 300) return 'minimum';

  if (ctx.payoutPending) return 'minimum';
  if (isPayoutAvailable(ctx.fundedProfit, 1000)) return 'protection';
  if (ctx.payoutsTaken >= 2 && monthlyProgress >= 0.5) return 'minimum';

  if (monthlyProgress >= 1) return 'minimum';
  if (monthlyProgress >= 0.75) return 'minimum';
  if (monthlyProgress >= 0.5) return 'protection';
  if (monthlyProgress >= 0.25) return 'reduced';

  if (weeklyProgress >= 1) return 'protection';
  if (isBeforeWednesday && weeklyProgress >= 0.5) return 'reduced';
  if (ctx.hasHighRTradeThisWeek) return 'reduced';

  return 'normal';
}
```

---

## Recommended Risk Function

```ts
function calculateRecommendedRisk(ctx: RiskContext): number {
  const mode = calculateRiskMode(ctx);

  const amounts = {
    normal: 150,
    reduced: 75,
    protection: 50,
    minimum: 25,
    stop: 0
  };

  const dailyRiskRemaining = calculateDailyRiskRemaining(ctx.dailyMaxLoss, ctx.dailyPnl);
  const drawdownRemaining = calculateDrawdownRemaining(ctx.maxDrawdown, calculateDrawdownUsed(ctx));

  return Math.max(0, Math.min(amounts[mode], dailyRiskRemaining, drawdownRemaining));
}
```

---

## Contract Sizing

```ts
function calculateStopPoints(entry: number, stop: number): number {
  return Math.abs(entry - stop);
}

function calculateRiskPerContract(stopPoints: number, pointValue: number): number {
  return stopPoints * pointValue;
}

function calculateContractsAllowed(maxRisk: number, riskPerContract: number): number {
  if (riskPerContract <= 0) return 0;
  return Math.floor(maxRisk / riskPerContract);
}
```

---

## Trade Approval

```ts
type TradeApproval =
  | 'APPROVED'
  | 'APPROVED_WITH_REDUCED_SIZE'
  | 'REJECTED_DAILY_LIMIT'
  | 'REJECTED_DRAWDOWN_LIMIT'
  | 'REJECTED_PAYOUT_PROTECTION'
  | 'REJECTED_ACCOUNT_BLOWN'
  | 'REJECTED_INVALID_INPUT';
```

Approval rules:

```txt
Reject if account blown.
Reject if daily risk remaining <= 0.
Reject if drawdown remaining <= 0.
Reject if entry or stop is invalid.
Reject if stop points <= 0.
Reject if contracts allowed < 1.
Approve with reduced size if risk mode is reduced, protection, or minimum.
Approve if risk mode is normal and contracts allowed >= 1.
```
