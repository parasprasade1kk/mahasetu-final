import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://mrjigbqfwirgrfukciiu.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamlnYnFmd2lyZ3JmdWtjaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzM3MTcsImV4cCI6MjEwNDgwOTcxN30.6_Nw980s9wGSVzXVAN8ZBx-Lso5-eI-q7OmH_1IA4gg';

// Canonical singleton client for client-side and default serverless usage
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Returns a Supabase client authenticated with the given bearer token
 */
export function getAuthenticatedSupabaseClient(token?: string): SupabaseClient {
  if (!token) return supabase;

  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export default supabase;
