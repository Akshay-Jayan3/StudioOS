"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  number: string;
  label: string;
  highlight?: boolean;
};

// easeOutCubic — fast start, gentle settle. Standard feel for a count-up finish.
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function StatCard({ number, label, highlight }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Split "92%" -> target 92, suffix "%". Handles "40+", "8", "3", "92%".
  const match = number.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasAnimated(true);
        observer.disconnect();

        const duration = 1400;
        const startTime = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          const value = Math.round(easeOutCubic(progress) * target);
          el.textContent = `${value}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`
        p-8
        rounded-xl
        border border-white/10
        ${highlight ? "bg-white/5" : "bg-transparent"}
      `}
    >
      <p ref={ref} className="font-mono text-4xl">
        0{suffix}
      </p>
      <p className="mt-2 text-sm text-white/50 leading-relaxed">
        {label}
      </p>
    </div>
  );
}
