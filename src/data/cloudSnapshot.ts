import type { AccountConfig, AccountState, PayoutLog, TradeLog } from './types';

export type CloudSnapshot = {
  accountConfig?: AccountConfig;
  accountState?: AccountState;
  trades?: TradeLog[];
  payouts?: PayoutLog[];
  savedAt?: string;
};
