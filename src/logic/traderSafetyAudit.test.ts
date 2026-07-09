import { describe, expect, it } from 'vitest';
import { defaultAccountConfig, defaultAccountState } from '../data/defaults';
import type { AccountState, RiskContext, TradeSetup } from '../data/types';
import { calculatePayoutEligibleProfit, promoteEvaluationAccount } from './accountPhase';
import { calculateDrawdownRemaining, calculateDrawdownUsed } from './drawdownLogic';
import { calculatePayoutStatus } from './payoutLogic';
import {
  buildTradingStatus,
  calculateDailyRiskRemaining,
  calculateRecommendedRisk,
  calculateRiskMode,
  calculateTradeApproval
} from './riskEngine';
import { validateTradeSetup } from './validation';

const auditSetup: TradeSetup = {
  instrument: 'MNQ',
  direction: 'long',
  entry: 22000,
  stop: 21925
};

const baseCtx: RiskContext = {
  accountPhase: 'evaluation',
  accountSize: 25000,
  currentBalance: 25000,
  startingBalance: 25000,
  highWatermark: 25000,
  highestEndOfDayBalance: 25000,
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

function ctxAtBalance(currentBalance: number, overrides: Partial<RiskContext> = {}): RiskContext {
  return {
    ...baseCtx,
    currentBalance,
    highWatermark: Math.max(baseCtx.highWatermark, currentBalance),
    ...overrides
  };
}

function makeState(currentBalance: number, overrides: Partial<AccountState> = {}): AccountState {
  return {
    ...defaultAccountState,
    startingBalance: 25000,
    currentBalance,
    highWatermark: Math.max(25000, currentBalance),
    highestEndOfDayBalance: Math.max(25000, currentBalance),
    lastUpdated: '2026-07-09T00:00:00.000Z',
    ...overrides
  };
}

function drawdownRemaining(ctx: RiskContext): number {
  return calculateDrawdownRemaining(ctx.maxDrawdown, calculateDrawdownUsed(ctx));
}

describe('robust trader-safety audit - survival sequences', () => {
  it('steps down risk before an approved loss can breach the fixed drawdown failure balance', () => {
    const sequence = [25000, 24850, 24700, 24550, 24400, 24250, 24100, 24000].map((balance) => {
      const ctx = ctxAtBalance(balance);
      const approval = calculateTradeApproval({ ctx, setup: auditSetup, pointValue: 2 });
      return {
        balance,
        drawdownRemaining: drawdownRemaining(ctx),
        mode: calculateRiskMode(ctx),
        recommendedRisk: calculateRecommendedRisk(ctx),
        approval: approval.approval,
        potentialLoss: approval.potentialLoss
      };
    });

    expect(sequence).toEqual([
      { balance: 25000, drawdownRemaining: 1000, mode: 'normal', recommendedRisk: 150, approval: 'APPROVED', potentialLoss: 150 },
      { balance: 24850, drawdownRemaining: 850, mode: 'normal', recommendedRisk: 150, approval: 'APPROVED', potentialLoss: 150 },
      { balance: 24700, drawdownRemaining: 700, mode: 'normal', recommendedRisk: 150, approval: 'APPROVED', potentialLoss: 150 },
      { balance: 24550, drawdownRemaining: 550, mode: 'normal', recommendedRisk: 150, approval: 'APPROVED', potentialLoss: 150 },
      { balance: 24400, drawdownRemaining: 400, mode: 'normal', recommendedRisk: 150, approval: 'APPROVED', potentialLoss: 150 },
      { balance: 24250, drawdownRemaining: 250, mode: 'minimum', recommendedRisk: 25, approval: 'REJECTED - INVALID INPUT', potentialLoss: 0 },
      { balance: 24100, drawdownRemaining: 100, mode: 'stop', recommendedRisk: 0, approval: 'REJECTED - DRAWDOWN LIMIT', potentialLoss: 0 },
      { balance: 24000, drawdownRemaining: 0, mode: 'stop', recommendedRisk: 0, approval: 'REJECTED - ACCOUNT BLOWN', potentialLoss: 0 }
    ]);
  });

  it('prevents a fourth full daily-loss day from blowing the account', () => {
    const dayStarts = [
      { day: 1, balance: 25000, dailyPnl: -300 },
      { day: 2, balance: 24700, dailyPnl: -300 },
      { day: 3, balance: 24400, dailyPnl: -300 },
      { day: 4, balance: 24100, dailyPnl: 0 }
    ].map((day) => {
      const ctx = ctxAtBalance(day.balance, { dailyPnl: day.dailyPnl });
      return {
        day: day.day,
        balance: day.balance,
        dailyRiskRemaining: calculateDailyRiskRemaining(ctx.dailyMaxLoss, ctx.dailyPnl),
        drawdownRemaining: drawdownRemaining(ctx),
        mode: calculateRiskMode(ctx),
        recommendedRisk: calculateRecommendedRisk(ctx),
        status: buildTradingStatus(ctx)
      };
    });

    expect(dayStarts).toEqual([
      { day: 1, balance: 25000, dailyRiskRemaining: 0, drawdownRemaining: 1000, mode: 'stop', recommendedRisk: 0, status: 'STOP TRADING TODAY' },
      { day: 2, balance: 24700, dailyRiskRemaining: 0, drawdownRemaining: 700, mode: 'stop', recommendedRisk: 0, status: 'STOP TRADING TODAY' },
      { day: 3, balance: 24400, dailyRiskRemaining: 0, drawdownRemaining: 400, mode: 'stop', recommendedRisk: 0, status: 'STOP TRADING TODAY' },
      { day: 4, balance: 24100, dailyRiskRemaining: 300, drawdownRemaining: 100, mode: 'stop', recommendedRisk: 0, status: 'STOP TRADING TODAY' }
    ]);
  });

  it('maps fixed drawdown thresholds to the expected risk modes and risk caps', () => {
    const thresholds = [1000, 750, 500, 300, 150, 50, 0].map((remaining) => {
      const ctx = ctxAtBalance(25000 - (1000 - remaining));
      return {
        remaining,
        mode: calculateRiskMode(ctx),
        recommendedRisk: calculateRecommendedRisk(ctx)
      };
    });

    expect(thresholds).toEqual([
      { remaining: 1000, mode: 'normal', recommendedRisk: 150 },
      { remaining: 750, mode: 'normal', recommendedRisk: 150 },
      { remaining: 500, mode: 'normal', recommendedRisk: 150 },
      { remaining: 300, mode: 'minimum', recommendedRisk: 25 },
      { remaining: 150, mode: 'stop', recommendedRisk: 0 },
      { remaining: 50, mode: 'stop', recommendedRisk: 0 },
      { remaining: 0, mode: 'stop', recommendedRisk: 0 }
    ]);
  });
});

describe('robust trader-safety audit - functional and adversarial checks', () => {
  it('keeps house-money mode off from increasing daily risk after profit', () => {
    const profitableDayCtx = ctxAtBalance(25300, { dailyPnl: 300, monthlyPnl: 300 });

    expect(profitableDayCtx.houseMoneyMode).toBe(false);
    expect(calculateDailyRiskRemaining(profitableDayCtx.dailyMaxLoss, profitableDayCtx.dailyPnl)).toBe(300);
    expect(calculateRecommendedRisk(profitableDayCtx)).toBe(150);
  });

  it('rejects invalid and extreme trade setups without rounding contracts up', () => {
    const invalidSetups: TradeSetup[] = [
      { instrument: 'MNQ', direction: 'long', entry: 0, stop: 21970 },
      { instrument: 'MNQ', direction: 'long', entry: -1, stop: 21970 },
      { instrument: 'MNQ', direction: 'long', entry: Number.NaN, stop: 21970 },
      { instrument: 'MNQ', direction: 'long', entry: 22000, stop: 22000 }
    ];

    for (const setup of invalidSetups) {
      expect(validateTradeSetup(setup).valid).toBe(false);
      expect(calculateTradeApproval({ ctx: baseCtx, setup, pointValue: 2 }).approval).toBe('REJECTED - INVALID INPUT');
    }

    const wideStopApproval = calculateTradeApproval({
      ctx: baseCtx,
      setup: { instrument: 'MNQ', direction: 'long', entry: 22000, stop: 21800 },
      pointValue: 2
    });

    expect(wideStopApproval.riskPerContract).toBe(400);
    expect(wideStopApproval.contractsAllowed).toBe(0);
    expect(wideStopApproval.approval).toBe('REJECTED - INVALID INPUT');
  });
});

describe('robust trader-safety audit - funded and payout protection', () => {
  it('uses the 5 percent target as the funded baseline and keeps payout profit post-target only', () => {
    const belowTarget = promoteEvaluationAccount(makeState(26249.99), defaultAccountConfig, true, () => '2026-07-09T12:00:00.000Z');
    const atTarget = promoteEvaluationAccount(makeState(26250), defaultAccountConfig, true, () => '2026-07-09T12:00:00.000Z');
    const payoutReady = makeState(27250, { phase: 'funded', fundedBaseline: 26250 });

    expect(belowTarget.phase).toBe('evaluation');
    expect(calculatePayoutEligibleProfit(belowTarget, defaultAccountConfig)).toBe(0);
    expect(atTarget.phase).toBe('funded');
    expect(atTarget.fundedBaseline).toBe(26250);
    expect(calculatePayoutEligibleProfit(atTarget, defaultAccountConfig)).toBe(0);
    expect(calculatePayoutEligibleProfit(payoutReady, defaultAccountConfig)).toBe(1000);
  });

  it('keeps payout status out of evaluation and applies protection only to funded-style phases', () => {
    expect(
      calculatePayoutStatus({
        fundedProfit: 1000,
        maxPayoutAmount: 1000,
        payoutPending: true,
        payoutsTaken: 0,
        maxPayouts: 5,
        accountPhase: 'evaluation'
      })
    ).toBe('Not ready');

    const pendingCtx = ctxAtBalance(27250, {
      accountPhase: 'funded',
      fundedProfit: 1000,
      payoutPending: true,
      monthlyPnl: 0
    });
    const approval = calculateTradeApproval({
      ctx: pendingCtx,
      setup: { instrument: 'MNQ', direction: 'long', entry: 22000, stop: 21987.5 },
      pointValue: 2
    });

    expect(calculateRiskMode(pendingCtx)).toBe('minimum');
    expect(calculateRecommendedRisk(pendingCtx)).toBe(25);
    expect(approval.potentialLoss).toBe(25);
    expect(approval.approval).toBe('APPROVED WITH REDUCED SIZE');
  });

  it('floors payout-eligible profit at zero after a funded account drops below baseline', () => {
    const fundedDrawdown = makeState(26100, {
      phase: 'funded',
      fundedAt: '2026-07-09T12:00:00.000Z',
      fundedBaseline: 26250
    });

    expect(calculatePayoutEligibleProfit(fundedDrawdown, defaultAccountConfig)).toBe(0);
  });
});
