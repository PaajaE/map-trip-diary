import { create } from 'zustand';
import { tripService, type CreateTripInput } from '../services/trips/tripService';
import type { Trip } from '../types/supabase';

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;
  fetchTrips: () => Promise<void>;
  fetchTripById: (id: string) => Promise<void>;
  createTrip: (input: CreateTripInput) => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  currentTrip: null,
  loading: false,
  error: null,
  fetchTrips: async () => {
    set({ loading: true, error: null });
    try {
      const trips = await tripService.getTrips();
      console.log('Fetched trips:', trips); // Debug log
      
      // Validate trips data
      const validTrips = trips.filter(trip => {
        if (!trip.id) {
          console.warn('Found trip without ID:', trip);
          return false;
        }
        return true;
      });

      set({ trips: validTrips, loading: false });
    } catch (error) {
      console.error('Error fetching trips:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch trips',
        loading: false 
      });
    }
  },
  fetchTripById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const trip = await tripService.getTripById(id);
      console.log('Fetched trip by ID:', trip); // Debug log
      
      if (!trip.id) {
        throw new Error('Retrieved trip has no ID');
      }
      
      set({ currentTrip: trip, loading: false });
    } catch (error) {
      console.error('Error fetching trip:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch trip',
        loading: false
      });
    }
  },
  createTrip: async (input: CreateTripInput) => {
    try {
      const trip = await tripService.createTrip(input);
      console.log('Created trip:', trip); // Debug log
      
      if (!trip.id) {
        throw new Error('Created trip has no ID');
      }
      
      set(state => ({
        trips: [trip, ...state.trips]
      }));
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error instanceof Error ? error : new Error('Failed to create trip');
    }
  }
}));