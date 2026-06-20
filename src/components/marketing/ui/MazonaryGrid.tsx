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
          <img
            key={i}
            src={src}
            className="rounded-xl w-full object-cover"
            alt=""
          />
        ))}
      </div>
    </div>
  );
}
