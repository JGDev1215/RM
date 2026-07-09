import type { RiskContext } from '../data/types';

export function calculateFixedDrawdownUsed(startingBalance: number, currentBalance: number): number {
  return Math.max(0, startingBalance - currentBalance);
}

export function calculateTrailingDrawdownUsed(highWatermark: number, currentBalance: number): number {
  return Math.max(0, highWatermark - currentBalance);
}

export function calculateDrawdownUsed(ctx: Pick<RiskContext, 'drawdownType' | 'startingBalance' | 'currentBalance' | 'highWatermark'>): number {
  if (ctx.drawdownType === 'trailing' || ctx.drawdownType === 'end_of_day') {
    return calculateTrailingDrawdownUsed(ctx.highWatermark, ctx.currentBalance);
  }
  return calculateFixedDrawdownUsed(ctx.startingBalance, ctx.currentBalance);
}

export function calculateDrawdownRemaining(maxDrawdown: number, drawdownUsed: number): number {
  return maxDrawdown - drawdownUsed;
}

export function isAccountBlown(maxDrawdown: number, drawdownUsed: number): boolean {
  return calculateDrawdownRemaining(maxDrawdown, drawdownUsed) <= 0;
}
