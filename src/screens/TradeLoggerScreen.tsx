import { useState } from 'react';
import type { AccountConfig, Direction, InstrumentSymbol, RiskContext, TradeLog } from '../data/types';
import { Card } from '../components/Card';
import { formatMoney } from '../components/MoneyValue';
import { MetricCard } from '../components/MetricCard';
import { NumberInput } from '../components/NumberInput';
import { PillBadge } from '../components/PillBadge';
import { SegmentedControl } from '../components/SegmentedControl';
import { calculateRecommendedRisk, calculateRiskMode } from '../logic/riskEngine';
import { modeLabel, modeVariant } from './screenUtils';

export function TradeLoggerScreen({ config, trades, addTrade, riskContext }: { config: AccountConfig; trades: TradeLog[]; addTrade: (trade: TradeLog) => void; riskContext: RiskContext }) {
  const [instrument, setInstrument] = useState<InstrumentSymbol>('MNQ');
  const [direction, setDirection] = useState<Direction>('long');
  const [entry, setEntry] = useState(22000);
  const [stop, setStop] = useState(21970);
  const [exit, setExit] = useState(22030);
  const [contracts, setContracts] = useState(1);
  const [plannedRisk, setPlannedRisk] = useState(calculateRecommendedRisk(riskContext));
  const [actualPnl, setActualPnl] = useState(300);
  const [notes, setNotes] = useState('');
  const rMultiple = plannedRisk > 0 ? actualPnl / plannedRisk : 0;
  const mode = calculateRiskMode(riskContext);

  function saveTrade() {
    const trade: TradeLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      instrument,
      direction,
      entry,
      stop,
      exit,
      contracts,
      plannedRisk,
      actualPnl,
      rMultiple,
      result: actualPnl > 0 ? 'win' : actualPnl < 0 ? 'loss' : 'breakeven',
      notes,
      createdAt: new Date().toISOString()
    };
    addTrade(trade);
  }

  return (
    <div className="screen">
      <header className="screen-header"><h1>Trade Logger</h1><PillBadge label={modeLabel(mode)} variant={modeVariant(mode)} /></header>
      <Card className="form-card">
        <SegmentedControl label="Instrument" value={instrument} onChange={setInstrument} options={[{ label: 'MNQ', value: 'MNQ' }, { label: 'NQ', value: 'NQ' }]} />
        <SegmentedControl label="Direction" value={direction} onChange={setDirection} options={[{ label: 'Long', value: 'long' }, { label: 'Short', value: 'short' }]} />
        <div className="grid-two">
          <NumberInput label="Entry" value={entry} onChange={setEntry} />
          <NumberInput label="Stop" value={stop} onChange={setStop} />
          <NumberInput label="Exit" value={exit} onChange={setExit} />
          <NumberInput label="Contracts" value={contracts} onChange={setContracts} step="1" min={1} />
          <NumberInput label="Planned Risk" value={plannedRisk} onChange={setPlannedRisk} suffix="$" />
          <NumberInput label="Actual P&L" value={actualPnl} onChange={setActualPnl} suffix="$" />
        </div>
        <label className="field"><span>Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <MetricCard label="R Multiple" value={`${rMultiple.toFixed(2)}R`} subvalue="Actual P&L divided by planned risk" />
        <button className="primary-button" type="button" onClick={saveTrade}>Save Trade</button>
      </Card>
      <div className="list">
        {trades.slice(0, 5).map((trade) => (
          <Card key={trade.id}>
            <div className="row">
              <div>
                <h3>{trade.instrument} {trade.direction === 'long' ? 'Long' : 'Short'}</h3>
                <p className="muted">{trade.rMultiple.toFixed(2)}R · Risk mode after: {modeLabel(mode)}</p>
              </div>
              <PillBadge label={formatMoney(trade.actualPnl)} variant={trade.actualPnl >= 0 ? 'green' : 'red'} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
