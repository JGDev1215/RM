import { marketFeedSymbols, type MarketQuote, type MarketSymbol } from '../data/marketData';

type YahooQuote = {
  symbol?: string;
  shortName?: string;
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketTime?: number;
  marketState?: string;
};

function emptyQuote(symbol: MarketSymbol): MarketQuote {
  return {
    symbol,
    providerSymbol: marketFeedSymbols[symbol].providerSymbol,
    name: marketFeedSymbols[symbol].name,
    last: null,
    change: null,
    changePercent: null,
    regularMarketTime: null,
    marketState: null,
    source: 'Yahoo Finance',
    delayed: true
  };
}

async function fetchChartQuote(symbol: MarketSymbol, endpoint: string, fetcher: typeof fetch): Promise<MarketQuote> {
  const response = await fetcher(endpoint, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`${symbol} feed returned ${response.status}.`);
  }
  const payload = await response.json() as { chart?: { result?: Array<{ meta?: YahooQuote }> } };
  const meta = payload.chart?.result?.[0]?.meta;
  if (!meta) return emptyQuote(symbol);

  const last = Number.isFinite(meta.regularMarketPrice) ? meta.regularMarketPrice! : null;
  const previousClose = Number.isFinite(meta.previousClose) ? meta.previousClose! : Number.isFinite(meta.chartPreviousClose) ? meta.chartPreviousClose! : null;
  const change = last != null && previousClose != null ? last - previousClose : null;
  const changePercent = change != null && previousClose ? (change / previousClose) * 100 : null;

  return {
    symbol,
    providerSymbol: marketFeedSymbols[symbol].providerSymbol,
    name: meta.shortName || marketFeedSymbols[symbol].name,
    last,
    change,
    changePercent,
    regularMarketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
    marketState: meta.marketState ?? 'CME',
    source: 'Yahoo Finance chart',
    delayed: true
  };
}

export async function fetchMarketQuotes(fetcher: typeof fetch = fetch): Promise<MarketQuote[]> {
  const settled = await Promise.allSettled([
    fetchChartQuote('MNQ', '/api/chart/mnq', fetcher),
    fetchChartQuote('NQ', '/api/chart/nq', fetcher)
  ]);
  const quotes = settled.map((result, index) => result.status === 'fulfilled' ? result.value : emptyQuote(index === 0 ? 'MNQ' : 'NQ'));
  const failed = settled.find((result) => result.status === 'rejected');
  if (failed?.status === 'rejected' && settled.every((result) => result.status === 'rejected')) {
    throw failed.reason instanceof Error ? failed.reason : new Error('Quote feed unavailable.');
  }
  return quotes;
}
