// hooks/useReturnCountdown.ts
import { useEffect, useState } from 'react';

const RETURN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const useReturnCountdown = (completedAt: string | null | undefined) => {
    const getRemaining = () => {
        if (!completedAt) return 0;
        const elapsed = Date.now() - new Date(completedAt).getTime();
        return Math.max(0, RETURN_WINDOW_MS - elapsed);
    };

    const [remainingMs, setRemainingMs] = useState(getRemaining);

    useEffect(() => {
        if (!completedAt) return;
        setRemainingMs(getRemaining());

        const timer = setInterval(() => {
            const r = getRemaining();
            setRemainingMs(r);
            if (r <= 0) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [completedAt]);

    const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

    return {
        remainingMs,
        expired: remainingMs <= 0,
        display: { days, hours, minutes, seconds },
        // chuỗi gọn: "6 ngày 23:59:01"
        label: days > 0
            ? `${days} ngày ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
};