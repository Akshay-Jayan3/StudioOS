import Image from "next/image";

type Props = {
  images: string[];
  direction: "up" | "down";
  speed: number;
};

export default function MovingColumn({ images, direction, speed }: Props) {
  return (
    <div className="overflow-hidden h-full">
      <div
        className="flex flex-col gap-4 "
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction === "up" ? "normal" : "reverse",
        }}
      >
        {[...images, ...images].map((src, i) => (
          <div key={i} className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
