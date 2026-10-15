import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface MockUser {
  username: string;
  passwordHash: string; // simple base64 "hash" — mock only, not secure
  createdAt: string;
}

interface AuthState {
  users: MockUser[];
  currentUser: string | null; // username of logged-in user
  signup: (username: string, password: string) => { ok: boolean; error?: string };
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

// Not a real hash — just obscures the plaintext slightly for mock purposes
function mockHash(password: string): string {
  return btoa(password + ':waymark-mock');
}

function checkHash(password: string, hash: string): boolean {
  return mockHash(password) === hash;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      signup: (username, password) => {
        const trimmed = username.trim();
        if (!trimmed) return { ok: false, error: 'Username cannot be empty.' };
        if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };
        const existing = get().users.find(
          (u) => u.username.toLowerCase() === trimmed.toLowerCase()
        );
        if (existing) return { ok: false, error: 'That username is already taken.' };

        const newUser: MockUser = {
          username: trimmed,
          passwordHash: mockHash(password),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, newUser], currentUser: trimmed }));
        return { ok: true };
      },

      login: (username, password) => {
        const trimmed = username.trim();
        const user = get().users.find(
          (u) => u.username.toLowerCase() === trimmed.toLowerCase()
        );
        if (!user) return { ok: false, error: 'No account found with that username.' };
        if (!checkHash(password, user.passwordHash))
          return { ok: false, error: 'Incorrect password.' };
        set({ currentUser: user.username });
        return { ok: true };
      },

      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'waymark-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ users: s.users, currentUser: s.currentUser }),
    }
  )
);
