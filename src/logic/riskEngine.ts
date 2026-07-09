import { defaultRiskAmounts } from '../data/defaults';
import type { RiskContext, RiskMode, TradeApproval, TradeSetup } from '../data/types';
import { isFundedStylePhase } from './accountPhase';
import { calculateContractsAllowed, calculateRiskPerContract, calculateStopPoints } from './contractSizing';
import { calculateDrawdownRemaining, calculateDrawdownUsed } from './drawdownLogic';
import { isPayoutAvailable } from './payoutLogic';
import { validateTradeSetup } from './validation';

export function calculateDailyRiskRemaining(dailyMaxLoss: number, dailyPnl: number): number {
  if (dailyPnl >= 0) return dailyMaxLoss;
  return Math.max(0, dailyMaxLoss - Math.abs(dailyPnl));
}

export function calculateMonthlyTargetProgress(monthlyPnl: number, monthlyTarget: number): number {
  if (monthlyTarget <= 0) return 0;
  return Math.max(0, monthlyPnl / monthlyTarget);
}

export function calculateWeeklyTargetProgress(weeklyPnl: number, weeklyTarget: number): number {
  if (weeklyTarget <= 0) return 0;
  return Math.max(0, weeklyPnl / weeklyTarget);
}

export function calculateRiskMode(ctx: RiskContext): RiskMode {
  const drawdownRemaining = calculateDrawdownRemaining(ctx.maxDrawdown, calculateDrawdownUsed(ctx));
  const dailyRiskRemaining = calculateDailyRiskRemaining(ctx.dailyMaxLoss, ctx.dailyPnl);
  const monthlyProgress = calculateMonthlyTargetProgress(ctx.monthlyPnl, ctx.monthlyTarget);
  const weeklyProgress = calculateWeeklyTargetProgress(ctx.weeklyPnl, ctx.weeklyTarget);
  const isBeforeWednesday = ctx.dayOfWeek === 1 || ctx.dayOfWeek === 2;
  const payoutAvailable = isFundedStylePhase(ctx.accountPhase) && isPayoutAvailable(ctx.fundedProfit, ctx.maxPayoutAmount);
  const payoutPending = isFundedStylePhase(ctx.accountPhase) && ctx.payoutPending;

  if (ctx.accountPhase === 'restart_required') return 'stop';
  if (drawdownRemaining <= 0) return 'stop';
  if (dailyRiskRemaining <= 0) return 'stop';
  if (drawdownRemaining <= 150) return 'stop';
  if (drawdownRemaining <= 300) return 'minimum';
  if (payoutPending) return 'minimum';
  if (payoutAvailable) return 'protection';
  if (ctx.payoutsTaken >= ctx.maxPayouts) return 'minimum';
  if (ctx.payoutsTaken >= 2 && monthlyProgress >= 0.5) return 'minimum';
  if (monthlyProgress >= 0.75) return 'minimum';
  if (monthlyProgress >= 0.5) return 'protection';
  if (monthlyProgress >= 0.25) return 'reduced';
  if (weeklyProgress >= 1) return 'protection';
  if (isBeforeWednesday && weeklyProgress >= 0.5) return 'reduced';
  if (ctx.hasHighRTradeThisWeek) return 'reduced';
  return 'normal';
}

export function calculateRecommendedRisk(ctx: RiskContext): number {
  const mode = calculateRiskMode(ctx);
  const dailyRiskRemaining = calculateDailyRiskRemaining(ctx.dailyMaxLoss, ctx.dailyPnl);
  const drawdownRemaining = calculateDrawdownRemaining(ctx.maxDrawdown, calculateDrawdownUsed(ctx));
  return Math.max(0, Math.min(defaultRiskAmounts[mode], dailyRiskRemaining, drawdownRemaining));
}

