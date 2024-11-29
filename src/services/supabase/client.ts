import { createClient } from '@supabase/supabase-js';
import config from '../../config';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

if (config.isDevelopment && (!config.supabase.url || !config.supabase.anonKey)) {
  console.warn(
    'Supabase credentials not found. Using development fallbacks. Please set up your .env file.'
  );
}