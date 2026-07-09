# 01 — Product Requirements

## Product Name
RiskGuard Trader

## Purpose
RiskGuard Trader is a trading risk management app for MNQ/NQ futures traders. It calculates risk per trade, contracts allowed, daily loss remaining, drawdown remaining, monthly progress, payout progress, and account restart state.

The app is not a signal app. It does not tell the user where to buy or sell. It only controls risk.

---

## User Problem
The trader may make profit early in the week or month, then give back gains by continuing to trade at full risk. The app must reduce risk automatically once the trader is ahead, close to payout, or close to drawdown limits.

---

## Primary User Outcomes
The user should be able to:

1. Enter account data.
2. Enter trade setup data.
3. Calculate correct MNQ/NQ contract size.
4. See whether the trade is approved or rejected.
5. Log trade results.
6. Track daily, weekly, and monthly P&L.
7. Track payout readiness.
8. Know when risk should be reduced.
9. Know when trading must stop.
10. Know when the account must be restarted.

---

## Default Account Configuration

```ts
const defaultAccountConfig = {
  accountSize: 25000,
  evaluationTarget: 1250,
  maxDrawdown: 1000,
  dailyMaxLoss: 300,
  monthlyTarget: 4000,
  weeklyTarget: 1000,
  maxPayouts: 5,
  maxPayoutAmount: 1000,
  profitSplit: 0.9,
  houseMoneyMode: false,
  drawdownType: 'fixed',
  instruments: {
    MNQ: {
      pointValue: 2,
      tickSize: 0.25,
      tickValue: 0.5
    },
    NQ: {
      pointValue: 20,
      tickSize: 0.25,
      tickValue: 5
    }
  }
};
```

---

## Account Phases

The app must support these account phases:

```txt
Evaluation
Funded
Payout Protection
Restart Required
```

### Evaluation
Use when the account is trying to pass the $1,250 target.

### Funded
Use when the account has passed evaluation and is eligible to build towards payouts.

### Payout Protection
Use when payout is available, pending, or close. Risk must reduce.

### Restart Required
Use when max drawdown has been breached. Trading must stop.

---

## Trading Status

The app must output one of the following statuses:

```txt
TRADE ALLOWED
REDUCE SIZE
PROTECT PROFITS
STOP TRADING TODAY
ACCOUNT BLOWN / RESTART REQUIRED
```

---

## Trade Approval States

Every proposed trade must return one of:

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

## Core Formulae

### Stop Loss Points

```txt
Stop Loss Points = Absolute Value of Entry Price - Stop Loss Price
```

### Risk Per Contract

```txt
Risk Per Contract = Stop Loss Points × Instrument Point Value
```

### Contracts Allowed

```txt
Contracts Allowed = Floor(Recommended Dollar Risk / Risk Per Contract)
```

### Potential Loss

```txt
Potential Loss = Contracts Allowed × Risk Per Contract
```

### Daily Risk Remaining

```txt
Daily Risk Remaining = Daily Max Loss - Absolute Value of Negative Daily P&L
```

If daily P&L is positive, daily risk remaining remains capped at $300 unless House Money Mode is enabled.

### Payout Net

```txt
Net Payout = Gross Payout × Profit Split
```

Example:

```txt
$1,000 gross payout × 90% = $900 net payout
```

---

## What Must Not Be Built

Do not build:

- Signal generation
- Trade ideas
- Candlestick charts
- Market prediction
- Broker integration
- Auto trading
- News feed
- Social sharing
- Leaderboards
- Complex analytics dashboards outside risk control
