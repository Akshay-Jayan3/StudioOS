type GradientHeadlineProps = {
    children: React.ReactNode;
    as?: "h1" | "h2";
    className?: string;
  };
  
  export default function GradientHeadline({
    children,
    as = "h1",
    className = "",
  }: GradientHeadlineProps) {
    const Tag = as;
  
    return (
      <Tag
        className={`
          inline-block
          font-medium
          tracking-tight
          text-transparent
          bg-clip-text
          select-none
          mix-blend-exclusion
          pb-[0.15em]  /* 🔑 FIX FOR DESCENDERS */
          ${className}
        `}
        style={{
          backgroundImage: `
            linear-gradient(
              115deg,
              rgba(255,255,255,0.15) 30%,
              rgba(255,255,255,0.9) 45%,
              rgba(255,255,255,1) 50%,
              rgba(255,255,255,0.9) 55%,
              rgba(255,255,255,0.15) 70%
            )
          `,
          backgroundSize: "200% auto",
          animation: "light-scan 6s linear infinite",
          willChange: "background-position",
        }}
      >
        {children}
      </Tag>
    );
  }
  