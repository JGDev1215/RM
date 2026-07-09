import type { AccountConfig, AccountPhase, AccountState } from '../data/types';

export function isFundedStylePhase(phase: AccountPhase): boolean {
  return phase === 'funded' || phase === 'payout_protection';
}

export function calculateEvaluationPassBalance(state: AccountState, config: AccountConfig): number {
  return state.startingBalance + config.evaluationTarget;
}

export function calculateFundedBaseline(state: AccountState, config: AccountConfig): number {
  return state.fundedBaseline ?? calculateEvaluationPassBalance(state, config);
}

export function promoteEvaluationAccount(
  state: AccountState,
  config: AccountConfig,
  consistencyPassing = true,
  now: () => string = () => new Date().toISOString()
): AccountState {
  if (isFundedStylePhase(state.phase) && state.fundedBaseline == null) {
    return {
      ...state,
      fundedBaseline: calculateEvaluationPassBalance(state, config)
    };
  }

  if (state.phase !== 'evaluation') return state;

  const fundedBaseline = calculateEvaluationPassBalance(state, config);
  if (state.currentBalance < fundedBaseline) return state;
  if (!consistencyPassing) return state;
  const timestamp = now();

  return {
    ...state,
    phase: 'funded',
    fundedAt: timestamp,
    fundedBaseline,
    lastUpdated: timestamp
  };
}

export function calculatePayoutEligibleProfit(state: AccountState, config: AccountConfig): number {
  if (!isFundedStylePhase(state.phase)) return 0;
  return Math.max(0, state.currentBalance - calculateFundedBaseline(state, config));
}
