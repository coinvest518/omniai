import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prompt } from '../../../data/promptsData';


interface User {
  id: string;
  tokens: number;
  credits: number;
  userPrompts: Prompt[]
  setUserPrompts: (prompts: Prompt[]) => void;

}

interface UserStore {
  user: User | null;
  userPrompts: Prompt[];
  setUserPrompts: (prompts: Prompt[]) => void;
  addUserPrompt: (prompt: Prompt) => void;
  removeUserPrompt: (promptId: string) => void;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateTokens: (amount: number) => void;
  updateCredits: (amount: number) => void;
}

// Create the user store
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      userPrompts: [],
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null, userPrompts: [] }),
      updateTokens: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, tokens: state.user.tokens - amount }
            : null,
        })),
      updateCredits: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, credits: state.user.credits - amount }
            : null,
        })),
      setUserPrompts: (prompts) => set({ userPrompts: prompts }),
      addUserPrompt: (prompt) =>
        set((state) => ({
          userPrompts: [...state.userPrompts, prompt],
        })),
      removeUserPrompt: (promptId) =>
        set((state) => ({
          userPrompts: state.userPrompts.filter((p) => p.id !== promptId),
        })),
    }),
    {
      name: 'user-storage',
      getStorage: () => localStorage,
    }
  )
);