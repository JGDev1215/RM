import type { PayoutLog } from '../data/types';

export type PayoutStatus = 'Not ready' | 'Available' | 'Pending' | 'Protected' | 'Cycle complete';

export function calculateNetPayout(grossPayout: number, profitSplit: number): number {
  return grossPayout * profitSplit;
}

export function isPayoutAvailable(fundedProfit: number, maxPayoutAmount: number): boolean {
  return fundedProfit >= maxPayoutAmount;
}

export function calculatePayoutStatus(args: {
  fundedProfit: number;
  maxPayoutAmount: number;
  payoutPending: boolean;
  payoutsTaken: number;
  maxPayouts: number;
  logs?: PayoutLog[];
}): PayoutStatus {
  if (args.payoutsTaken >= args.maxPayouts) return 'Cycle complete';
  if (args.payoutPending || args.logs?.some((payout) => payout.status === 'requested')) return 'Pending';
  if (isPayoutAvailable(args.fundedProfit, args.maxPayoutAmount)) return 'Available';
  return 'Not ready';
}
