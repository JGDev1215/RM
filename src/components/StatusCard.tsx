import { Card, type Variant } from './Card';

export function StatusCard({ status, reason, variant }: { status: string; reason: string; variant: Variant }) {
  return (
    <Card variant={variant} className="status-card">
      <p className="eyebrow">Current Decision</p>
      <h2>{status}</h2>
      <p className="muted">{reason}</p>
    </Card>
  );
}
