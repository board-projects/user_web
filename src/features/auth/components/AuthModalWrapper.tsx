"use client";

import { useAuthStore } from "../store/auth.store";
import { AuthModal } from "./AuthModal";

export const AuthModalWrapper = () => {
    const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen);

    if (!isAuthModalOpen) return null;
    
    return <AuthModal />;
}