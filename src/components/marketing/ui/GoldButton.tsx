export default function GoldButton({
  children,
  type = "button",
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className="relative inline-flex items-center justify-center w-full sm:w-auto">

      {/* OUTER GLOW */}
      <div
        className="
          absolute inset-[16px]
          rounded-full blur-2xl
          bg-[linear-gradient(135deg,#f7e7a1,#d4af37,#b8962e)]
          opacity-70
        "
      />

      {/* BUTTON */}
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10

          /* Responsive sizing */
          px-6 sm:px-8 md:px-10 lg:px-6
          py-3 sm:py-3.5 md:py-3

          text-sm sm:text-base md:text-md

          rounded-md
          font-medium
          text-black

          bg-[linear-gradient(135deg,#f7e7a1,#d4af37,#b8962e)]
          shadow-[0_0_40px_rgba(212,175,55,0.6)]

          transition-all duration-300 ease-out
          hover:scale-[1.03]
          hover:shadow-[0_0_70px_rgba(212,175,55,0.75)]
          active:scale-[0.98]
          disabled:opacity-50 disabled:hover:scale-100
          ${className || ""}
        `}
      >
        {/* INNER GLASS HIGHLIGHT */}
        <span
          className="
            absolute inset-0
            rounded-md
            bg-white/20
            backdrop-blur-md
            pointer-events-none
          "
        />

        <span className="relative z-10 whitespace-nowrap">
          {children}
        </span>
      </button>
    </div>
  );
}
