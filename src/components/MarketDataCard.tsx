import { RefreshCw } from 'lucide-react';
import type { MarketDataState } from '../data/marketData';
import { Card } from './Card';

function formatPrice(value: number | null): string {
  if (value == null) return '--';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value);
}

function formatSigned(value: number | null, suffix = ''): string {
  if (value == null) return '--';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}${suffix}`;
}

function timeLabel(value: string | null): string {
  if (!value) return 'Waiting for quote';
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value));
}

export function MarketDataCard({ feed }: { feed: MarketDataState & { refresh: () => Promise<void> } }) {
  return (
    <Card>
      <div className="row">
        <div>
          <p className="eyebrow">Live MNQ / NQ Feed</p>
          <p className="muted small">Public futures quotes. Use broker data for execution.</p>
        </div>
        <button className="icon-button" type="button" title="Refresh quotes" onClick={() => void feed.refresh()} disabled={feed.loading}>
          <RefreshCw size={17} />
        </button>
      </div>
      <div className="quote-grid">
        {feed.quotes.map((quote) => (
          <div className="quote-row" key={quote.symbol}>
            <div>
              <strong>{quote.symbol}</strong>
              <span>{quote.providerSymbol}</span>
            </div>
            <div>
              <strong>{formatPrice(quote.last)}</strong>
              <span className={(quote.change ?? 0) >= 0 ? 'quote-up' : 'quote-down'}>{formatSigned(quote.change)} / {formatSigned(quote.changePercent, '%')}</span>
            </div>
            <small>{quote.marketState ?? 'Unknown'} · {quote.delayed ? 'Delayed' : 'Live'} · {timeLabel(quote.regularMarketTime)}</small>
          </div>
        ))}
      </div>
      {feed.error ? <p className="error-text">{feed.error} Quote panel will retry automatically.</p> : null}
      {feed.lastUpdated ? <p className="muted small">Updated {timeLabel(feed.lastUpdated)} from Yahoo Finance.</p> : null}
    </Card>
  );
}
