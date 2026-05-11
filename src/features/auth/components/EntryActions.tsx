"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";
import { Button } from "../../../shared/components/ui/Button";


export const EntryActions = () => {

    const router = useRouter();
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const openAuthModal = useAuthStore((s) => s.openAuthModal);


    const handleEntry = (role: "teacher" | "student") => {
        if (!isLoggedIn) {
            openAuthModal();
        } else {
            router.push(`/board/new?role=${role}`);
        }
    };

    return (
        <div>
            <Button
                onClick={() => handleEntry("teacher")}
                variant="primary"
            >
                Go as a Teacher
            </Button>
            <Button
                onClick={() => handleEntry("student")}
                variant="outline"
            >
                Go as a Student
            </Button>
        </div>
    );
};