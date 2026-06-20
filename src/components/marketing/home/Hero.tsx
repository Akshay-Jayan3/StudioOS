import Image from "next/image";
import GradientHeadline from "../ui/GradientText";
import GoldButton from "../ui/GoldButton";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-8">

      {/* Background Image */}
      <Image
        src="/images/hero.png"
        alt="Luxury interior design"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Optional soft vignette */}
      <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-black/90" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl px-6 py-20">
        <GradientHeadline className="mt-6 text-[12vw] md:text-[6rem] leading-[0.9]">
          Interiors, thoughtfully composed.
        </GradientHeadline>


        <p className="mt-8 text-white/70 text-lg max-w-xl mx-auto">
          We design and deliver refined residential and commercial spaces
          where material, proportion, and light shape the way people live.
        </p>


        <div className="mt-10 flex justify-center gap-6">
          <GoldButton>Book Consultation</GoldButton>
        </div>
      </div>

    </section>
  );
}
