import { useEffect, useMemo, useState } from 'react';
import { defaultAccountConfig, defaultAccountState } from '../data/defaults';
import type { CloudSnapshot } from '../data/cloudSnapshot';
import type { AccountConfig, AccountState, PayoutLog, RiskContext, TradeLog } from '../data/types';
import { calculateDailyStats, calculateMonthlyStats, calculateWeeklyStats } from '../logic/stats';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { loadFromStorage, removeFromStorage, saveToStorage } from '../storage/localStorage';

export function useRiskGuardState() {
  const [config, setConfig] = useState<AccountConfig>(() => loadFromStorage(STORAGE_KEYS.accountConfig, defaultAccountConfig));
  const [accountState, setAccountState] = useState<AccountState>(() => loadFromStorage(STORAGE_KEYS.accountState, defaultAccountState));
  const [trades, setTrades] = useState<TradeLog[]>(() => loadFromStorage(STORAGE_KEYS.trades, []));
  const [payouts, setPayouts] = useState<PayoutLog[]>(() => loadFromStorage(STORAGE_KEYS.payouts, []));

  useEffect(() => saveToStorage(STORAGE_KEYS.accountConfig, config), [config]);
  useEffect(() => saveToStorage(STORAGE_KEYS.accountState, accountState), [accountState]);
  useEffect(() => saveToStorage(STORAGE_KEYS.trades, trades), [trades]);
  useEffect(() => saveToStorage(STORAGE_KEYS.payouts, payouts), [payouts]);

  const paidPayouts = payouts.filter((payout) => payout.status === 'paid').length;
  const dailyStats = useMemo(() => calculateDailyStats(trades, config.dailyMaxLoss), [trades, config.dailyMaxLoss]);
  const weeklyStats = useMemo(() => calculateWeeklyStats(trades, config.weeklyTarget), [trades, config.weeklyTarget]);
  const monthlyStats = useMemo(() => calculateMonthlyStats(trades, config.monthlyTarget, paidPayouts), [trades, config.monthlyTarget, paidPayouts]);
  const fundedProfit = Math.max(0, accountState.currentBalance - accountState.startingBalance);
  const cloudSnapshot = useMemo<CloudSnapshot>(() => ({
    accountConfig: config,
    accountState,
    trades,
    payouts
  }), [config, accountState, trades, payouts]);

  const riskContext: RiskContext = {
    accountPhase: accountState.phase,
    accountSize: config.accountSize,
    currentBalance: accountState.currentBalance,
    startingBalance: accountState.startingBalance,
    highWatermark: accountState.highWatermark,
    maxDrawdown: config.maxDrawdown,
    drawdownType: config.drawdownType,
    dailyMaxLoss: config.dailyMaxLoss,
    dailyPnl: dailyStats.pnl,
    weeklyPnl: weeklyStats.pnl,
    monthlyPnl: monthlyStats.pnl,
    monthlyTarget: config.monthlyTarget,
    weeklyTarget: config.weeklyTarget,
    fundedProfit,
    payoutPending: accountState.payoutPending,
    payoutsTaken: paidPayouts,
    maxPayouts: config.maxPayouts,
    maxPayoutAmount: config.maxPayoutAmount,
    hasHighRTradeThisWeek: weeklyStats.hasHighRTrade,
    dayOfWeek: new Date().getDay(),
    houseMoneyMode: config.houseMoneyMode
  };

  function addTrade(trade: TradeLog) {
    setTrades((current) => [trade, ...current]);
    setAccountState((state) => {
      const currentBalance = state.currentBalance + trade.actualPnl;
      return {
        ...state,
        currentBalance,
        highWatermark: Math.max(state.highWatermark, currentBalance),
        lastUpdated: new Date().toISOString()
      };
    });
  }

  function resetAccountStateOnly() {
    setAccountState({ ...defaultAccountState, startingBalance: config.accountSize, currentBalance: config.accountSize, highWatermark: config.accountSize, dailyStartingBalance: config.accountSize });
  }

  function resetAppData() {
    Object.values(STORAGE_KEYS).forEach(removeFromStorage);
    setConfig(defaultAccountConfig);
    setAccountState(defaultAccountState);
    setTrades([]);
    setPayouts([]);
  }

  function getSnapshot(): CloudSnapshot {
    return {
      ...cloudSnapshot,
      savedAt: new Date().toISOString()
    };
  }

  function applySnapshot(snapshot: CloudSnapshot) {
    if (snapshot.accountConfig) setConfig(snapshot.accountConfig);
    if (snapshot.accountState) setAccountState(snapshot.accountState);
    if (Array.isArray(snapshot.trades)) setTrades(snapshot.trades);
    if (Array.isArray(snapshot.payouts)) setPayouts(snapshot.payouts);
  }

  return {
    config,
    setConfig,
    accountState,
    setAccountState,
    trades,
    addTrade,
    payouts,
    setPayouts,
    dailyStats,
    weeklyStats,
    monthlyStats,
    fundedProfit,
    riskContext,
    cloudSnapshot,
    resetAccountStateOnly,
    resetAppData,
    getSnapshot,
    applySnapshot
  };
}
