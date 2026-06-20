"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FRAME_COUNT = 120;
const FRAME_PATH = (i: number) =>
  `/images/sequence/frame-${i.toString().padStart(4, "0")}.jpg`;

const OVERLAYS: { text: string; range: [number, number] }[] = [
  { text: "Every project starts with light.", range: [0, 0.22] },
  { text: "Where it falls. How it moves through a room.", range: [0.38, 0.6] },
  { text: "The design follows from there.", range: [0.76, 0.98] },
];

export default function Walkthrough() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) setLoaded(true);
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = (frameIndex: number) => {
      const img = imagesRef.current[frameIndex];
      if (!img || !img.complete) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const canvasRatio = rect.width / rect.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > canvasRatio) {
        drawHeight = rect.height;
        drawWidth = drawHeight * imgRatio;
        offsetX = (rect.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = rect.width;
        drawHeight = drawWidth / imgRatio;
        offsetX = 0;
        offsetY = (rect.height - drawHeight) / 2;
      }

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const updateOverlays = (progress: number) => {
      OVERLAYS.forEach((overlay, i) => {
        const el = overlayRefs.current[i];
        if (!el) return;

        const [start, end] = overlay.range;
        const fadeIn = 0.05;
        let o = 0;
        if (progress >= start && progress <= end) {
          if (progress < start + fadeIn) {
            o = (progress - start) / fadeIn;
          } else if (progress > end - fadeIn) {
            o = (end - progress) / fadeIn;
          } else {
            o = 1;
          }
        }
        el.style.opacity = String(Math.max(0, Math.min(1, o)));
      });
    };

    render(0);

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.floor(self.progress * FRAME_COUNT)
        );
        render(frameIndex);
        updateOverlays(self.progress);
      },
    });

    const onResize = () => {
      const frame =
        Math.round((trigger.progress || 0) * (FRAME_COUNT - 1)) || 0;
      render(frame);
    };
    window.addEventListener("resize", onResize);

    return () => {
      trigger.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [loaded]);

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: "400vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
        />

        {/* Vignette for text legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

        {/* Text overlays synced to scroll progress */}
        <div className="absolute inset-0 pointer-events-none">
          {OVERLAYS.map((overlay, i) => (
            <div
              key={overlay.text}
              ref={(el) => {
                overlayRefs.current[i] = el;
              }}
              className="absolute left-[8%] right-[8%] bottom-[15%] max-w-2xl opacity-0 transition-opacity duration-100 ease-linear"
            >
              <p className="text-[clamp(28px,4vw,56px)] leading-[1.1] tracking-tight text-foreground italic">
                {overlay.text}
              </p>
            </div>
          ))}
        </div>

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-[0.2em] text-muted">
            LOADING
          </div>
        )}
      </div>
    </section>
  );
}
