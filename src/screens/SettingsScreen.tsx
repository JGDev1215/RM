import type { useRiskGuardState } from '../app/useRiskGuardState';
import type { AccountConfig, AccountPhase, DrawdownType } from '../data/types';
import { Card } from '../components/Card';
import { NumberInput } from '../components/NumberInput';
import { PillBadge } from '../components/PillBadge';
import { SegmentedControl } from '../components/SegmentedControl';
import { validateAccountConfig } from '../logic/validation';
import { phaseLabel } from './screenUtils';

type Props = ReturnType<typeof useRiskGuardState>;

export function SettingsScreen({ config, setConfig, accountState, setAccountState, resetAccountStateOnly, resetAppData }: Props) {
  const validation = validateAccountConfig(config);
  const update = <K extends keyof AccountConfig>(key: K, value: AccountConfig[K]) => setConfig({ ...config, [key]: value });
  const updateInstrument = (symbol: 'MNQ' | 'NQ', key: 'pointValue' | 'tickSize' | 'tickValue', value: number) => {
    setConfig({
      ...config,
      instruments: {
        ...config.instruments,
        [symbol]: { ...config.instruments[symbol], [key]: value }
      }
    });
  };

  return (
    <div className="screen">
      <header className="screen-header"><h1>Settings</h1><PillBadge label={phaseLabel(accountState.phase)} /></header>
      <Card className="form-card">
        <div className="grid-two">
          <NumberInput label="Account Size" value={config.accountSize} onChange={(value) => update('accountSize', value)} />
          <NumberInput label="Max Drawdown" value={config.maxDrawdown} onChange={(value) => update('maxDrawdown', value)} />
          <NumberInput label="Daily Max Loss" value={config.dailyMaxLoss} onChange={(value) => update('dailyMaxLoss', value)} />
          <NumberInput label="Monthly Target" value={config.monthlyTarget} onChange={(value) => update('monthlyTarget', value)} />
          <NumberInput label="Weekly Target" value={config.weeklyTarget} onChange={(value) => update('weeklyTarget', value)} />
          <NumberInput label="Evaluation Target" value={config.evaluationTarget} onChange={(value) => update('evaluationTarget', value)} />
          <NumberInput label="Max Payouts" value={config.maxPayouts} onChange={(value) => update('maxPayouts', value)} />
          <NumberInput label="Max Payout" value={config.maxPayoutAmount} onChange={(value) => update('maxPayoutAmount', value)} />
          <NumberInput label="Profit Split" value={config.profitSplit} onChange={(value) => update('profitSplit', value)} />
          <NumberInput label="Balance" value={accountState.currentBalance} onChange={(value) => setAccountState({ ...accountState, currentBalance: value, highWatermark: Math.max(accountState.highWatermark, value), lastUpdated: new Date().toISOString() })} />
        </div>
        <SegmentedControl label="Account Phase" value={accountState.phase} onChange={(value: AccountPhase) => setAccountState({ ...accountState, phase: value })} options={[{ label: 'Evaluation', value: 'evaluation' }, { label: 'Funded', value: 'funded' }, { label: 'Protection', value: 'payout_protection' }, { label: 'Restart', value: 'restart_required' }]} />
        <SegmentedControl label="Drawdown Type" value={config.drawdownType} onChange={(value: DrawdownType) => update('drawdownType', value)} options={[{ label: 'Fixed', value: 'fixed' }, { label: 'Trailing', value: 'trailing' }, { label: 'EOD', value: 'end_of_day' }]} />
        <SegmentedControl label="House Money Mode" value={config.houseMoneyMode ? 'on' : 'off'} onChange={(value: 'on' | 'off') => update('houseMoneyMode', value === 'on')} options={[{ label: 'Off', value: 'off' }, { label: 'On', value: 'on' }]} />
        <SegmentedControl label="Payout Pending" value={accountState.payoutPending ? 'yes' : 'no'} onChange={(value: 'yes' | 'no') => setAccountState({ ...accountState, payoutPending: value === 'yes' })} options={[{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }]} />
        {!validation.valid ? <div className="error-list">{validation.errors.map((error) => <p key={error}>{error}</p>)}</div> : null}
      </Card>
      {(['MNQ', 'NQ'] as const).map((symbol) => (
        <Card className="form-card" key={symbol}>
          <p className="eyebrow">{symbol} Instrument Values</p>
          <div className="grid-two">
            <NumberInput label="Point Value" value={config.instruments[symbol].pointValue} onChange={(value) => updateInstrument(symbol, 'pointValue', value)} />
            <NumberInput label="Tick Size" value={config.instruments[symbol].tickSize} onChange={(value) => updateInstrument(symbol, 'tickSize', value)} />
            <NumberInput label="Tick Value" value={config.instruments[symbol].tickValue} onChange={(value) => updateInstrument(symbol, 'tickValue', value)} />
          </div>
        </Card>
      ))}
      <div className="grid-two">
        <button className="secondary-button" type="button" onClick={resetAccountStateOnly}>Reset Account</button>
        <button className="secondary-button danger-button" type="button" onClick={resetAppData}>Reset App Data</button>
      </div>
    </div>
  );
}
