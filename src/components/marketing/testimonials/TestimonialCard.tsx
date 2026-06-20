type Props = {
    quote: string;
    name: string;
    role: string;
    avatar: string;
  };
  
  export default function TestimonialCard({
    quote,
    name,
    role,
    avatar,
  }: Props) {
    return (
      <div
        className="
          testimonial-card
          w-[420px]
          shrink-0
          rounded-2xl
          border border-white/10
          bg-black/60
          backdrop-blur-md
          p-8
          transition-all duration-300
        "
      >
        <p className="text-white/80 leading-relaxed">
          “{quote}”
        </p>
  
        <div className="mt-6 flex items-center gap-4">
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-white/50">{role}</p>
          </div>
        </div>
      </div>
    );
  }
  