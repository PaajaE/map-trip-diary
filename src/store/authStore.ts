import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase/client';
import type { Profile } from '../types/supabase';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: Profile | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      initialized: false,
      setUser: (user) => set({ user, loading: false }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, loading: false });
      },
      initialize: async () => {
        try {
          // Check active session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            set({
              user: {
                id: session.user.id,
                username: session.user.email || '',
                created_at: session.user.created_at,
              },
              loading: false,
            });
          } else {
            set({ user: null, loading: false });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ user: null, loading: false });
        } finally {
          set({ initialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    useAuthStore.getState().setUser({
      id: session.user.id,
      username: session.user.email || '',
      created_at: session.user.created_at,
    });
  } else {
    useAuthStore.getState().setUser(null);
  }
});