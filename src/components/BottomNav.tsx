import { BarChart3, Calculator, Home, Settings, WalletCards } from 'lucide-react';
import type { Route } from '../app/App';
import { routes } from '../app/routes';

const icons = {
  dashboard: Home,
  calculator: Calculator,
  trades: BarChart3,
  payouts: WalletCards,
  settings: Settings
} as const;

export function BottomNav({ activeRoute, onNavigate }: { activeRoute: Route; onNavigate: (route: Route) => void }) {
  return (
    <nav className="bottom-nav">
      {routes.map((item) => {
        const Icon = icons[item.id as keyof typeof icons];
        return (
          <button key={item.id} className={activeRoute === item.id ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate(item.id)} type="button" title={item.label}>
            <Icon size={18} strokeWidth={2.1} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
