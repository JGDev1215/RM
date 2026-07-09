import type { Route } from '../app/App';
import type { useRiskGuardState } from '../app/useRiskGuardState';
import { Card } from '../components/Card';
import { formatMoney } from '../components/MoneyValue';
import { MetricCard } from '../components/MetricCard';
import { MarketDataCard } from '../components/MarketDataCard';
import { PillBadge } from '../components/PillBadge';
import { StatusCard } from '../components/StatusCard';
import type { MarketDataState } from '../data/marketData';
import type { useCloudSync } from '../app/useCloudSync';
import { calculateDrawdownRemaining, calculateDrawdownUsed } from '../logic/drawdownLogic';
import { calculateNetPayout, calculatePayoutStatus } from '../logic/payoutLogic';
import { buildRiskReason, buildTradingStatus, calculateRecommendedRisk, calculateRiskMode } from '../logic/riskEngine';
import { modeLabel, modeVariant, percent, phaseLabel } from './screenUtils';

type Props = ReturnType<typeof useRiskGuardState> & { cloud: ReturnType<typeof useCloudSync>; marketFeed: MarketDataState & { refresh: () => Promise<void> }; navigate: (route: Route) => void };

export function DashboardScreen(props: Props) {
  const mode = calculateRiskMode(props.riskContext);
  const recommendedRisk = calculateRecommendedRisk(props.riskContext);
  const drawdownUsed = calculateDrawdownUsed(props.riskContext);
  const drawdownRemaining = calculateDrawdownRemaining(props.config.maxDrawdown, drawdownUsed);
  const consistency = props.consistencyStats;
  const payoutStatus = calculatePayoutStatus({
    fundedProfit: props.fundedProfit,
    maxPayoutAmount: props.config.maxPayoutAmount,
    payoutPending: props.accountState.payoutPending,
    payoutsTaken: props.monthlyStats.payoutsTaken,
    maxPayouts: props.config.maxPayouts,
    accountPhase: props.accountState.phase,
    logs: props.payouts
  });

  return (
    <div className="screen">
      <header className="screen-header">
        <h1>RiskGuard Trader</h1>
        <PillBadge label={phaseLabel(props.accountState.phase)} variant={modeVariant(mode)} />
      </header>
      <Card>
        <div className="row">
          <div>
            <p className="eyebrow">Cloud Storage</p>
            <p className="muted">{props.cloud.message ?? `Supabase ${props.cloud.status}`}</p>
          </div>
          <div className="row">
            <button className="icon-button" type="button" title="Save to Supabase" onClick={() => void props.cloud.saveNow()}>Save</button>
            <button className="icon-button" type="button" title="Lock app" onClick={props.cloud.lock}>Lock</button>
          </div>
        </div>
      </Card>
      <StatusCard status={buildTradingStatus(props.riskContext)} reason={buildRiskReason(props.riskContext)} variant={modeVariant(mode)} />
      <MarketDataCard feed={props.marketFeed} />
      <MetricCard label="Daily Risk" value={`${formatMoney(props.dailyStats.riskRemaining)} left`} subvalue={`${formatMoney(props.dailyStats.lossUsed)} used of ${formatMoney(props.config.dailyMaxLoss)}`} progress={props.dailyStats.lossUsed / props.config.dailyMaxLoss} variant={props.dailyStats.riskRemaining <= 0 ? 'red' : 'green'} />
      <MetricCard label="Drawdown Protection" value={`${formatMoney(drawdownRemaining)} left`} subvalue={`${formatMoney(drawdownUsed)} used of ${formatMoney(props.config.maxDrawdown)}`} progress={drawdownUsed / props.config.maxDrawdown} variant={drawdownRemaining <= 300 ? 'red' : 'amber'} footer={drawdownRemaining < 300 ? 'Drawdown remaining is below $300.' : undefined} />
      <MetricCard label="Recommended Risk" value={formatMoney(recommendedRisk)} subvalue={`${modeLabel(mode)} risk mode`} footer={buildRiskReason(props.riskContext)} variant={modeVariant(mode)} />
      <MetricCard label="Monthly Target" value={formatMoney(props.monthlyStats.pnl)} subvalue={`${percent(props.monthlyStats.targetProgress)} of ${formatMoney(props.config.monthlyTarget)}`} progress={props.monthlyStats.targetProgress} variant={props.monthlyStats.targetProgress >= 0.5 ? 'blue' : 'green'} />
      <MetricCard
        label="Consistency Rule"
        value={percent(consistency.consistencyPercentage)}
        subvalue={`${formatMoney(consistency.largestSingleDayProfit)} biggest day of ${formatMoney(consistency.accountProfit)} profit`}
        progress={consistency.consistencyPercentage / consistency.threshold}
        variant={consistency.isPassing ? 'green' : 'red'}
        footer={`Must stay at or below ${percent(consistency.threshold)} to upgrade. Max day allowed now: ${formatMoney(consistency.maxAllowedSingleDayProfit)}.`}
      />
      <Card>
        <div className="row">
          <div>
            <p className="eyebrow">Payout Tracker</p>
            <div className="metric-value">{props.monthlyStats.payoutsTaken} of {props.config.maxPayouts}</div>
            <p className="subvalue">Next target {formatMoney(props.config.maxPayoutAmount)} gross, {formatMoney(calculateNetPayout(props.config.maxPayoutAmount, props.config.profitSplit))} net</p>
          </div>
          <PillBadge label={payoutStatus} variant={payoutStatus === 'Available' || payoutStatus === 'Pending' ? 'blue' : 'grey'} />
        </div>
      </Card>
      <div className="grid-two">
        <button className="secondary-button" type="button" onClick={() => props.navigate('engine')}>Risk Engine</button>
        <button className="secondary-button" type="button" onClick={() => props.navigate('restart')}>Restart Tracker</button>
      </div>
    </div>
  );
}
