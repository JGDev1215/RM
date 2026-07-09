# AGENTS.md

## Purpose

This file contains the permanent operating instructions for Codex agents working in the RiskGuard Trader repository.

RiskGuard Trader is a mobile-first risk management app for MNQ/NQ futures traders. Agents must preserve the product scope: risk calculation, contract sizing, drawdown handling, payout tracking, restart tracking, trade logging, settings, local persistence, and code-gated Supabase cloud sync.

For future tasks, Codex must inspect, plan, review, execute, audit, fix if needed, and produce a final approval trail using the workflow below.

---

## Repository Rules

Codex must work only inside:

```text
/Users/soonjeongguan/Desktop/RISK
```

GitHub remote must be:

```text
https://github.com/JGDev1215/RM.git
```

Before making changes, Codex must run:

```bash
pwd
git remote -v
git status
```

Codex must confirm:

- current path is `/Users/soonjeongguan/Desktop/RISK`
- GitHub remote includes `https://github.com/JGDev1215/RM.git`
- existing uncommitted changes are identified
- user work will not be overwritten

If the path or remote is incorrect, Codex must stop and report the mismatch.

---

## App Context

RiskGuard Trader is a Vite, React, TypeScript app.

Primary commands:

```bash
npm run dev
npm run build
npm run test
```

Current app unlock code:

```text
5880
```

Important project areas:

| Area | Files |
| --- | --- |
| App routing and orchestration | `src/app/` |
| Screens | `src/screens/` |
| Reusable UI | `src/components/` |
| Risk and payout logic | `src/logic/` |
| Types and defaults | `src/data/` |
| Persistence | `src/storage/`, `src/supabase/` |
| Styling | `src/styles/` |
| Chart API endpoints | `api/chart/` |
| Supabase schema | `supabase/migrations/` |
| Product documentation | `Doc/` |

---

## Source of Truth

Start every documentation lookup from:

```text
Doc/START_HERE.md
```

Then read only the docs relevant to the task:

| Task type | Required docs |
| --- | --- |
| Product behavior | `Doc/01_PRODUCT_REQUIREMENTS.md` |
| Visual design or UI components | `Doc/02_UI_DESIGN_SYSTEM.md`, `Doc/03_SCREEN_BY_SCREEN_SPEC.md` |
| Risk, sizing, drawdown, payout, or restart calculations | `Doc/04_RISK_ENGINE_LOGIC.md`, `Doc/07_VALIDATION_AND_EDGE_CASES.md`, `Doc/08_ACCEPTANCE_TESTS.md` |
| State, storage, persistence, or Supabase sync | `Doc/05_DATA_MODEL_AND_STORAGE.md`, `Doc/06_COMPONENT_ARCHITECTURE.md` |
| QA or final acceptance | `Doc/08_ACCEPTANCE_TESTS.md` |
| Multi-agent coordination | `Doc/09_CODEX_AGENT_WORKFLOW.md` |

Rules:

- The current app code, `README.md`, `package.json`, `Doc/`, tests, Supabase migrations, and this `AGENTS.md` are the source of truth.
- Do not invent trading rules, payout rules, challenge rules, account modes, or UI flows.
- Do not add trading signals, forecasts, news, brokerage execution, automated trading, AI trade recommendations, or unrelated charts unless explicitly requested.
- Do not treat generated build output in `dist/` as source.

---

## Hard Rules

1. Work only inside `/Users/soonjeongguan/Desktop/RISK`.
2. Do not overwrite uncommitted user work.
3. Inspect relevant files before editing.
4. Create or update workflow evidence before and after implementation.
5. Do not skip planning for code, product, database, or UI changes.
6. Execute only the approved plan unless a blocker requires replanning.
7. Keep changes small, scoped, and reversible.
8. Do not make unrelated visual redesigns.
9. Preserve mobile-first behavior.
10. Keep risk calculations in `src/logic/` where practical, not embedded in screen JSX.
11. Preserve TypeScript types and data contracts.
12. Preserve Supabase RLS and code-gated cloud save/load behavior.
13. Do not commit, push, deploy, or alter remote configuration unless explicitly instructed.
14. Do not claim tests passed unless they were actually run.
15. If tests cannot be run, state why and perform the best available static or manual checks.

---

## Agent Roles

### Manager Agent

Responsible for:

- safety checks
- scope control
- plan approval
- integration review
- QA against acceptance docs
- workflow artifact completion

Must read:

```text
Doc/START_HERE.md
Doc/09_CODEX_AGENT_WORKFLOW.md
```

### Risk Logic Agent

Responsible for:

```text
src/logic/riskEngine.ts
src/logic/contractSizing.ts
src/logic/drawdownLogic.ts
src/logic/payoutLogic.ts
src/logic/validation.ts
src/logic/*.test.ts
```

Must read:

```text
Doc/04_RISK_ENGINE_LOGIC.md
Doc/07_VALIDATION_AND_EDGE_CASES.md
Doc/08_ACCEPTANCE_TESTS.md
```

Rules:

- Keep calculation functions deterministic and testable.
- Prefer explicit validation over silent coercion.
- Add or update Vitest coverage for calculation changes.

### Data and State Agent

Responsible for:

```text
src/data/
src/storage/
src/supabase/
src/app/useRiskGuardState.ts
src/app/useCloudSync.ts
supabase/migrations/
```

Must read:

```text
Doc/05_DATA_MODEL_AND_STORAGE.md
Doc/06_COMPONENT_ARCHITECTURE.md
README.md
```

Rules:

- Preserve backward-compatible local storage where possible.
- Do not expose Supabase service-role secrets or private keys.
- Keep anonymous direct table access restricted.
- Document schema-impacting changes in the workflow report.

