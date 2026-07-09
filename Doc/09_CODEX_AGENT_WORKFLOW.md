# 09 — Codex Agent Workflow

## Objective
Use this workflow to coordinate multiple Codex agents without duplicate work.

---

## Agent Roles

### Agent 1 — Risk Logic Agent
Responsible for:

```txt
riskEngine.ts
contractSizing.ts
drawdownLogic.ts
payoutLogic.ts
validation.ts
unit-style calculation tests
```

Must read:

```txt
04_RISK_ENGINE_LOGIC.md
07_VALIDATION_AND_EDGE_CASES.md
08_ACCEPTANCE_TESTS.md
```

Must not touch unrelated UI unless required to wire logic.

---

### Agent 2 — UI Implementation Agent
Responsible for:

```txt
Design tokens
Reusable components
App shell
Bottom navigation
Screen layouts
Mobile-first CSS
```

Must read:

```txt
02_UI_DESIGN_SYSTEM.md
03_SCREEN_BY_SCREEN_SPEC.md
RiskGuard Trader (standalone).html
```

Must preserve the design direction from the HTML file.

---

### Agent 3 — Data and State Agent
Responsible for:

```txt
Local storage
Types
Default config
Trade logs
Payout logs
Derived daily/weekly/monthly stats
Settings persistence
```

Must read:

```txt
05_DATA_MODEL_AND_STORAGE.md
06_COMPONENT_ARCHITECTURE.md
```

---

### Manager Agent — Integration and QA
Responsible for:

```txt
Prevent duplicate work
Review changed files
Run acceptance tests
Check routing
Check visual consistency
Check calculation correctness
Confirm no unrelated features added
```

Must read all docs.

---

## Standard Prompt for Each Agent

```txt
Read START_HERE.md first.
Then read the specific files assigned to your role.
Follow the documentation exactly.
Do not add unrelated features.
Do not change requirements unless required to fix a bug.
Implement your assigned area only.
After implementation, provide:
1. Files changed
2. What was implemented
3. Tests/checks performed
4. Any blockers or assumptions
```

---

## Recommended Sequential Order

### Step 1 — Manager Setup

```txt
Create or verify project structure.
Confirm current framework.
Identify whether app is React, plain HTML, Vite, Next, or other.
Do not implement yet.
```

### Step 2 — Logic First

Agent 1 implements pure logic functions.

Expected output:

```txt
riskEngine.ts
contractSizing.ts
drawdownLogic.ts
payoutLogic.ts
validation.ts
```

### Step 3 — Data Layer

Agent 3 implements types, defaults, local storage helpers, and stat calculations.

Expected output:

```txt
types.ts
defaults.ts
localStorage.ts
stats.ts
```

### Step 4 — UI Shell

Agent 2 implements app shell, design tokens, reusable components, and routing.

Expected output:

```txt
AppShell
BottomNav
Card
StatusCard
MetricCard
ProgressBar
PillBadge
```

### Step 5 — Screens

Agent 2 builds screens using existing logic and data.

Expected output:

```txt
DashboardScreen
RiskCalculatorScreen
TradeLoggerScreen
DynamicRiskEngineScreen
PayoutTrackerScreen
RestartTrackerScreen
SettingsScreen
```

### Step 6 — Integration

Manager checks:

```txt
Logic wired correctly
No calculations inside UI where avoidable
Screens route correctly
Local storage works
Acceptance tests pass
```

---

## Final Manager QA Prompt

```txt
Read all RiskGuard documentation files.
Review the implemented app against 08_ACCEPTANCE_TESTS.md.
Check every required calculation manually.
Check that the UI follows RiskGuard Trader (standalone).html.
Confirm that no trading signals, charts, news, AI forecasts, or unrelated features were added.
Fix only issues needed to pass the acceptance tests.
Provide a final QA report with pass/fail items.
```

---

## Commit Message Suggestion

```txt
Implement RiskGuard Trader dynamic risk management app
```
