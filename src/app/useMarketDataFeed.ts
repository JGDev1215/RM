import { useCallback, useEffect, useState } from 'react';
import { initialMarketQuotes, type MarketDataState } from '../data/marketData';
import { fetchMarketQuotes } from '../logic/marketData';

export function useMarketDataFeed(refreshMs = 30000): MarketDataState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<MarketDataState>({ quotes: initialMarketQuotes, loading: true, error: null, lastUpdated: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const quotes = await fetchMarketQuotes();
      setState({ quotes, loading: false, error: null, lastUpdated: new Date().toISOString() });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : 'Quote feed unavailable.'
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), refreshMs);
    return () => window.clearInterval(id);
  }, [refresh, refreshMs]);

  return { ...state, refresh };
}
