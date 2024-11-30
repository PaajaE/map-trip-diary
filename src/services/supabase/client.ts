import { createClient } from '@supabase/supabase-js';
import config from '../../config';

// Validate required config
if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Missing required Supabase configuration. Please check your environment variables.');
}

// Ensure URL is properly formatted
const supabaseUrl = config.supabase.url.startsWith('http') 
  ? config.supabase.url 
  : `https://${config.supabase.url}`;

export const supabase = createClient(
  supabaseUrl,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  }
);

// Create a separate admin client for operations requiring elevated privileges
export const supabaseAdmin = config.supabase.serviceRoleKey 
  ? createClient(
      supabaseUrl,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;