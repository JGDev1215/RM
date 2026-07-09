export default async function handler(_request: unknown, response: any) {
  await proxyYahooChart('NQ%3DF', response);
}

async function proxyYahooChart(symbol: string, response: any) {
  try {
    const yahooResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1m`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json,text/plain,*/*'
      }
    });

    const body = await yahooResponse.text();
    response.status(yahooResponse.status);
    response.setHeader('Content-Type', yahooResponse.headers.get('content-type') || 'application/json');
    response.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=45');
    response.send(body);
  } catch {
    response.status(502).json({ error: 'Quote feed unavailable' });
  }
}
