export interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  mapyCZ: {
    apiKey: string;
    baseUrl: string;
  };
  isDevelopment: boolean;
}