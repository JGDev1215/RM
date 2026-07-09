# Task Brief

> Status: Current
> Last reviewed: 2026-07-09
> Source of truth: Yes

## Original User Task

Implement the Robust Trader-Safety Audit Plan for RiskGuard Trader.

## Objective

Add automated and documented trader-safety audit coverage that evaluates whether a trader following app-approved decisions is protected from rapid account loss over realistic loss sequences.

## Repo Findings

- Repo path is `/Users/soonjeongguan/Desktop/RISK`.
- Remote is `https://github.com/JGDev1215/RM.git`.
- Existing user/uncommitted changes are present in logic, state, dashboard, and settings files.
- Existing QA reports are under `doc/qa/`.
- Current automated tests pass before this task with `npm run test`.

## Relevant Source Docs

- `Doc/START_HERE.md`
- `Doc/04_RISK_ENGINE_LOGIC.md`
- `Doc/07_VALIDATION_AND_EDGE_CASES.md`
- `Doc/08_ACCEPTANCE_TESTS.md`

## Assumptions

- The audit should not silently rewrite default risk policy.
- Policy concerns should be reported as findings unless the user explicitly asks for product-rule changes.
- Browser testing must avoid mutating cloud/Supabase state.

## Out of Scope

- Changing default risk amounts.
- Adding trading signals or forecasts.
- Mutating Supabase production state.
- Committing or deploying changes.

## Success Criteria

- [x] Add survival-sequence automated tests.
- [x] Add funded/payout/adversarial safety tests.
- [x] Run `npm run test`.
- [x] Run `npm run build`.
- [x] Produce a trader-safety audit report.
- [x] Perform a browser smoke pass without mutating cloud state.
