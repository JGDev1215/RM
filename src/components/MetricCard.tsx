import { Card, type Variant } from './Card';
import { ProgressBar } from './ProgressBar';

export function MetricCard({ label, value, subvalue, progress, footer, variant = 'default' }: { label: string; value: string; subvalue?: string; progress?: number; footer?: string; variant?: Variant }) {
  return (
    <Card variant={variant}>
      <p className="eyebrow">{label}</p>
      <div className="metric-value">{value}</div>
      {subvalue ? <p className="subvalue">{subvalue}</p> : null}
      {typeof progress === 'number' ? <ProgressBar value={progress} variant={variant} /> : null}
      {footer ? <p className="muted small">{footer}</p> : null}
    </Card>
  );
}
