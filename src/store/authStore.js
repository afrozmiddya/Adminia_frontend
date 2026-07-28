import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Login action
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      // Logout action
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Optional: you could force redirect here or handle it in the components/App
      },
      
      // Update user partials (e.g. after profile update)
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'adminia-auth-storage', // key in localStorage
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
