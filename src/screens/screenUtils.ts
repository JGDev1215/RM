import type { RiskMode } from '../data/types';
import type { Variant } from '../components/Card';

export function modeLabel(mode: RiskMode): string {
  return {
    normal: 'Normal',
    reduced: 'Reduced',
    protection: 'Protection',
    minimum: 'Minimum',
    stop: 'Stop'
  }[mode];
}

export function modeVariant(mode: RiskMode): Variant {
  return {
    normal: 'green',
    reduced: 'amber',
    protection: 'blue',
    minimum: 'amber',
    stop: 'red'
  }[mode] as Variant;
}

export function phaseLabel(phase: string): string {
  return phase.split('_').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}

export function percent(value: number): string {
  return `${Math.round(Math.max(0, value) * 100)}%`;
}
