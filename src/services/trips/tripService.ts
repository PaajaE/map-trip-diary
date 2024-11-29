import { supabase } from '../supabase/client';
import type { Trip } from '../../types/supabase';

export interface CreateTripInput {
  title: string;
  description?: string;
  trip_date: string;
  location?: { lat: number; lng: number };
  photos?: File[];
  tags?: string[];
  gpx_file?: File;
}

export class TripService {
  async getTrips(): Promise<Trip[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('get_user_trips', { cur_user_id: user.id });

    if (error) throw error;
    return data || [];
  }

  async getTripById(id: string): Promise<Trip> {
    if (!id) throw new Error('Trip ID is required');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('get_user_trips', { cur_user_id: user.id });

    if (error) throw error;
    if (!data) throw new Error('No trips found');

    const trip = data.find(t => t.id === id);
    if (!trip) throw new Error('Trip not found');

    return trip;
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
        const fileExt = photo.name.split('.').pop();
        const filePath = `${user.id}/${trip.id}/${Date.now()}-${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('trip-photos')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trip-photos')
          .getPublicUrl(filePath);

        const { error: photoError } = await supabase
          .from('photos')
          .insert({
            trip_id: trip.id,
            url: publicUrl,
            is_cover_photo: index === 0,
          });

        if (photoError) throw photoError;
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
        .update({ gpx_data: filePath })
        .eq('id', trip.id);

      if (updateError) throw updateError;
    }

    // Fetch the complete trip with all related data
    return this.getTripById(trip.id);
  }
}

export const tripService = new TripService();