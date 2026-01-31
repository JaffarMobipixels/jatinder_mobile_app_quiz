import { create } from 'zustand';

interface AuthState {
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  login: async (email, password) => {
    console.log('Login:', email);
    // Dummy login logic
    set({ user: { email } });
  },

  signup: async (email, password) => {
    console.log('Signup:', email);
    set({ user: { email } });
  },

  logout: () => {
    set({ user: null });
  },
}));
