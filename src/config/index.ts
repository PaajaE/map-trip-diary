import { Config } from './types';

const config: Config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.5XVQx3Zv8E8Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q',
  },
  mapyCZ: {
    apiKey: import.meta.env.VITE_MAPY_CZ_API_KEY || '',
    baseUrl: 'https://api.mapy.cz/v1',
  },
  isDevelopment: import.meta.env.DEV,
};

export default config;