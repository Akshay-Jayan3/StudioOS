"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const IMAGE_SRC = "/images/projects/living-room.png";
const KICKER = "How We Begin";
const CAPTION = "Every project starts with light.";
const SUB =
  "We study how it enters before we touch a single surface — the hour it arrives, the angle it falls, the shadows it leaves behind. Once that's understood, everything else follows.";

const SCALE_START = 0.5;
const RADIUS_START = 32;
const EXPAND_END = 0.55; // fraction of scroll spent expanding the image to full bleed; text appears after this

// easeInOutCubic — slow start, fast middle, slow finish.
function ease(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

export default function Walkthrough() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const rawProgress = useRef(0);
  const smoothProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    const text = textRef.current;
    if (!container || !image || !text) return;

    const render = (progress: number) => {
      let scale: number;
      let radius: number;
      let textOpacity: number;

      if (progress < EXPAND_END) {
        // Phase 1: image expands from a small centered card to full bleed; text stays hidden
        const local = ease(progress / EXPAND_END);
        scale = SCALE_START + local * (1 - SCALE_START);
        radius = RADIUS_START * (1 - local);
        textOpacity = 0;
      } else {
        // Phase 2: image is full screen; text fades in over it
        scale = 1;
        radius = 0;
        textOpacity = ease((progress - EXPAND_END) / (1 - EXPAND_END || 1));
      }

      image.style.transform = `scale(${scale})`;
      image.style.borderRadius = `${radius}px`;
      text.style.opacity = String(textOpacity);
    };

    render(0);

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        rawProgress.current = self.progress;
      },
    });

    // Ease smoothProgress toward rawProgress every frame rather than snapping —
    // this is what removes the "sudden" feel from fast or jittery scroll input.
    const tick = () => {
      const delta = rawProgress.current - smoothProgress.current;
      smoothProgress.current += delta * 0.06;
      if (Math.abs(delta) < 0.0005) smoothProgress.current = rawProgress.current;
      render(smoothProgress.current);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      trigger.kill();
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative" style={{ height: "180vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">
        {/* Image — zooms in from a small centered card to fill the screen */}
        <div
          ref={imageRef}
          className="absolute inset-0 overflow-hidden will-change-transform"
          style={{ transform: `scale(${SCALE_START})`, borderRadius: `${RADIUS_START}px` }}
        >
          <Image
            src={IMAGE_SRC}
            alt={CAPTION}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Vignette for text legibility once it appears over the full-bleed image */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Text — appears centered over the image once it has reached full bleed */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center px-6">
          <div ref={textRef} className="max-w-xl text-center" style={{ opacity: 0 }}>
            <span className="text-sm tracking-[0.18em] uppercase text-gold-muted mb-4 block">
              {KICKER}
            </span>
            <p className="text-[clamp(26px,3.4vw,44px)] leading-[1.15] tracking-tight text-foreground italic mb-4">
              {CAPTION}
            </p>
            <p className="text-base md:text-lg text-muted leading-relaxed">{SUB}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
