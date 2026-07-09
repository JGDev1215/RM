import type { AccountConfig, AccountState } from './types';

export const defaultAccountConfig: AccountConfig = {
  accountSize: 25000,
  evaluationTarget: 1250,
  consistencyThreshold: 0.5,
  maxDrawdown: 1000,
  dailyMaxLoss: 300,
  monthlyTarget: 4000,
  weeklyTarget: 1000,
  maxPayouts: 5,
  maxPayoutAmount: 1000,
  profitSplit: 0.9,
  houseMoneyMode: false,
  drawdownType: 'fixed',
  instruments: {
    MNQ: { symbol: 'MNQ', pointValue: 2, tickSize: 0.25, tickValue: 0.5 },
    NQ: { symbol: 'NQ', pointValue: 20, tickSize: 0.25, tickValue: 5 }
  }
};

export const defaultAccountState: AccountState = {
  phase: 'evaluation',
  startingBalance: 25000,
  currentBalance: 25000,
  highWatermark: 25000,
  highestEndOfDayBalance: 25000,
  dailyStartingBalance: 25000,
  lastUpdated: new Date().toISOString(),
  payoutPending: false
};

export const defaultRiskAmounts = {
  normal: 150,
  reduced: 75,
  protection: 50,
  minimum: 25,
  stop: 0
} as const;
