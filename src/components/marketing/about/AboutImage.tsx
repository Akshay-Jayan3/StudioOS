"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const MotionImage = motion(Image);

export default function AboutRevealImage({ src = "/images/projects/living-room.png" }: { src?: string }) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Subtle cinematic transforms
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const brightness = useTransform(
    scrollYProgress,
    [0, 1],
    ["brightness(0.7)", "brightness(1)"]
  );

  return (
    <div
      ref={ref}
      className="
        relative
        h-[70vh]
        rounded-2xl
        overflow-hidden
        border border-white/10
      "
    >
      <MotionImage
        src={src}
        alt="Interior design studio work"
        fill
        sizes="100vw"
        style={{ scale, filter: brightness }}
        className="object-cover"
      />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
    </div>
  );
}
