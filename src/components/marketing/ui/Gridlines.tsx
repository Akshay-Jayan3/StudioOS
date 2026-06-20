export default function GridLines() {
    return (
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="w-full max-w-7xl h-full grid grid-cols-4 border-x border-white/5">
  
          {/* Column 1 */}
          <div className="hidden md:block border-r border-gold/8 animate-grid-line delay-0" />
  
          {/* Column 2 (center on mobile) */}
          <div className="hidden md:block border-r border-gold/8 animate-grid-line delay-150" />
  
          {/* Column 3 */}
          <div className="hidden md:block border-r border-gold/8 animate-grid-line delay-300" />
  
          {/* Column 4 */}
          <div className="hidden mg:block border-r border-gold/8 animate-grid-line delay-150" />
  
        </div>
      </div>
    );
  }
  