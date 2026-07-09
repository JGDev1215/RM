export type MarketSymbol = 'MNQ' | 'NQ';

export type MarketQuote = {
  symbol: MarketSymbol;
  providerSymbol: string;
  name: string;
  last: number | null;
  change: number | null;
  changePercent: number | null;
  regularMarketTime: string | null;
  marketState: string | null;
  source: string;
  delayed: boolean;
};

export type MarketDataState = {
  quotes: MarketQuote[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
};

export const marketFeedSymbols: Record<MarketSymbol, { providerSymbol: string; name: string }> = {
  MNQ: { providerSymbol: 'MNQ=F', name: 'Micro E-mini Nasdaq-100' },
  NQ: { providerSymbol: 'NQ=F', name: 'E-mini Nasdaq-100' }
};

export const initialMarketQuotes: MarketQuote[] = (Object.keys(marketFeedSymbols) as MarketSymbol[]).map((symbol) => ({
  symbol,
  providerSymbol: marketFeedSymbols[symbol].providerSymbol,
  name: marketFeedSymbols[symbol].name,
  last: null,
  change: null,
  changePercent: null,
  regularMarketTime: null,
  marketState: null,
  source: 'Yahoo Finance chart',
  delayed: true
}));
