import type { Variant } from './Card';

export function ProgressBar({ value, variant = 'green' }: { value: number; variant?: Variant }) {
  const safeValue = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="progress-track" aria-label={`${Math.round(safeValue * 100)}%`}>
      <div className={`progress-fill fill-${variant}`} style={{ width: `${safeValue * 100}%` }} />
    </div>
  );
}
