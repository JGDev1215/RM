# 03 — Screen-by-Screen Specification

## Screen 1 — Dashboard

### Purpose
Show the trader their current account state and risk decision immediately.

### Required Sections

#### Header

```txt
App name: RiskGuard Trader
Account phase badge: Evaluation / Funded / Payout Protection / Restart Required
```

#### Large Status Card
Display one of:

```txt
TRADE ALLOWED
REDUCE SIZE
PROTECT PROFITS
STOP TRADING TODAY
ACCOUNT BLOWN / RESTART REQUIRED
```

Include a short reason.

Example:

```txt
Weekly target reached. Risk reduced to protect payout.
```

#### Daily Risk Card
Show:

```txt
Daily max loss: $300
Used today
Remaining today
Progress bar
```

#### Drawdown Protection Card
Show:

```txt
Max drawdown: $1,000
Drawdown used
Drawdown remaining
Progress bar
Warning if drawdown remaining is below $300
```

#### Recommended Risk Card
Show:

```txt
Risk mode
Recommended risk per trade
Short reason
```

Risk modes:

```txt
Normal
Reduced
Protection
Minimum
Stop
```

#### Monthly Target Card
Show:

```txt
Monthly target: $4,000
Current monthly profit
Percentage achieved
Progress bar
```

#### Payout Tracker Card
Show:

```txt
Payouts taken: 0 of 5
Remaining payouts
Next payout target: $1,000 gross
Net payout: $900
Status: Not ready / Available / Pending / Protected
```

---

## Screen 2 — Risk Calculator

### Purpose
Calculate allowed MNQ/NQ position size and reject trades that breach limits.

### Inputs

```txt
Instrument: MNQ / NQ
Direction: Long / Short
Entry price
Stop loss price
Account phase
Daily P&L
Weekly P&L
Monthly P&L
Current balance
Drawdown used or drawdown remaining
```

### Outputs

```txt
Stop size in points
Risk per contract
Recommended max risk
Contracts allowed
Potential loss
Daily risk remaining after trade
Drawdown remaining after trade
Trade approval decision
```

### CTA

```txt
Calculate Trade Size
```

### Decision Card
Display one of:

```txt
APPROVED
APPROVED WITH REDUCED SIZE
REJECTED - DAILY LIMIT
REJECTED - DRAWDOWN LIMIT
REJECTED - PAYOUT PROTECTION
REJECTED - ACCOUNT BLOWN
REJECTED - INVALID INPUT
```

---

## Screen 3 — Trade Logger

### Purpose
Record trade outcomes and update risk state.

### Form Fields

```txt
Date
Instrument
Direction
Entry
Stop
Exit
Contracts
Planned risk
Actual P&L
R multiple
Result: Win / Loss / Breakeven
Notes
```

### Auto-Calculate

```txt
R Multiple = Actual P&L / Planned Risk
Daily P&L
Weekly P&L
Monthly P&L
Drawdown used
Risk mode after trade
```

### Recent Trade Cards
Each card should show:

```txt
Instrument + direction
Actual P&L
R multiple
Risk mode after trade
```

Example:

```txt
MNQ Long
+$300
+2.0R
Risk mode after: Reduced Risk
```

---

## Screen 4 — Dynamic Risk Engine

### Purpose
Explain why the app is recommending a certain risk level.

### Top Card
Show:

```txt
Current Mode
Recommended Risk
Reason
```

### Mode Cards

#### Normal Mode

```txt
Risk: $150
Used when monthly target progress is below 25%.
```

#### Reduced Risk

```txt
Risk: $75
Used after strong early profit, weekly progress, or a 2R+ win.
```

#### Protection Mode

```txt
Risk: $50
Used near payout, payout pending, or above 50% monthly target.
```

#### Minimum Risk

```txt
Risk: $25
Used after 75% monthly target, 2 payouts achieved, or very low drawdown remaining.
```

#### Stop Mode

```txt
Risk: $0
Used when daily limit hit, drawdown breached, or account blown.
```

---

## Screen 5 — Payout Tracker

### Purpose
Track payout readiness and protect payout eligibility.

### Required Cards

#### Next Payout Card
Show:

```txt
Current funded profit
Target for next payout: $1,000 gross
Progress bar
Amount remaining to unlock payout
```

#### Payout Value Card
Show:

```txt
Gross payout available
Net payout after 90% split
Monthly payout goal: 2–3 payouts
```

#### Payout Count Card
Show:

```txt
Payouts taken: 0/5
Remaining payouts
Visual 5-dot progress indicator
```

#### Protection Warning

```txt
Once payout is available, reduce risk. Do not risk losing payout eligibility.
```

---

## Screen 6 — Restart Tracker

### Purpose
Show only when the account is blown or close to blown.

### Required Sections

#### Restart Required Status Card

```txt
RESTART REQUIRED
Max drawdown reached. This account can no longer be traded.
```

#### Account Status Card

```txt
Account status: Blown
Reason: Max drawdown reached
Evaluation target to pass again: $1,250
```

#### Recommended Action Card

```txt
Stop trading this account.
Reset and re-qualify before risking further capital.
```

#### Restart Checklist

```txt
1. Reset account
2. Pass evaluation target — $1,250
3. Return to funded mode
4. Re-enable payout tracker
```

---

## Screen 7 — Settings

### Purpose
Allow the user to configure account rules and instrument values.

### Fields

```txt
Account size
Max drawdown
Daily max loss
Monthly target
Evaluation target
Max payouts
Max payout amount
Profit split
```

### Instrument Values

```txt
MNQ:
- Point value
- Tick size
- Tick value

NQ:
- Point value
- Tick size
- Tick value
```

### Drawdown Type

```txt
Fixed drawdown
Trailing drawdown
End-of-day drawdown
```

### House Money Mode

```txt
Default: OFF
```

If ON, the app may optionally allow daily risk to use a portion of realised daily profit. This must be clearly labelled and should never be enabled by default.
