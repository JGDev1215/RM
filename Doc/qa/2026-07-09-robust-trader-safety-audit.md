# Robust Trader-Safety Audit - 2026-07-09

> Status: Current QA Report
> App: RiskGuard Trader
> Account profile: $25,000 evaluation, $1,000 max drawdown, $1,250 target
> Audit standard: trader-safety over loss sequences, not calculator correctness only

## Executive Result

Result: **PASS WITH POLICY FINDINGS**.

The app passes hard safety gates for account-blown rejection, daily-limit rejection, invalid setup rejection, funded-baseline payout accounting, and payout-pending minimum-risk behavior.

The audit found a policy-level weakness: the default `$150` normal risk remains active until fixed drawdown remaining falls to `$300`. This does not allow a direct breach while following app approvals, but it permits the trader to consume most of a `$1,000` failure buffer quickly.

## Test Parameters

| Parameter | Value |
| --- | --- |
| Starting balance | `$25,000` |
| Failure balance | `$24,000` |
| Max drawdown | `$1,000` |
| Funded target | `$26,250` |
| Daily max loss | `$300` |
| Risk ladder | `$150 / $75 / $50 / $25 / $0` |
| Instruments | MNQ `$2/point`, NQ `$20/point` |
| Drawdown mode | Fixed |
| House Money Mode | OFF |
| First payout available | `$27,250` if funded baseline is `$26,250` |

## Automated Audit Coverage Added

Added `src/logic/traderSafetyAudit.test.ts`.

Coverage includes:

- Consecutive full-risk losing sequence from `$25,000`.
- Multi-day daily-limit degradation toward account failure.
- Fixed drawdown thresholds at `$1,000`, `$750`, `$500`, `$300`, `$150`, `$50`, and `$0` remaining.
- House-money-off behavior.
- Invalid, non-finite, zero, negative, identical, and wide-stop trade inputs.
- Funded transition at `$26,250`.
- Payout profit only after funded baseline.
- Payout pending minimum-risk behavior.
- Funded account dropping below baseline with payout profit floored at `$0`.

## Survival Sequence Findings

### Sequence: Full-Risk Losses From `$25,000`

| Balance | Drawdown Remaining | Mode | Recommended Risk | Approval Result |
| --- | ---: | --- | ---: | --- |
| `$25,000` | `$1,000` | Normal | `$150` | Approved |
| `$24,850` | `$850` | Normal | `$150` | Approved |
| `$24,700` | `$700` | Normal | `$150` | Approved |
| `$24,550` | `$550` | Normal | `$150` | Approved |
| `$24,400` | `$400` | Normal | `$150` | Approved |
| `$24,250` | `$250` | Minimum | `$25` | Rejected for tested 75-point MNQ setup because current risk is too small |
| `$24,100` | `$100` | Stop | `$0` | Rejected - drawdown limit |
| `$24,000` | `$0` | Stop | `$0` | Rejected - account blown |

Interpretation:

- The hard account-blown guard works.
- The drawdown stop guard works at `$150` remaining and below.
- Policy concern: the app allows `$150` planned risk with only `$400` drawdown remaining, leaving limited room for slippage, commission, or user execution error.

### Multi-Day Degradation

| Day | Starting Balance | Daily P&L | Drawdown Remaining | Mode |
| --- | ---: | ---: | ---: | --- |
| 1 | `$25,000` | `-$300` | `$1,000` | Stop for day |
| 2 | `$24,700` | `-$300` | `$700` | Stop for day |
| 3 | `$24,400` | `-$300` | `$400` | Stop for day |
| 4 | `$24,100` | `$0` | `$100` | Stop |

Interpretation:

- The daily limit stops each trading day after `-$300`.
- Three max-loss days consume `$900` of the `$1,000` drawdown.
- The app prevents the fourth day from starting normally because drawdown remaining is `$100`.
- Policy concern: a trader can still reach near-failure in three trading days while following the daily limit.

## Findings

### F1 - Normal Risk Persists Deep Into Drawdown Buffer

Severity: **Medium policy-risk issue**

Observed:

- `$150` normal risk remains at `$500` and `$400` drawdown remaining.
- Risk does not step down to minimum until `$300` drawdown remaining.
- Stop mode starts at `$150` drawdown remaining.

Trader impact:

- The account cannot be directly breached by the tested approved trade sequence, but the risk profile remains aggressive relative to a `$1,000` total failure buffer.
- Slippage or commissions could make exact planned-risk assumptions too optimistic.

Recommended policy direction:

- Consider capping risk dynamically, for example `min(defaultRisk, 10% of drawdown remaining, 50% of daily risk remaining)`.
- Add a reserved buffer, for example `$25-$50`, so approved trades cannot consume the exact daily or drawdown limit.

### F2 - Daily Max Loss Allows Near-Failure In Three Days

Severity: **Medium policy-risk issue**

Observed:

- A trader respecting the `$300` daily max loss can move from `$25,000` to `$24,100` in three losing days.
- The fourth day is blocked, so this is not an account-blown logic bug.

Trader impact:

- The system protects the hard failure line but still allows fast degradation.

Recommended policy direction:

- Consider reducing daily max loss automatically as drawdown remaining contracts.
- Consider a cooling-off rule after two max-loss days or after drawdown used exceeds `$600`.

## Hard Safety Gates

| Gate | Result |
| --- | --- |
| Account blown rejects all tested approvals | PASS |
| Daily loss limit rejects further trades | PASS |
| Contracts are floored, not rounded up | PASS |
| Invalid entry/stop values are rejected | PASS |
| Wide stops produce zero contracts and rejection | PASS |
| Evaluation payout state is ignored | PASS |
| Funded payout profit starts after funded baseline only | PASS |
| Payout pending applies minimum risk | PASS |
| House Money Mode OFF does not increase risk | PASS |

## Browser Smoke Evidence

Local URL tested: `http://127.0.0.1:4174/`

The app was opened in the in-app browser and unlocked with the documented code. Settings/reset mutations were avoided because the unlocked app autosaves to Supabase after state changes.

Observed UI evidence:

- Access-code gate appeared before unlock.
- Dashboard displayed account phase, current decision, daily risk, drawdown protection, recommended risk, monthly target, consistency rule, payout tracker, and bottom navigation.
- Calculator on current saved state showed MNQ `30.00` stop points, `$60.00` risk per contract, floored contract count, reduced-size approval, daily remaining, and drawdown remaining.
- Switching to NQ produced `REJECTED - INVALID INPUT`, zero contracts, and the message `Stop is too wide for current risk allowance.`
- Browser console errors: none observed.

## Manual QA Still Recommended

The automated audit covers pure logic and state-policy behavior. The browser smoke pass covered read-only dashboard/calculator surfaces. A deeper controlled browser pass should still verify:

- Dashboard warning prominence at `$400`, `$250`, `$100`, and `$0` drawdown remaining.
- Trade Logger does not visually present rejected trades as safe approvals.
- Settings changes to daily max loss, drawdown, account size, and house-money mode are clearly reflected or warned.
- Reload preserves funded, payout-pending, daily-limit, and restart-required states.
- Supabase sync does not restore stale unsafe state over newer local state.

## Conclusion

RiskGuard Trader is logically protective at hard failure boundaries, but not fully conservative as a trader-survival system. It should be considered **safe against direct hard-rule breaches** and **not yet optimal against rapid drawdown degradation**.
