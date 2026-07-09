# 07 — Validation and Edge Cases

## Input Validation

### Prices

Entry and stop must be:

```txt
Required
Numeric
Greater than 0
Different from each other
```

Invalid example:

```txt
Entry = 21845.25
Stop = 21845.25
```

Reject because stop size is 0.

---

## Contract Validation

Contracts allowed must be at least 1 before approval.

If contracts allowed is 0:

```txt
Decision = REJECTED - INVALID INPUT or REJECTED - RISK TOO SMALL
Message = Stop is too wide for current risk allowance.
```

---

## Daily Loss Limit

If daily P&L is negative and absolute daily loss is >= $300:

```txt
Risk mode = Stop
Recommended risk = $0
Trade approval = REJECTED - DAILY LIMIT
```

If daily risk remaining is $60 and proposed trade risk is $80:

```txt
Trade approval = REJECTED - DAILY LIMIT
```

---

## Drawdown Limit

If drawdown remaining <= 0:

```txt
Account phase = Restart Required
Risk mode = Stop
Recommended risk = $0
Trade approval = REJECTED - ACCOUNT BLOWN
```

If drawdown remaining is $100:

```txt
Risk mode = Stop
Recommended risk = $0
```

If drawdown remaining is $250:

```txt
Risk mode = Minimum
Recommended risk cannot exceed $25
```

---

## Payout Protection

If funded profit >= $1,000:

```txt
Payout status = Available
Risk mode = Protection
Recommended risk = $50 or lower
```

If payout is pending:

```txt
Payout status = Pending
Risk mode = Minimum
Recommended risk = $25
```

If user attempts a trade that risks payout eligibility, warn clearly.

---

## Monthly Progress

If monthly P&L is:

```txt
$0 to $999 = Normal Mode
$1,000 to $1,999 = Reduced Risk
$2,000 to $2,999 = Protection Mode
$3,000 to $3,999 = Minimum Risk
$4,000+ = Minimum Risk or Stop recommendation
```

---

## Weekly Progress

If weekly P&L >= $1,000:

```txt
Risk mode = Protection
```

If weekly P&L >= $500 before Wednesday:

```txt
Risk mode = Reduced
```

---

## High-R Trade

If any trade this week has R multiple >= 2.0:

```txt
Risk mode = Reduced
```

This rule should not override stricter rules such as payout protection, minimum risk, or stop.

---

## House Money Mode
Default is OFF.

If OFF:

```txt
Daily risk does not increase because user is profitable on the day.
```

If ON later:

```txt
Only allow a clearly defined percentage of realised daily profit to be risked.
Must show warning.
Must never be default.
```

---

## Rounding

Use sensible rounding:

```txt
Money values: 2 decimals or 0 decimals for dashboard display
Points: 2 decimals
Contracts: integer floor only
Percentages: nearest whole number for UI
```

Never round contracts up.

---

## Safety Messages

Use direct warnings:

```txt
Daily loss limit reached. No more trades today.
Drawdown protection triggered. Stop trading.
Payout available. Reduce risk and protect eligibility.
Account blown. Restart required.
Stop is too wide for current risk allowance.
```
