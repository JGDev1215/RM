import { useState } from 'react';
import type { AccountConfig, Direction, InstrumentSymbol, RiskContext } from '../data/types';
import { Card } from '../components/Card';
import { formatMoney } from '../components/MoneyValue';
import { MetricCard } from '../components/MetricCard';
import { NumberInput } from '../components/NumberInput';
import { PillBadge } from '../components/PillBadge';
import { SegmentedControl } from '../components/SegmentedControl';
import { calculateTradeApproval } from '../logic/riskEngine';

export function RiskCalculatorScreen({ config, riskContext }: { config: AccountConfig; riskContext: RiskContext }) {
  const [instrument, setInstrument] = useState<InstrumentSymbol>('MNQ');
  const [direction, setDirection] = useState<Direction>('long');
  const [entry, setEntry] = useState(22000);
  const [stop, setStop] = useState(21970);
  const [calculated, setCalculated] = useState(true);
  const result = calculateTradeApproval({ ctx: riskContext, setup: { instrument, direction, entry, stop }, pointValue: config.instruments[instrument]?.pointValue ?? 0 });
  const rejected = result.approval.startsWith('REJECTED');

  return (
    <div className="screen">
      <header className="screen-header"><h1>Risk Calculator</h1><PillBadge label={instrument} variant="grey" /></header>
      <Card className="form-card">
        <SegmentedControl label="Instrument" value={instrument} onChange={setInstrument} options={[{ label: 'MNQ', value: 'MNQ' }, { label: 'NQ', value: 'NQ' }]} />
        <SegmentedControl label="Direction" value={direction} onChange={setDirection} options={[{ label: 'Long', value: 'long' }, { label: 'Short', value: 'short' }]} />
        <NumberInput label="Entry Price" value={entry} onChange={setEntry} />
        <NumberInput label="Stop Loss Price" value={stop} onChange={setStop} />
        <button className="primary-button" type="button" onClick={() => setCalculated(true)}>Calculate Trade Size</button>
      </Card>
      {calculated ? (
        <>
          <MetricCard label="Trade Decision" value={result.approval} subvalue={result.errors[0] ?? 'Decision uses daily loss, drawdown, payout, and risk mode.'} variant={rejected ? 'red' : result.approval.includes('REDUCED') ? 'amber' : 'green'} />
          <div className="grid-two">
            <MetricCard label="Stop Points" value={result.stopPoints.toFixed(2)} />
            <MetricCard label="Risk / Contract" value={formatMoney(result.riskPerContract, 2)} />
            <MetricCard label="Contracts" value={String(result.contractsAllowed)} />
            <MetricCard label="Potential Loss" value={formatMoney(result.potentialLoss, 2)} />
          </div>
          <MetricCard label="After Trade" value={`${formatMoney(result.dailyRiskRemainingAfterTrade)} daily left`} subvalue={`${formatMoney(result.drawdownRemainingAfterTrade)} drawdown left`} />
        </>
      ) : null}
    </div>
  );
}
