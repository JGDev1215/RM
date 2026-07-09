import { describe, expect, it } from 'vitest';
import { defaultAccountConfig, defaultAccountState } from '../data/defaults';
import type { AccountState, RiskContext } from '../data/types';
import { calculatePayoutEligibleProfit, promoteEvaluationAccount } from './accountPhase';
import { calculateContractsAllowed, calculatePotentialLoss, calculateRiskPerContract, calculateStopPoints } from './contractSizing';
import { calculateDrawdownRemaining } from './drawdownLogic';
import { calculateNetPayout, calculatePayoutStatus } from './payoutLogic';
import { buildTradingStatus, calculateDailyRiskRemaining, calculateRecommendedRisk, calculateRiskMode, calculateTradeApproval } from './riskEngine';

const baseCtx: RiskContext = {
  accountPhase: 'evaluation',
  accountSize: 25000,
  currentBalance: 25000,
  startingBalance: 25000,
  highWatermark: 25000,
  maxDrawdown: 1000,
  drawdownType: 'fixed',
  dailyMaxLoss: 300,
  dailyPnl: 0,
  weeklyPnl: 0,
  monthlyPnl: 0,
  monthlyTarget: 4000,
  weeklyTarget: 1000,
  fundedProfit: 0,
  payoutPending: false,
  payoutsTaken: 0,
  maxPayouts: 5,
  maxPayoutAmount: 1000,
  hasHighRTradeThisWeek: false,
  dayOfWeek: 4,
  houseMoneyMode: false
};

describe('RiskGuard acceptance calculations', () => {
  it('sizes MNQ contracts', () => {
    const stop = calculateStopPoints(22000, 21970);
    const risk = calculateRiskPerContract(stop, 2);
    const contracts = calculateContractsAllowed(150, risk);
    expect(stop).toBe(30);
    expect(risk).toBe(60);
    expect(contracts).toBe(2);
    expect(calculatePotentialLoss(contracts, risk)).toBe(120);
  });

  it('rejects NQ when risk is too small for one contract', () => {
    const result = calculateTradeApproval({ ctx: baseCtx, setup: { instrument: 'NQ', direction: 'long', entry: 22000, stop: 21990 }, pointValue: 20 });
    expect(result.riskPerContract).toBe(200);
    expect(result.contractsAllowed).toBe(0);
    expect(result.approval).toBe('REJECTED - INVALID INPUT');
  });

  it('stops at the daily limit', () => {
    const ctx = { ...baseCtx, dailyPnl: -300 };
    expect(calculateDailyRiskRemaining(300, -300)).toBe(0);
    expect(calculateRiskMode(ctx)).toBe('stop');
    expect(calculateRecommendedRisk(ctx)).toBe(0);
    expect(calculateTradeApproval({ ctx, setup: { instrument: 'MNQ', direction: 'long', entry: 22000, stop: 21970 }, pointValue: 2 }).approval).toBe('REJECTED - DAILY LIMIT');
  });

  it('stops when drawdown is breached', () => {
    const ctx = { ...baseCtx, currentBalance: 24000 };
    expect(calculateDrawdownRemaining(1000, 1000)).toBe(0);
    expect(calculateRiskMode(ctx)).toBe('stop');
    expect(calculateTradeApproval({ ctx, setup: { instrument: 'MNQ', direction: 'long', entry: 22000, stop: 21970 }, pointValue: 2 }).approval).toBe('REJECTED - ACCOUNT BLOWN');
  });

  it('reduces risk after monthly progress', () => {
    const ctx = { ...baseCtx, monthlyPnl: 1200 };
    expect(calculateRiskMode(ctx)).toBe('reduced');
    expect(calculateRecommendedRisk(ctx)).toBe(75);
  });

  it('uses protection mode after 50% monthly progress', () => {
    const ctx = { ...baseCtx, monthlyPnl: 2100 };
    expect(calculateRiskMode(ctx)).toBe('protection');
    expect(calculateRecommendedRisk(ctx)).toBe(50);
  });

  it('uses minimum mode after 75% monthly progress', () => {
    const ctx = { ...baseCtx, monthlyPnl: 3100 };
    expect(calculateRiskMode(ctx)).toBe('minimum');
    expect(calculateRecommendedRisk(ctx)).toBe(25);
  });

  it('detects payout availability', () => {
    const ctx = { ...baseCtx, accountPhase: 'funded' as const, currentBalance: 27250, fundedProfit: 1000 };
    expect(calculatePayoutStatus({ fundedProfit: 1000, maxPayoutAmount: 1000, payoutPending: false, payoutsTaken: 0, maxPayouts: 5, accountPhase: 'funded' })).toBe('Available');
    expect(calculateNetPayout(defaultAccountConfig.maxPayoutAmount, defaultAccountConfig.profitSplit)).toBe(900);
    expect(calculateRiskMode(ctx)).toBe('protection');
  });

  it('does not apply payout availability while still in evaluation', () => {
    const ctx = { ...baseCtx, currentBalance: 26000, fundedProfit: 1000 };
    expect(calculatePayoutStatus({ fundedProfit: 1000, maxPayoutAmount: 1000, payoutPending: false, payoutsTaken: 0, maxPayouts: 5, accountPhase: 'evaluation' })).toBe('Not ready');
    expect(calculateRiskMode(ctx)).toBe('normal');
  });

  it('ignores stale payout pending state while still in evaluation', () => {
    const ctx = { ...baseCtx, payoutPending: true };
    const approval = calculateTradeApproval({ ctx, setup: { instrument: 'MNQ', direction: 'long', entry: 22000, stop: 21970 }, pointValue: 2 });

    expect(calculatePayoutStatus({ fundedProfit: 0, maxPayoutAmount: 1000, payoutPending: true, payoutsTaken: 0, maxPayouts: 5, accountPhase: 'evaluation' })).toBe('Not ready');
    expect(calculateRiskMode(ctx)).toBe('normal');
    expect(buildTradingStatus(ctx)).toBe('TRADE ALLOWED');
    expect(approval.approval).toBe('APPROVED');
  });

  it('reduces after a high-R trade', () => {
    const ctx = { ...baseCtx, hasHighRTradeThisWeek: true };
    expect(calculateRiskMode(ctx)).toBe('reduced');
    expect(calculateRecommendedRisk(ctx)).toBe(75);
  });

  it('rejects zero stop size', () => {
    const result = calculateTradeApproval({ ctx: baseCtx, setup: { instrument: 'MNQ', direction: 'long', entry: 22000, stop: 22000 }, pointValue: 2 });
    expect(result.approval).toBe('REJECTED - INVALID INPUT');
  });
});

