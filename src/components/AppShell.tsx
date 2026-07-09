import type { ReactNode } from 'react';
import type { Route } from '../app/App';
import { BottomNav } from './BottomNav';

export function AppShell({ children, activeRoute, onNavigate }: { children: ReactNode; activeRoute: Route; onNavigate: (route: Route) => void }) {
  return (
    <main className="page-shell">
      <section className="app-frame">
        <div className="screen-content">{children}</div>
        <BottomNav activeRoute={activeRoute} onNavigate={onNavigate} />
      </section>
    </main>
  );
}