export function buildRiskReason(ctx: RiskContext): string {
  const drawdownRemaining = calculateDrawdownRemaining(ctx.maxDrawdown, calculateDrawdownUsed(ctx));
  const dailyRiskRemaining = calculateDailyRiskRemaining(ctx.dailyMaxLoss, ctx.dailyPnl);
  const monthlyProgress = calculateMonthlyTargetProgress(ctx.monthlyPnl, ctx.monthlyTarget);
  const weeklyProgress = calculateWeeklyTargetProgress(ctx.weeklyPnl, ctx.weeklyTarget);
  const payoutAvailable = isFundedStylePhase(ctx.accountPhase) && isPayoutAvailable(ctx.fundedProfit, ctx.maxPayoutAmount);
  const payoutPending = isFundedStylePhase(ctx.accountPhase) && ctx.payoutPending;

  if (ctx.accountPhase === 'restart_required' || drawdownRemaining <= 0) return 'Account blown. Restart required.';
  if (dailyRiskRemaining <= 0) return 'Daily loss limit reached. No more trades today.';
  if (drawdownRemaining <= 150) return 'Drawdown protection triggered. Stop trading.';
  if (drawdownRemaining <= 300) return 'Drawdown remaining is low. Minimum risk only.';
  if (payoutPending) return 'Payout pending. Minimum risk protects eligibility.';
  if (payoutAvailable) return 'Payout available. Reduce risk and protect eligibility.';
  if (ctx.payoutsTaken >= ctx.maxPayouts) return 'Payout cycle complete. Preserve capital.';
  if (monthlyProgress >= 0.75) return 'Monthly target is mostly complete. Minimum risk protects profit.';
  if (monthlyProgress >= 0.5) return 'Monthly target is above 50%. Protect profits.';
  if (monthlyProgress >= 0.25) return 'Monthly progress is ahead. Risk is reduced.';
  if (weeklyProgress >= 1) return 'Weekly target reached. Protect the week.';
  if ((ctx.dayOfWeek === 1 || ctx.dayOfWeek === 2) && weeklyProgress >= 0.5) return 'Strong early-week profit. Risk reduced.';
  if (ctx.hasHighRTradeThisWeek) return 'A 2R+ trade is already captured this week.';
  return 'Risk is within normal limits.';
}

export function buildTradingStatus(ctx: RiskContext): string {
  const mode = calculateRiskMode(ctx);
  const payoutAvailable = isFundedStylePhase(ctx.accountPhase) && isPayoutAvailable(ctx.fundedProfit, ctx.maxPayoutAmount);
  const payoutPending = isFundedStylePhase(ctx.accountPhase) && ctx.payoutPending;
  if (mode === 'stop' && (ctx.accountPhase === 'restart_required' || calculateDrawdownRemaining(ctx.maxDrawdown, calculateDrawdownUsed(ctx)) <= 0)) {
    return 'ACCOUNT BLOWN / RESTART REQUIRED';
  }
  if (mode === 'stop') return 'STOP TRADING TODAY';
  if (mode === 'minimum' || mode === 'protection') return payoutAvailable || payoutPending ? 'PROTECT PROFITS' : 'REDUCE SIZE';
  if (mode === 'reduced') return 'REDUCE SIZE';
  return 'TRADE ALLOWED';
}

export function calculateTradeApproval(args: {
  ctx: RiskContext;
  setup: TradeSetup;
  pointValue: number;
}): {
  approval: TradeApproval;
  errors: string[];
  stopPoints: number;
  riskPerContract: number;
  recommendedRisk: number;
  contractsAllowed: number;
  potentialLoss: number;
  dailyRiskRemainingAfterTrade: number;
  drawdownRemainingAfterTrade: number;
} {
  const validation = validateTradeSetup(args.setup);
  const drawdownRemaining = calculateDrawdownRemaining(args.ctx.maxDrawdown, calculateDrawdownUsed(args.ctx));
  const dailyRiskRemaining = calculateDailyRiskRemaining(args.ctx.dailyMaxLoss, args.ctx.dailyPnl);
  const recommendedRisk = calculateRecommendedRisk(args.ctx);
  const stopPoints = validation.valid ? calculateStopPoints(args.setup.entry, args.setup.stop) : 0;
  const riskPerContract = calculateRiskPerContract(stopPoints, args.pointValue);
  const contractsAllowed = calculateContractsAllowed(recommendedRisk, riskPerContract);
  const potentialLoss = contractsAllowed * riskPerContract;

  let approval: TradeApproval = 'APPROVED';
  const errors = [...validation.errors];
  if (args.ctx.accountPhase === 'restart_required' || drawdownRemaining <= 0) approval = 'REJECTED - ACCOUNT BLOWN';
  else if (dailyRiskRemaining <= 0 || potentialLoss > dailyRiskRemaining) approval = 'REJECTED - DAILY LIMIT';
  else if (drawdownRemaining <= 150 || potentialLoss > drawdownRemaining) approval = 'REJECTED - DRAWDOWN LIMIT';
  else if (!validation.valid) approval = 'REJECTED - INVALID INPUT';
  else if (contractsAllowed < 1) {
    approval = 'REJECTED - INVALID INPUT';
    errors.push('Stop is too wide for current risk allowance.');
  } else if (isFundedStylePhase(args.ctx.accountPhase) && args.ctx.payoutPending && potentialLoss > 25) approval = 'REJECTED - PAYOUT PROTECTION';
  else if (calculateRiskMode(args.ctx) !== 'normal') approval = 'APPROVED WITH REDUCED SIZE';

  return {
    approval,
    errors,
    stopPoints,
    riskPerContract,
    recommendedRisk,
    contractsAllowed,
    potentialLoss,
    dailyRiskRemainingAfterTrade: Math.max(0, dailyRiskRemaining - potentialLoss),
    drawdownRemainingAfterTrade: drawdownRemaining - potentialLoss
  };
}
