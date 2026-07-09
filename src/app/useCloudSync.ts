import { useEffect, useRef, useState } from 'react';
import type { CloudSnapshot } from '../data/cloudSnapshot';
import { loadRiskGuardSnapshot, saveRiskGuardSnapshot, verifyAppCode } from '../supabase/riskguardCloud';

export type CloudStatus = 'locked' | 'unlocking' | 'ready' | 'saving' | 'saved' | 'error';

export function useCloudSync(args: {
  getSnapshot: () => CloudSnapshot;
  applySnapshot: (snapshot: CloudSnapshot) => void;
  snapshotKey: string;
}) {
  const [accessCode, setAccessCode] = useState<string | null>(() => sessionStorage.getItem('riskguard.accessCode'));
  const [status, setStatus] = useState<CloudStatus>(accessCode ? 'unlocking' : 'locked');
  const [message, setMessage] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  async function unlock(code: string) {
    setStatus('unlocking');
    setMessage(null);
    const ok = await verifyAppCode(code);
    if (!ok) {
      setStatus('locked');
      setMessage('Invalid access code.');
      return;
    }
    const snapshot = await loadRiskGuardSnapshot(code);
    args.applySnapshot(snapshot);
    sessionStorage.setItem('riskguard.accessCode', code);
    hydratedRef.current = true;
    setAccessCode(code);
    setStatus('ready');
    setMessage('Cloud storage unlocked.');
  }

  function lock() {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    sessionStorage.removeItem('riskguard.accessCode');
    hydratedRef.current = false;
    setAccessCode(null);
    setStatus('locked');
    setMessage(null);
  }

  async function saveNow() {
    if (!accessCode || !hydratedRef.current) return;
    setStatus('saving');
    try {
      await saveRiskGuardSnapshot(accessCode, args.getSnapshot());
      setStatus('saved');
      setMessage('Saved to Supabase.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not save to Supabase.');
    }
  }

  useEffect(() => {
    if (!accessCode || hydratedRef.current) return;
    void unlock(accessCode).catch((error) => {
      sessionStorage.removeItem('riskguard.accessCode');
      setAccessCode(null);
      setStatus('locked');
      setMessage(error instanceof Error ? error.message : 'Could not unlock cloud storage.');
    });
  }, [accessCode]);

  useEffect(() => {
    if (!accessCode || !hydratedRef.current) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void saveNow();
    }, 900);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [accessCode, args.snapshotKey]);

  return { accessCode, status, message, unlock, lock, saveNow };
}
