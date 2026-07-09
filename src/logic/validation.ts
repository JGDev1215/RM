import type { AccountConfig, TradeLog, TradeSetup } from '../data/types';

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function validateTradeSetup(setup: TradeSetup): ValidationResult {
  const errors: string[] = [];
  if (!isPositiveNumber(setup.entry)) errors.push('Entry price is required and must be greater than 0.');
  if (!isPositiveNumber(setup.stop)) errors.push('Stop loss price is required and must be greater than 0.');
  if (isPositiveNumber(setup.entry) && isPositiveNumber(setup.stop) && setup.entry === setup.stop) {
    errors.push('Entry and stop loss must be different.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateAccountConfig(config: AccountConfig): ValidationResult {
  const errors: string[] = [];
  if (!isPositiveNumber(config.accountSize)) errors.push('Account size must be greater than 0.');
  if (!isPositiveNumber(config.maxDrawdown)) errors.push('Max drawdown must be greater than 0.');
  if (!isPositiveNumber(config.dailyMaxLoss)) errors.push('Daily max loss must be greater than 0.');
  if (!isPositiveNumber(config.monthlyTarget)) errors.push('Monthly target must be greater than 0.');
  if (config.consistencyThreshold <= 0 || config.consistencyThreshold > 1) errors.push('Consistency max must be between 0 and 1.');
  if (config.profitSplit <= 0 || config.profitSplit > 1) errors.push('Profit split must be between 0 and 1.');
  return { valid: errors.length === 0, errors };
}

export function validateTradeLog(trade: TradeLog): ValidationResult {
  const setup = validateTradeSetup(trade);
  const errors = [...setup.errors];
  if (!Number.isFinite(trade.contracts) || trade.contracts < 1) errors.push('Contracts must be at least 1.');
  if (!Number.isFinite(trade.plannedRisk) || trade.plannedRisk <= 0) errors.push('Planned risk must be greater than 0.');
  if (!Number.isFinite(trade.actualPnl)) errors.push('Actual P&L must be numeric.');
  return { valid: errors.length === 0, errors };
}
