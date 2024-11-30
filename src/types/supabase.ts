import type { Database } from './supabase-types';

export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
};

export type Trip = Database['public']['Tables']['trips']['Row'] & {
  location?: { lat: number; lng: number } | null;
  gpx_data?: string;
  photos: Photo[];
  tags: string[];
};

export type Photo = Database['public']['Tables']['photos']['Row'] & {
  location?: { lat: number; lng: number } | null;
};

export type Tag = Database['public']['Tables']['tags']['Row'];

export type SearchResult = Database['public']['Functions']['get_user_trips']['Returns'][0];

export type PopularTag = Database['public']['Views']['popular_tags']['Row'];