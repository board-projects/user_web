"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-cyan-500 rounded-lg mx-1 cursor-pointer text-cyan-950 shadow-xl hover:shadow-lg hover:bg-cyan-600 hover:text-cyan-100 transition text-center w-full sm:w-auto px-6 py-6 text-lg sm:px-12 sm:py-10 sm:text-2xl md:px-20 md:py-14 md:text-3xl",
            outline: "bg-lime-400 rounded-lg mx-1 cursor-pointer text-lime-950 shadow-xl hover:shadow-lg hover:bg-lime-600 hover:text-lime-100 transition text-center w-full sm:w-auto px-6 py-6 text-lg sm:px-12 sm:py-10 sm:text-2xl md:px-20 md:py-14 md:text-3xl", ghost: "text-gray-600 hover:bg-gray-100",
        };

        const sizes = {
            sm: "px-4 py-1.5 text-sm",
            md: "px-8 py-3 text-base",
            lg: "px-10 py-4 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "rounded-lg transition-colors focus:outline-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);