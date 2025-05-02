import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names and merges Tailwind classes safely.
 * Works well with `cva()` from class-variance-authority.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(...inputs));
}
