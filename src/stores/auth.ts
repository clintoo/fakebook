import { create } from "zustand";
import { currentUser } from "@/mocks/seed";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthed: boolean;
  signIn: (u: User) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: currentUser,
  isAuthed: true,
  signIn: (u) => set({ user: u, isAuthed: true }),
  signOut: () => set({ user: null, isAuthed: false }),
}));
