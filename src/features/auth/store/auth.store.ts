import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    isLoggedIn: boolean;
    user: any | null;
    isAuthModalOpen: boolean;

    setLoggedIn: (status: boolean, useData?: any) => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>() (
    persist (
        (set) => ({
            isLoggedIn: false,
            user: null,
            isAuthModalOpen: false,
            setLoggedIn: (status, userData = null) => set({ isLoggedIn: status, user: userData, isAuthModalOpen: false }),
            openAuthModal: () => set({ isAuthModalOpen: true }),
            closeAuthModal: () => set({ isAuthModalOpen: false}),
            logout: () => set({ isLoggedIn: false, user: null }),
        }),
        {
        name: 'auth',
            partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
        }
    )
);