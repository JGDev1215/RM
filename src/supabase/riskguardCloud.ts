import type { CloudSnapshot } from '../data/cloudSnapshot';
import { supabase } from './client';

export async function verifyAppCode(code: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('verify_app_code', { input_code: code });
  if (error) throw error;
  return data === true;
}

export async function loadRiskGuardSnapshot(code: string): Promise<CloudSnapshot> {
  const { data, error } = await supabase.rpc('load_riskguard_state', { input_code: code });
  if (error) throw error;
  return (data ?? {}) as CloudSnapshot;
}

export async function saveRiskGuardSnapshot(code: string, snapshot: CloudSnapshot): Promise<CloudSnapshot> {
  const { data, error } = await supabase.rpc('save_riskguard_state', {
    input_code: code,
    input_payload: snapshot
  });
  if (error) throw error;
  return (data ?? {}) as CloudSnapshot;
}
