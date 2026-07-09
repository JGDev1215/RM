import type { ConsistencyStats, DailyStats, MonthlyStats, TradeLog, WeeklyStats } from '../data/types';
import { calculateDailyRiskRemaining, calculateMonthlyTargetProgress, calculateWeeklyTargetProgress } from './riskEngine';

function toDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function weekBounds(date = new Date()): { start: Date; end: Date } {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  const start = new Date(copy);
  start.setDate(copy.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function calculateDailyStats(trades: TradeLog[], dailyMaxLoss: number, date = new Date()): DailyStats {
  const key = toDateKey(date);
  const dayTrades = trades.filter((trade) => trade.date === key);
  const pnl = dayTrades.reduce((sum, trade) => sum + trade.actualPnl, 0);
  return {
    date: key,
    pnl,
    lossUsed: pnl < 0 ? Math.abs(pnl) : 0,
    riskRemaining: calculateDailyRiskRemaining(dailyMaxLoss, pnl),
    trades: dayTrades
  };
}

export function calculateWeeklyStats(trades: TradeLog[], weeklyTarget: number, date = new Date()): WeeklyStats {
  const { start, end } = weekBounds(date);
  const weekTrades = trades.filter((trade) => {
    const tradeDate = new Date(`${trade.date}T12:00:00`);
    return tradeDate >= start && tradeDate <= end;
  });
  const pnl = weekTrades.reduce((sum, trade) => sum + trade.actualPnl, 0);
  return {
    weekStart: toDateKey(start),
    weekEnd: toDateKey(end),
    pnl,
    targetProgress: calculateWeeklyTargetProgress(pnl, weeklyTarget),
    hasHighRTrade: weekTrades.some((trade) => trade.rMultiple >= 2)
  };
}

export function calculateMonthlyStats(trades: TradeLog[], monthlyTarget: number, payoutsTaken = 0, date = new Date()): MonthlyStats {
  const month = date.toISOString().slice(0, 7);
  const monthTrades = trades.filter((trade) => trade.date.startsWith(month));
  const pnl = monthTrades.reduce((sum, trade) => sum + trade.actualPnl, 0);
  return {
    month,
    pnl,
    targetProgress: calculateMonthlyTargetProgress(pnl, monthlyTarget),
    payoutsTaken
  };
}

export function hasHighRTradeThisWeek(trades: TradeLog[], date = new Date()): boolean {
  return calculateWeeklyStats(trades, 1, date).hasHighRTrade;
}

export function calculateConsistencyStats(
  trades: TradeLog[],
  accountProfit: number,
  threshold = 0.5
): ConsistencyStats {
  const dailyProfit = trades.reduce<Record<string, number>>((byDate, trade) => {
    byDate[trade.date] = (byDate[trade.date] ?? 0) + trade.actualPnl;
    return byDate;
  }, {});
  const largestSingleDayProfit = Math.max(0, ...Object.values(dailyProfit));
  const positiveAccountProfit = Math.max(0, accountProfit);
  const consistencyPercentage = positiveAccountProfit > 0 ? largestSingleDayProfit / positiveAccountProfit : 0;

  return {
    accountProfit: positiveAccountProfit,
    largestSingleDayProfit,
    consistencyPercentage,
    maxAllowedSingleDayProfit: positiveAccountProfit * threshold,
    threshold,
    isPassing: positiveAccountProfit <= 0 || consistencyPercentage <= threshold
  };
}
