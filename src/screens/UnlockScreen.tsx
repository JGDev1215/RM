import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card } from '../components/Card';
import type { CloudStatus } from '../app/useCloudSync';

export function UnlockScreen({ status, message, unlock }: { status: CloudStatus; message: string | null; unlock: (code: string) => Promise<void> }) {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const busy = status === 'unlocking';

  async function submit() {
    if (!/^[0-9]{4}$/.test(code)) {
      setLocalError('Enter a 4-digit access code.');
      return;
    }
    setLocalError(null);
    await unlock(code);
  }

  return (
    <main className="page-shell">
      <section className="app-frame unlock-frame">
        <div className="unlock-screen">
          <Card className="unlock-card">
            <div className="unlock-icon"><ShieldCheck size={28} /></div>
            <p className="eyebrow">RiskGuard Trader</p>
            <h1>Enter Access Code</h1>
            <p className="muted">Use the 4-digit code to unlock cloud storage and save results to Supabase.</p>
            <input
              className="code-input"
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]*"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void submit();
              }}
              aria-label="Access code"
            />
            {(localError || message) ? <p className="error-text">{localError || message}</p> : null}
            <button className="primary-button" type="button" onClick={() => void submit()} disabled={busy}>{busy ? 'Unlocking...' : 'Unlock App'}</button>
          </Card>
        </div>
      </section>
    </main>
  );
}
