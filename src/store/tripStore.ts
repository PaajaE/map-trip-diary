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

export const useTripStore = create<TripState>((set) => ({
  trips: [],
  currentTrip: null,
  loading: false,
  error: null,
  fetchTrips: async () => {
    set({ loading: true, error: null });
    try {
      const trips = await tripService.getTrips();
      set({ trips, loading: false });
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
      set(state => ({
        trips: [trip, ...state.trips]
      }));
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error instanceof Error ? error : new Error('Failed to create trip');
    }
  }
}));