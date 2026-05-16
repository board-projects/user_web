"use client";

import { useRouter } from "next/navigation";
import { Button } from "../../../shared/components/ui/Button";

export const EntryActions = () => {

    const router = useRouter();

    const handleTeacherEntry = () => {
        router.push(`/board/` + crypto.randomUUID());
    };

    const handleStudentEntry = () => {
        router.push(`/board/` + crypto.randomUUID());
    };

    return (
        <div>
            <Button
                onClick={() => handleTeacherEntry()}
                variant="primary"
            >
                Go as a Teacher
            </Button>
            <Button
                onClick={() => handleStudentEntry()}
                variant="outline"
            >
                Go as a Student
            </Button>
        </div>
    );
};