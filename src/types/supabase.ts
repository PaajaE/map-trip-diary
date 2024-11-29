export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  trip_date: string;
  location: {
    lat: number;
    lng: number;
  } | null;
  location_name: string | null;
  gpx_data: string | null;
  photos: Photo[];
  tags: string[];
}

export interface Photo {
  id: string;
  trip_id: string;
  url: string;
  is_cover_photo: boolean;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Observation {
  id: string;
  trip_id: string;
  type: 'plant' | 'animal' | 'rock' | 'formation';
  name: string;
  description: string | null;
  location: {
    lat: number;
    lng: number;
  };
  photo_url: string | null;
  created_at: string;
}