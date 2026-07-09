import type { Variant } from './Card';

export function PillBadge({ label, variant = 'grey' }: { label: string; variant?: Variant }) {
  return <span className={`pill pill-${variant}`}>{label}</span>;
}
