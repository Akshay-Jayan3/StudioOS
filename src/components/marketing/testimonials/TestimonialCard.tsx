type Props = {
  quote: string;
  name: string;
  handle: string;
  color: string;
};

export default function TestimonialCard({ quote, name, handle, color }: Props) {
  return (
    <div
      className="
        testimonial-card
        w-full
        rounded-2xl
        border border-white/10
        bg-black/40
        backdrop-blur-md
        p-6
        transition-all duration-300
      "
    >
      <p className="text-white/80 text-sm leading-relaxed">{quote}</p>

      <div className="mt-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-white/40">{handle}</p>
        </div>
      </div>
    </div>
  );
}
