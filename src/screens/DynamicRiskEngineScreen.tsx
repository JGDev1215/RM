import type { RiskContext } from '../data/types';
import { defaultRiskAmounts } from '../data/defaults';
import { Card } from '../components/Card';
import { formatMoney } from '../components/MoneyValue';
import { MetricCard } from '../components/MetricCard';
import { calculateRecommendedRisk, calculateRiskMode, buildRiskReason } from '../logic/riskEngine';
import { modeLabel, modeVariant } from './screenUtils';

const modes = [
  ['normal', 'Used when monthly target progress is below 25%.'],
  ['reduced', 'Used after strong early profit, weekly progress, or a 2R+ win.'],
  ['protection', 'Used near payout, payout pending, or above 50% monthly target.'],
  ['minimum', 'Used after 75% monthly target, 2 payouts achieved, or very low drawdown remaining.'],
  ['stop', 'Used when daily limit hit, drawdown breached, or account blown.']
] as const;

export function DynamicRiskEngineScreen({ riskContext }: { riskContext: RiskContext }) {
  const mode = calculateRiskMode(riskContext);
  return (
    <div className="screen">
      <header className="screen-header"><h1>Risk Engine</h1></header>
      <MetricCard label="Current Mode" value={modeLabel(mode)} subvalue={`${formatMoney(calculateRecommendedRisk(riskContext))} recommended · ${buildRiskReason(riskContext)}`} variant={modeVariant(mode)} />
      {modes.map(([id, description]) => (
        <Card key={id} variant={id === mode ? modeVariant(id) : 'default'}>
          <div className="row">
            <div>
              <h3>{modeLabel(id)}</h3>
              <p className="muted">{description}</p>
            </div>
            <strong>{formatMoney(defaultRiskAmounts[id])}</strong>
          </div>
        </Card>
      ))}
    </div>
  );
}