describe('Eval-to-funded transition', () => {
  const makeState = (currentBalance: number, overrides: Partial<AccountState> = {}): AccountState => ({
    ...defaultAccountState,
    startingBalance: 25000,
    currentBalance,
    highWatermark: Math.max(25000, currentBalance),
    lastUpdated: '2026-07-09T00:00:00.000Z',
    ...overrides
  });

  it('keeps evaluation accounts below the pass balance out of funded profit', () => {
    const state = makeState(26249.99);
    const promoted = promoteEvaluationAccount(state, defaultAccountConfig, () => '2026-07-09T12:00:00.000Z');

    expect(promoted.phase).toBe('evaluation');
    expect(calculatePayoutEligibleProfit(promoted, defaultAccountConfig)).toBe(0);
  });

  it('promotes evaluation accounts at the pass balance with no payout-eligible profit yet', () => {
    const state = makeState(26250);
    const promoted = promoteEvaluationAccount(state, defaultAccountConfig, () => '2026-07-09T12:00:00.000Z');

    expect(promoted.phase).toBe('funded');
    expect(promoted.fundedAt).toBe('2026-07-09T12:00:00.000Z');
    expect(promoted.fundedBaseline).toBe(26250);
    expect(calculatePayoutEligibleProfit(promoted, defaultAccountConfig)).toBe(0);
  });

  it('counts only post-target profit for funded payout eligibility', () => {
    const state = makeState(27250, { phase: 'funded', fundedBaseline: 26250 });

    expect(calculatePayoutEligibleProfit(state, defaultAccountConfig)).toBe(1000);
    expect(calculatePayoutStatus({ fundedProfit: 1000, maxPayoutAmount: 1000, payoutPending: false, payoutsTaken: 0, maxPayouts: 5, accountPhase: 'funded' })).toBe('Available');
  });

  it('records the funded baseline when a balance update crosses the target', () => {
    const state = makeState(26300);
    const promoted = promoteEvaluationAccount(state, defaultAccountConfig, () => '2026-07-09T12:00:00.000Z');

    expect(promoted.phase).toBe('funded');
    expect(promoted.fundedBaseline).toBe(26250);
    expect(calculatePayoutEligibleProfit(promoted, defaultAccountConfig)).toBe(50);
  });

  it('does not auto-demote funded accounts that drop below the funded baseline', () => {
    const state = makeState(26100, { phase: 'funded', fundedAt: '2026-07-09T12:00:00.000Z', fundedBaseline: 26250 });
    const promoted = promoteEvaluationAccount(state, defaultAccountConfig, () => '2026-07-09T13:00:00.000Z');

    expect(promoted.phase).toBe('funded');
    expect(promoted.fundedAt).toBe('2026-07-09T12:00:00.000Z');
    expect(calculatePayoutEligibleProfit(promoted, defaultAccountConfig)).toBe(0);
  });

  it('uses the evaluation pass balance for old funded snapshots without a baseline', () => {
    const state = makeState(27250, { phase: 'funded' });

    expect(calculatePayoutEligibleProfit(state, defaultAccountConfig)).toBe(1000);
  });

  it('backfills missing funded baselines on old funded snapshots', () => {
    const state = makeState(27250, { phase: 'funded' });
    const promoted = promoteEvaluationAccount(state, defaultAccountConfig, () => '2026-07-09T12:00:00.000Z');

    expect(promoted.fundedBaseline).toBe(26250);
    expect(promoted.fundedAt).toBeUndefined();
    expect(calculatePayoutEligibleProfit(promoted, defaultAccountConfig)).toBe(1000);
  });
});
