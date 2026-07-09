import type { RiskContext } from '../data/types';

export function calculateFixedDrawdownUsed(startingBalance: number, currentBalance: number): number {
  return Math.max(0, startingBalance - currentBalance);
}

export function calculateTrailingDrawdownUsed(highWatermark: number, currentBalance: number): number {
  return Math.max(0, highWatermark - currentBalance);
}

export function calculateEndOfDayLockedFloor(startingBalance: number, maxDrawdown: number): number {
  return startingBalance + 100;
}

export function calculateEndOfDayTrailBalance(startingBalance: number, maxDrawdown: number): number {
  return calculateEndOfDayLockedFloor(startingBalance, maxDrawdown) + maxDrawdown;
}

export function calculateEndOfDayDrawdownFloor(args: {
  startingBalance: number;
  maxDrawdown: number;
  highestEndOfDayBalance?: number;
  payoutPending?: boolean;
}): number {
  const startingFloor = args.startingBalance - args.maxDrawdown;
  const lockedFloor = calculateEndOfDayLockedFloor(args.startingBalance, args.maxDrawdown);
  if (args.payoutPending) return lockedFloor;

  const highestClosingBalance = Math.max(args.startingBalance, args.highestEndOfDayBalance ?? args.startingBalance);
  const trailingFloor = highestClosingBalance - args.maxDrawdown;
  return Math.min(Math.max(startingFloor, trailingFloor), lockedFloor);
}

export function calculateEndOfDayDrawdownUsed(args: {
  startingBalance: number;
  currentBalance: number;
  maxDrawdown: number;
  highestEndOfDayBalance?: number;
  payoutPending?: boolean;
}): number {
  const floor = calculateEndOfDayDrawdownFloor(args);
  return Math.max(0, args.maxDrawdown - (args.currentBalance - floor));
}

export function calculateDrawdownUsed(ctx: Pick<RiskContext, 'drawdownType' | 'startingBalance' | 'currentBalance' | 'highWatermark' | 'highestEndOfDayBalance' | 'maxDrawdown' | 'payoutPending'>): number {
  if (ctx.drawdownType === 'end_of_day') {
    return calculateEndOfDayDrawdownUsed(ctx);
  }
  if (ctx.drawdownType === 'trailing') {
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
