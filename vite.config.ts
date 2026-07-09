import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/chart/mnq': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json,text/plain,*/*'
        },
        rewrite: () => '/v8/finance/chart/MNQ%3DF?range=1d&interval=1m'
      },
      '/api/chart/nq': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json,text/plain,*/*'
        },
        rewrite: () => '/v8/finance/chart/NQ%3DF?range=1d&interval=1m'
      }
    }
  }
});
