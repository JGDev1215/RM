import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useRiskGuardState } from './useRiskGuardState';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RiskCalculatorScreen } from '../screens/RiskCalculatorScreen';
import { TradeLoggerScreen } from '../screens/TradeLoggerScreen';
import { DynamicRiskEngineScreen } from '../screens/DynamicRiskEngineScreen';
import { PayoutTrackerScreen } from '../screens/PayoutTrackerScreen';
import { RestartTrackerScreen } from '../screens/RestartTrackerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useMarketDataFeed } from './useMarketDataFeed';
import { useCloudSync } from './useCloudSync';
import { UnlockScreen } from '../screens/UnlockScreen';

export type Route = 'dashboard' | 'calculator' | 'trades' | 'engine' | 'payouts' | 'restart' | 'settings';

export function App() {
  const [route, setRoute] = useState<Route>('dashboard');
  const state = useRiskGuardState();
  const marketFeed = useMarketDataFeed();
  const cloud = useCloudSync({
    getSnapshot: state.getSnapshot,
    applySnapshot: state.applySnapshot,
    snapshotKey: JSON.stringify(state.cloudSnapshot)
  });

  if (!cloud.accessCode || cloud.status === 'locked' || cloud.status === 'unlocking') {
    return <UnlockScreen status={cloud.status} message={cloud.message} unlock={cloud.unlock} />;
  }

  const screen = {
    dashboard: <DashboardScreen {...state} cloud={cloud} marketFeed={marketFeed} navigate={setRoute} />,
    calculator: <RiskCalculatorScreen config={state.config} riskContext={state.riskContext} />,
    trades: <TradeLoggerScreen config={state.config} trades={state.trades} addTrade={state.addTrade} riskContext={state.riskContext} />,
    engine: <DynamicRiskEngineScreen riskContext={state.riskContext} />,
    payouts: <PayoutTrackerScreen {...state} />,
    restart: <RestartTrackerScreen config={state.config} riskContext={state.riskContext} />,
    settings: <SettingsScreen {...state} />
  }[route];

  return <AppShell activeRoute={route} onNavigate={setRoute}>{screen}</AppShell>;
}
