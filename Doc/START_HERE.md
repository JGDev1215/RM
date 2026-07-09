# START HERE — RiskGuard Trader Codex Build Pack

## Goal
Build **RiskGuard Trader**, a mobile-first trading risk management app for MNQ/NQ futures traders.

The app must answer five questions instantly:

1. Can the user trade now?
2. How much can the user risk?
3. How many MNQ/NQ contracts can the user take?
4. Is the user close to payout?
5. Is the user close to failing the account?

This is a **risk-control app only**. Do not add charting, trade signals, market prediction, news, AI forecasting, or social features.

---

## Source of Truth
Use these documents in order:

1. `START_HERE.md`
2. `01_PRODUCT_REQUIREMENTS.md`
3. `02_UI_DESIGN_SYSTEM.md`
4. `03_SCREEN_BY_SCREEN_SPEC.md`
5. `04_RISK_ENGINE_LOGIC.md`
6. `05_DATA_MODEL_AND_STORAGE.md`
7. `06_COMPONENT_ARCHITECTURE.md`
8. `07_VALIDATION_AND_EDGE_CASES.md`
9. `08_ACCEPTANCE_TESTS.md`
10. `09_CODEX_AGENT_WORKFLOW.md`

Also refer to the supplied HTML design file:

`RiskGuard Trader (standalone).html`

The HTML file shows the intended visual direction: mobile app mockup, 7 screens, card-based layout, soft off-white background, rounded cards, status badges, bottom navigation, and risk-first hierarchy.

---

## Core Account Defaults

```txt
Account size: $25,000
Evaluation target: $1,250
Max drawdown / account failure limit: $1,000
Daily max loss: $300
Monthly gross profit target: $4,000
Monthly payout goal: 2 to 3 payouts
Max payout per request: $1,000 gross
Trader split: 90%
Trader net per max payout: $900
Maximum payouts per account: 5
Main instruments: MNQ and NQ
```

---

## Instrument Defaults

```txt
MNQ:
- $2 per point
- $0.50 per tick
- Tick size: 0.25

NQ:
- $20 per point
- $5 per tick
- Tick size: 0.25
```

---

## Build Principle
The app must never encourage the user to increase risk after profit by default.

Core rule:

```txt
When ahead, reduce risk.
When near payout, protect payout.
When near drawdown, stop trading.
When blown, restart.
```

---

## Suggested Build Order

1. Create app shell and routing/navigation.
2. Implement design system tokens.
3. Implement data model and local storage.
4. Implement pure calculation functions.
5. Implement risk engine.
6. Implement Dashboard.
7. Implement Risk Calculator.
8. Implement Trade Logger.
9. Implement Payout Tracker.
10. Implement Restart Tracker.
11. Implement Settings.
12. Add validation and acceptance tests.
13. Run final QA against `08_ACCEPTANCE_TESTS.md`.

---

## Non-Negotiables

- All calculations must be deterministic and testable.
- Risk engine must be implemented as pure functions where possible.
- UI must be mobile-first.
- Data must persist with local storage first.
- User must not be able to approve trades that breach daily loss or drawdown limits.
- If account is blown, all trade approvals must be rejected.
- If payout is available or pending, app must show protection warnings.
- No unrelated UI changes.
- No unnecessary features.
