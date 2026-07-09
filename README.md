# RiskGuard Trader

Mobile-first risk management app for MNQ/NQ futures traders.

## Local Development

```bash
npm install
npm run dev
```

Default app unlock code:

```txt
5880
```

## Supabase

Project URL:

```txt
https://pobfddqbqvxhcgovmvwd.supabase.co
```

The app uses Supabase RPC functions for code-gated cloud save/load:

- `verify_app_code(input_code text)`
- `load_riskguard_state(input_code text)`
- `save_riskguard_state(input_code text, input_payload jsonb)`

Tables have RLS enabled and direct anonymous table access revoked.

## Vercel

Set these environment variables in Vercel:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```