### UI Implementation Agent

Responsible for:

```text
src/components/
src/screens/
src/styles/
src/app/routes.tsx
src/app/App.tsx
```

Must read:

```text
Doc/02_UI_DESIGN_SYSTEM.md
Doc/03_SCREEN_BY_SCREEN_SPEC.md
Doc/06_COMPONENT_ARCHITECTURE.md
```

Rules:

- Preserve the mobile-first app shell and bottom navigation.
- Use existing tokens, components, and layout patterns first.
- Do not place calculation rules directly in UI code unless wiring existing logic.
- Check compact viewport behavior for UI changes.

### API and Market Data Agent

Responsible for:

```text
api/chart/
src/app/useMarketDataFeed.ts
src/data/marketData.ts
src/logic/marketData.ts
src/components/MarketDataCard.tsx
```

Must read:

```text
Doc/01_PRODUCT_REQUIREMENTS.md
Doc/06_COMPONENT_ARCHITECTURE.md
```

Rules:

- Keep market data display informational.
- Do not add trade signals or forecasts.
- Handle unavailable data gracefully.

---

## Required Workflow Folder

For every task, Codex must create or maintain:

```text
agent-workflow/
  00-inbox/
  01-intake/
  02-plans/
  03-senior-review/
  04-execution/
  05-code-review/
  06-fix-rounds/
  07-final-review/
  08-completed/
```

---

## Required Workflow Files

For every task, Codex must create or update:

```text
agent-workflow/00-inbox/current-task.md
agent-workflow/01-intake/task-brief.md
agent-workflow/02-plans/implementation-plan.md
agent-workflow/03-senior-review/plan-review.md
agent-workflow/03-senior-review/approved-plan.md
agent-workflow/04-execution/execution-report.md
agent-workflow/05-code-review/review-report.md
agent-workflow/06-fix-rounds/senior-decision.md
agent-workflow/07-final-review/final-approval.md
agent-workflow/08-completed/workflow-summary.md
```

If fixes are required, Codex must also create:

```text
agent-workflow/06-fix-rounds/fix-report.md
```

---

## Workflow Stages

### Stage 0 - Safety Check

Before planning or editing, run:

```bash
pwd
git remote -v
git status
find . -maxdepth 3 -type f | sed 's#^\./##' | sort | head -200
```

Identify:

- app structure
- main files
- current git status
- existing uncommitted changes
- whether it is safe to proceed

### Stage 1 - Capture User Task

Create or update:

```text
agent-workflow/00-inbox/current-task.md
```

It must contain the user's exact task and the date captured.

### Stage 2 - Intake Agent

Create or update:

```text
agent-workflow/01-intake/task-brief.md
```

Include:

```md
# Task Brief

## Original User Task

## Objective

## Repo Findings

## Relevant Source Docs

## Assumptions

## Out of Scope

## Success Criteria
- [ ]
- [ ]
- [ ]
```

### Stage 3 - Planning Agent

Create or update:

```text
agent-workflow/02-plans/implementation-plan.md
```

Include:

```md
# Implementation Plan

## Goal

## Repo Findings

## Files Likely Affected

## Proposed Changes

## Step-by-Step Plan

## Acceptance Criteria

## Test Plan

## Risks

## Rollback Plan
```

The plan must be concrete enough for another agent to execute without guessing.

### Stage 4 - Senior Plan Review Agent

Review the plan before editing code.

Create or update:

```text
agent-workflow/03-senior-review/plan-review.md
agent-workflow/03-senior-review/approved-plan.md
```

The approved plan is the only plan that may be executed.

### Stage 5 - Execution Agent

Only after `approved-plan.md` exists, Codex may edit code or app assets.

After editing, create or update:

```text
agent-workflow/04-execution/execution-report.md
```

Include changed files, implementation notes, deviations, checks performed, and known issues.

### Stage 6 - Code Review Agent

Review the completed work as if reviewing another agent's work.

Create or update:

```text
agent-workflow/05-code-review/review-report.md
```

Check:

- original task completed
- approved plan followed
- no unrelated changes
- no obvious bugs
- no broken UI flow
- no broken saved data
- mobile usability preserved
- code remains simple and maintainable
- tests or documented manual checks cover the changed behavior

### Stage 7 - Senior Decision Agent

Create or update:

```text
agent-workflow/06-fix-rounds/senior-decision.md
```

Decision must be:

```text
APPROVED
FIXES REQUIRED
REPLAN REQUIRED
```

If fixes are required, apply only the required fixes and create:

```text
agent-workflow/06-fix-rounds/fix-report.md
```

Then update the code review until it passes or a blocker is identified.

### Stage 8 - Final Approval Agent

Create or update:

```text
agent-workflow/07-final-review/final-approval.md
```

Decision must be:

```text
SAFE TO COMMIT
NOT SAFE TO COMMIT
```

Include tests/checks, files changed, remaining risks, and a recommended commit message.

### Stage 9 - Workflow Summary

Create or update:

```text
agent-workflow/08-completed/workflow-summary.md
```

Summarize the task, path, remote, stages completed, files changed, workflow files created, and checks performed.

---

## Verification Expectations

Use the narrowest checks that prove the change:

- Logic changes: `npm run test`
- Type or integration changes: `npm run build`
- UI changes: `npm run build` plus browser/manual viewport check when practical
- Supabase migration changes: inspect SQL, confirm RLS/security impact, and document whether migration was applied locally
- Documentation-only changes: inspect rendered markdown structure and run no app tests unless code is affected

Always report exactly what was run.

---

## Final Response Requirements

Final responses must include:

- concise summary of what changed
- files changed
- checks run
- remaining risks or limitations
- no claim that changes are committed or deployed unless that happened by explicit request
