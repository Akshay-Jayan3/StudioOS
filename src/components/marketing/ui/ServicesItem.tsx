type Props = {
    number: string;
    title: string;
    detail: string;
  };
  
  export default function ServiceItem({ number, title, detail }: Props) {
    return (
      <div
        className="
          group
          relative
          border border-white/10
          rounded-xl
          p-3
          overflow-hidden
          transition-all
          duration-500
          bg-surface
          hover:border-gold/40
        "
      >
        <div className="flex justify-between gap-2 items-start">
  
          {/* Left title */}
          <div className="flex items-center gap-6">
            <span className="text-xs font-mono text-white/30">{number}</span>
            <h3 className="font-manrope text-lg whitespace-nowrap">{title}</h3>
          </div>
  
          {/* Right detail */}
          <p
            className="
              text-white/40
              hidden md:block 
              max-w-sm
              opacity-0
              translate-x-6
              transition-all duration-500
              group-hover:opacity-100
              group-hover:translate-x-0
              text-sm
            "
          >
            {detail}
          </p>
  
        </div>
      </div>
    );
  }
  