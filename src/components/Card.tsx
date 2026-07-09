import type { ReactNode } from 'react';

export type Variant = 'default' | 'green' | 'amber' | 'red' | 'blue' | 'grey';

export function Card({ children, variant = 'default', className = '' }: { children: ReactNode; variant?: Variant; className?: string }) {
  return <section className={`card card-${variant} ${className}`}>{children}</section>;
}
