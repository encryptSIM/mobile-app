// hooks/useCooldownTimer.ts
import { useEffect, useState } from "react";

export const useCooldownTimer = (
    duration: number,
    onExpire?: () => void
): [number, number | null, () => void] => {
    const [endTime, setEndTime] = useState<number | null>(null);
    const [remaining, setRemaining] = useState<number>(0);

    useEffect(() => {
        if (!endTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                clearInterval(interval);
                setRemaining(0);
                setEndTime(null);
                onExpire?.();
            } else {
                setRemaining(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    const start = () => {
        const newEnd = Date.now() + duration;
        setEndTime(newEnd);
        setRemaining(duration);
    };

    return [remaining, endTime, start];
};
