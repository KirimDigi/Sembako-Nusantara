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

// Helper for live connection monitoring
export const checkSupabaseConnection = async (): Promise<{ connected: boolean; latencyMs?: number; error?: string }> => {
  const start = Date.now();
  try {
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    return {
      connected: true,
      latencyMs: Date.now() - start,
      error: error ? error.message : undefined
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Koneksi ke Supabase gagal'
    };
  }
};
