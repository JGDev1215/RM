import type { Route } from './App';

export const routes: { id: Route; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'trades', label: 'Trades' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'settings', label: 'Settings' }
];
