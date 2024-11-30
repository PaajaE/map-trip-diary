import { supabase } from '../supabase/client';
import type { Trip, Photo } from '../../types/supabase';

export interface CreateTripInput {
  title: string;
  description?: string;
  trip_date: string;
  location?: { lat: number; lng: number };
  photos?: File[];
  tags?: string[];
  gpx_file?: File;
}

class TripService {
  private async getSignedUrl(path: string): Promise<string | null> {
    try {
      const { data } = await supabase.storage
        .from('trip-photos')
        .createSignedUrl(path, 60 * 60); // 1 hour expiration

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  }

  private async uploadPhoto(file: File, userId: string, tripId: number): Promise<string> {
    const filePath = `${userId}/${tripId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('trip-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return filePath;
  }

  private async mapPhotos(photos: any[]): Promise<Photo[]> {
    if (!Array.isArray(photos)) return [];

    const validPhotos = photos.filter(photo => photo && photo.name);
    const photoPromises = validPhotos.map(async photo => {
      console.log({ photo })
      let url = photo.url;

      // If we have a name but URL is missing or invalid, get a signed URL
      if (photo.name) {
        const signedUrl = await this.getSignedUrl(photo.name);
        if (signedUrl) {
          url = signedUrl;
        }
      }

      return {
        id: photo.id,
        trip_id: photo.trip_id,
        name: photo.name,
        url: url || '',
        is_cover_photo: Boolean(photo.is_cover_photo),
        created_at: photo.created_at || new Date().toISOString(),
        location: photo.location ? {
          lat: photo.location.lat,
          lng: photo.location.lng
        } : null,
        metadata: photo.metadata || {},
        user_id: photo.user_id,
        date: photo.date,
        note: photo.note,
        title: photo.title,
        gps_reference: photo.gps_reference
      };
    });

    return Promise.all(photoPromises);
  }

  private async mapTrip(rawTrip: any): Promise<Trip> {
    if (!rawTrip) throw new Error('Invalid trip data');

    // Map location from lat/long
    let location = null;
    if (rawTrip.lat && rawTrip.long) {
      location = {
        lat: Number(rawTrip.lat),
        lng: Number(rawTrip.long)
      };
    }

    // Map photos with signed URLs
    const photos = await this.mapPhotos(rawTrip.photos || []);

    // Map trip path if available
    const trip_path = rawTrip.trip_path || null;

    return {
      id: rawTrip.trip_id || 0,
      user_id: rawTrip.user_id || '',
      title: rawTrip.title || '',
      description: rawTrip.description || null,
      created_at: rawTrip.created_at || null,
      trip_date: rawTrip.trip_date || null,
      location,
      trip_path,
      gpx_file: rawTrip.gpx_file || null,
      photos,
      tags: Array.isArray(rawTrip.tags) ? rawTrip.tags : [],
      gps_reference: rawTrip.gps_reference,
      search_vector_cs: rawTrip.search_vector_cs,
      search_vector_en: rawTrip.search_vector_en,
      title_trigram: rawTrip.title_trigram
    };
  }

  async getTrips(): Promise<Trip[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('get_user_trips', { cur_user_id: user.id });

    if (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }

    const tripPromises = (data || []).map(async trip => {
      try {
        return await this.mapTrip(trip);
      } catch (error) {
        console.error('Error mapping trip:', error, trip);
        return null;
      }
    });

    const trips = await Promise.all(tripPromises);
    return trips.filter((trip): trip is Trip => Boolean(trip?.id));
  }

  async getTripById(id: string): Promise<Trip> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('get_user_trips', { cur_user_id: user.id });

    if (error) {
      console.error('Error fetching trip:', error);
      throw error;
    }

    if (!data) throw new Error('No trips found');

    const rawTrip = data.find(t => t.trip_id?.toString() === id);
    if (!rawTrip) throw new Error('Trip not found');

    return this.mapTrip(rawTrip);
  }

  async createTrip(input: CreateTripInput): Promise<Trip> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Start a transaction
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description,
        trip_date: input.trip_date,
        gps_reference: input.location
          ? `POINT(${input.location.lng} ${input.location.lat})`
          : null,
      })
      .select()
      .single();

    if (tripError) throw tripError;
    if (!trip) throw new Error('Failed to create trip');

    // Upload photos if any
    if (input.photos?.length) {
      const photoPromises = input.photos.map(async (photo, index) => {
        try {
          const filePath = await this.uploadPhoto(photo, user.id, trip.id);

          const url = supabase.storage
            .from('trip-photos')
            .getPublicUrl(`photos/${filePath}`);
          console.log({ url })
          const { error: photoError } = await supabase
            .from('photos')
            .insert({
              trip_id: trip.id,
              name: filePath,
              url: url,
              is_cover_photo: index === 0,
              metadata: {} // Add any EXIF data here if needed
            });

          if (photoError) throw photoError;
        } catch (error) {
          console.error('Error uploading photo:', error);
          throw error;
        }
      });

      await Promise.all(photoPromises);
    }

    // Add tags if any
    if (input.tags?.length) {
      const tagPromises = input.tags.map(async (tagName) => {
        // Get or create tag
        const { data: existingTag, error: tagError } = await supabase
          .from('tags')
          .select()
          .eq('name', tagName)
          .single();

        if (tagError && tagError.code !== 'PGRST116') throw tagError;

        let tagId;
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag, error: createTagError } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select()
            .single();

          if (createTagError) throw createTagError;
          if (!newTag) throw new Error('Failed to create tag');
          tagId = newTag.id;
        }

        // Link tag to trip
        const { error: tripTagError } = await supabase
          .from('trip_tags')
          .insert({ trip_id: trip.id, tag_id: tagId });

        if (tripTagError) throw tripTagError;
      });

      await Promise.all(tagPromises);
    }

    // Upload GPX file if any
    if (input.gpx_file) {
      const fileExt = input.gpx_file.name.split('.').pop();
      const filePath = `${user.id}/${trip.id}/track.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-gpx')
        .upload(filePath, input.gpx_file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('trips')
        .update({ gpx_file: filePath })
        .eq('id', trip.id);

      if (updateError) throw updateError;
    }

    // Fetch the complete trip with all related data
    return this.getTripById(trip.id.toString());
  }
}

export const tripService = new TripService();