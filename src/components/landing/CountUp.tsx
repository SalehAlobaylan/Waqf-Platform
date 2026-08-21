"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
    value: number;
    duration?: number;
}

export function CountUp({ value, duration = 1200 }: CountUpProps) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const animate = () => {
            if (reduceMotion) {
                setDisplay(value);
                return;
            }
            const start = performance.now();
            const tick = (now: number) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                setDisplay(Math.round(eased * value));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };

        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || started.current) return;
                started.current = true;
                animate();
            },
            { threshold: 0.4 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [value, duration]);

    return (
        <span ref={ref} className="tabular-nums">
            {display.toLocaleString()}
        </span>
    );
}
