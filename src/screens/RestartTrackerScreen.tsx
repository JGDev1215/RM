import type { AccountConfig, RiskContext } from '../data/types';
import { Card } from '../components/Card';
import { formatMoney } from '../components/MoneyValue';
import { StatusCard } from '../components/StatusCard';
import { calculateDrawdownRemaining, calculateDrawdownUsed } from '../logic/drawdownLogic';

export function RestartTrackerScreen({ config, riskContext }: { config: AccountConfig; riskContext: RiskContext }) {
  const used = calculateDrawdownUsed(riskContext);
  const remaining = calculateDrawdownRemaining(config.maxDrawdown, used);
  const blown = remaining <= 0 || riskContext.accountPhase === 'restart_required';

  return (
    <div className="screen">
      <header className="screen-header"><h1>Restart Tracker</h1></header>
      <StatusCard status={blown ? 'RESTART REQUIRED' : 'RESTART WATCH'} reason={blown ? 'Max drawdown reached. This account can no longer be traded.' : `${formatMoney(remaining)} drawdown remaining.`} variant={blown ? 'red' : 'amber'} />
      <Card>
        <p className="eyebrow">Account Status</p>
        <div className="metric-value">{blown ? 'Blown' : 'Active'}</div>
        <p className="subvalue">Reason: {blown ? 'Max drawdown reached' : 'Drawdown protection active'}</p>
        <p className="muted">Evaluation target to pass again: {formatMoney(config.evaluationTarget)}</p>
      </Card>
      <Card variant={blown ? 'red' : 'amber'}><h3>Recommended Action</h3><p className="muted">{blown ? 'Stop trading this account. Reset and re-qualify before risking further capital.' : 'Keep risk small and avoid any trade that could breach drawdown.'}</p></Card>
      <Card>
        <p className="eyebrow">Restart Checklist</p>
        <div className="list">
          <p>1. Reset account</p>
          <p>2. Pass evaluation target - {formatMoney(config.evaluationTarget)}</p>
          <p>3. Return to funded mode</p>
          <p>4. Re-enable payout tracker</p>
        </div>
      </Card>
    </div>
  );
}
