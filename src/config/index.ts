import { Config } from './types';

const config: Config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  },
  isDevelopment: import.meta.env.DEV,
};

// Validate required config
if (!config.supabase.url || !config.supabase.anonKey) {
  console.error('Missing required Supabase configuration!');
}

export default config;