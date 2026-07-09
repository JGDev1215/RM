import type { useRiskGuardState } from '../app/useRiskGuardState';
import { Card } from '../components/Card';
import { formatMoney } from '../components/MoneyValue';
import { MetricCard } from '../components/MetricCard';
import { PillBadge } from '../components/PillBadge';
import { calculateNetPayout, calculatePayoutStatus } from '../logic/payoutLogic';

type Props = ReturnType<typeof useRiskGuardState>;

export function PayoutTrackerScreen(props: Props) {
  const status = calculatePayoutStatus({
    fundedProfit: props.fundedProfit,
    maxPayoutAmount: props.config.maxPayoutAmount,
    payoutPending: props.accountState.payoutPending,
    payoutsTaken: props.monthlyStats.payoutsTaken,
    maxPayouts: props.config.maxPayouts,
    accountPhase: props.accountState.phase,
    logs: props.payouts
  });
  const remaining = Math.max(0, props.config.maxPayoutAmount - props.fundedProfit);
  return (
    <div className="screen">
      <header className="screen-header"><h1>Payout Tracker</h1><PillBadge label={status} variant={status === 'Available' || status === 'Pending' ? 'blue' : 'grey'} /></header>
      <MetricCard label="Next Payout" value={formatMoney(props.fundedProfit)} subvalue={`${formatMoney(remaining)} remaining to unlock payout`} progress={props.fundedProfit / props.config.maxPayoutAmount} variant={status === 'Available' ? 'blue' : 'green'} />
      <MetricCard label="Payout Value" value={formatMoney(props.config.maxPayoutAmount)} subvalue={`${formatMoney(calculateNetPayout(props.config.maxPayoutAmount, props.config.profitSplit))} net after ${Math.round(props.config.profitSplit * 100)}% split · Monthly goal 2-3 payouts`} />
      <Card>
        <p className="eyebrow">Payout Count</p>
        <div className="metric-value">{props.monthlyStats.payoutsTaken}/{props.config.maxPayouts}</div>
        <p className="subvalue">{props.config.maxPayouts - props.monthlyStats.payoutsTaken} payouts remaining</p>
        <div className="dot-row">{Array.from({ length: props.config.maxPayouts }).map((_, index) => <span key={index} className={index < props.monthlyStats.payoutsTaken ? 'dot filled' : 'dot'} />)}</div>
      </Card>
      {(status === 'Available' || status === 'Pending') ? <Card variant="blue"><h3>Protection Warning</h3><p className="muted">Once payout is available, reduce risk. Do not risk losing payout eligibility.</p></Card> : null}
    </div>
  );
}
