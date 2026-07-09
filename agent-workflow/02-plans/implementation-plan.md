# Implementation Plan

> Status: Current
> Last reviewed: 2026-07-09
> Source of truth: Yes

## Goal

Implement the robust trader-safety audit as a test suite plus QA report.

## Repo Findings

- The risk engine and account phase logic are pure enough for deterministic audit coverage.
- Existing tests already cover baseline acceptance cases.
- Browser app unlock uses Supabase cloud sync and autosave, so browser testing should avoid state mutations.

## Files Likely Affected

- `src/logic/traderSafetyAudit.test.ts`
- `doc/qa/2026-07-09-robust-trader-safety-audit.md`
- `agent-workflow/*`

## Proposed Changes

- Add a dedicated trader-safety audit test file.
- Document current policy findings and hard safety pass/fail results.
- Run automated tests and production build.
- Perform a read-only browser smoke pass.

## Step-by-Step Plan

1. Inspect current risk, account phase, validation, payout, and state logic.
2. Add automated tests for loss sequences, drawdown thresholds, daily degradation, adversarial trade inputs, funded transition, payout pending, and payout baseline.
3. Add a dated QA report separating calculation correctness from policy safety.
4. Run `npm run test`.
5. Run `npm run build`.
6. Start a local app server and verify read-only dashboard/calculator safety surfaces.
7. Update workflow evidence and final approval.

## Acceptance Criteria

- Automated tests include multi-trade and multi-day survival scenarios.
- Report identifies whether the app is safe against direct hard-rule breaches.
- Report identifies policy risks separately from calculation bugs.
- No user work is overwritten.
- No Supabase state is intentionally mutated.

## Test Plan

- `npm run test`
- `npm run build`
- Browser smoke at `http://127.0.0.1:4174/`

## Risks

- Existing uncommitted changes may already alter behavior. Mitigation: read and work with current files.
- Browser unlock loads cloud state and autosaves mutations. Mitigation: do read-only browser checks only.

## Rollback Plan

Remove `src/logic/traderSafetyAudit.test.ts` and `doc/qa/2026-07-09-robust-trader-safety-audit.md`.
