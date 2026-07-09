# 08 — Acceptance Tests

## Purpose
Codex agents must use this checklist to confirm the app is complete.

---

## Calculation Tests

### Test 1 — MNQ Contract Sizing

Input:

```txt
Instrument: MNQ
Entry: 22000
Stop: 21970
Stop size: 30 points
Risk allowance: $150
```

Expected:

```txt
Risk per contract = 30 × $2 = $60
Contracts allowed = floor(150 / 60) = 2
Potential loss = $120
```

---

### Test 2 — NQ Contract Sizing

Input:

```txt
Instrument: NQ
Entry: 22000
Stop: 21990
Stop size: 10 points
Risk allowance: $150
```

Expected:

```txt
Risk per contract = 10 × $20 = $200
Contracts allowed = 0
Trade approval = rejected because risk is too small for 1 NQ contract
```

---

### Test 3 — Daily Limit Rejection

Input:

```txt
Daily max loss: $300
Daily P&L: -$300
```

Expected:

```txt
Daily risk remaining = $0
Risk mode = Stop
Recommended risk = $0
Trade approval = REJECTED - DAILY LIMIT
```

---

### Test 4 — Drawdown Rejection

Input:

```txt
Max drawdown: $1,000
Drawdown used: $1,000
```

Expected:

```txt
Drawdown remaining = $0
Account phase = Restart Required
Risk mode = Stop
Trade approval = REJECTED - ACCOUNT BLOWN
```

---

### Test 5 — Reduced Risk after Monthly Progress

Input:

```txt
Monthly target: $4,000
Monthly P&L: $1,200
```

Expected:

```txt
Progress = 30%
Risk mode = Reduced
Recommended risk = $75
```

---

### Test 6 — Protection Mode after 50% Monthly Target

Input:

```txt
Monthly target: $4,000
Monthly P&L: $2,100
```

Expected:

```txt
Progress = 52.5%
Risk mode = Protection
Recommended risk = $50
```

---

### Test 7 — Minimum Risk after 75% Monthly Target

Input:

```txt
Monthly target: $4,000
Monthly P&L: $3,100
```

Expected:

```txt
Progress = 77.5%
Risk mode = Minimum
Recommended risk = $25
```

---

### Test 8 — Payout Available

Input:

```txt
Funded profit: $1,000
Max payout amount: $1,000
Profit split: 90%
```

Expected:

```txt
Payout status = Available
Gross payout = $1,000
Net payout = $900
Risk mode = Protection
```

---

### Test 9 — High-R Trade

Input:

```txt
Trade this week has R multiple = 2.1R
Monthly progress below 25%
No payout available
No drawdown danger
```

Expected:

```txt
Risk mode = Reduced
Recommended risk = $75
```

---

### Test 10 — Stop Size Zero

Input:

```txt
Entry = 22000
Stop = 22000
```

Expected:

```txt
Validation error
Trade approval = REJECTED - INVALID INPUT
```

---

## UI Tests

### Dashboard

- Status card appears at top.
- Account phase badge appears in header.
- Daily Risk card shows remaining risk.
- Drawdown card shows remaining drawdown.
- Recommended Risk card shows mode and dollar risk.
- Monthly Target card shows progress.
- Payout card shows payout count and next payout target.

### Risk Calculator

- Instrument selector works for MNQ and NQ.
- Numeric fields reject non-numeric input.
- Calculator shows stop points, risk per contract, contracts allowed, and approval decision.

### Trade Logger

- User can log a trade.
- R multiple is calculated.
- Recent trade card appears after save.
- Daily/weekly/monthly stats update after save.

### Dynamic Risk Engine

- Current mode card reflects actual risk mode.
- All mode descriptions are visible.

### Payout Tracker

- Shows progress to $1,000 gross payout.
- Shows $900 net payout at 90% split.
- Shows payout warning when payout is available.

### Restart Tracker

- Appears when account is blown.
- Shows restart checklist.
- Trade approval is blocked.

### Settings

- User can update account limits.
- User can update instrument values.
- User can select drawdown type.
- House Money Mode defaults to OFF.

---

## Final QA Checklist

```txt
[ ] App loads without errors
[ ] App is mobile-first
[ ] All 7 screens exist
[ ] Bottom navigation works
[ ] Settings persist in local storage
[ ] Trade logs persist in local storage
[ ] Risk engine is not hardcoded in UI components
[ ] MNQ sizing is correct
[ ] NQ sizing is correct
[ ] Daily limit blocks trades
[ ] Drawdown limit blocks trades
[ ] Payout mode reduces risk
[ ] Restart mode blocks trading
[ ] UI matches supplied HTML design direction
```
