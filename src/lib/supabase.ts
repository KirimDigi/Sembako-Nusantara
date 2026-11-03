import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://kfpwhdewopvnowxylcor.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHdoZGV3b3B2bm93eHlsY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4OTQ4MTMsImV4cCI6MjEwNTQ3MDgxM30.jMIfLqdhv3g9P63tLHxV4oKP2XD5IcD4OoPWcnjlpyc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper for live connection monitoring (cached for 5 minutes to save Supabase egress)
let lastConnCheck: { timestamp: number; result: { connected: boolean; latencyMs?: number; error?: string } } | null = null;

export const checkSupabaseConnection = async (): Promise<{ connected: boolean; latencyMs?: number; error?: string }> => {
  const now = Date.now();
  if (lastConnCheck && now - lastConnCheck.timestamp < 5 * 60 * 1000) {
    return lastConnCheck.result;
  }

  const start = Date.now();
  try {
    const { error } = await supabase.from('products').select('id', { head: true }).limit(1);
    const result = {
      connected: true,
      latencyMs: Date.now() - start,
      error: error ? error.message : undefined
    };
    lastConnCheck = { timestamp: now, result };
    return result;
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Koneksi ke Supabase gagal'
    };
  }
};
