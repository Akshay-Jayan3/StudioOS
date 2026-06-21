// "Mini" mesh — small, fine grid cells rather than the larger 36-unit squares.
const COLS = 62;
const ROWS = 42;
const CELL = 20;
const START_X = -11.16;
const START_Y = 5.1;
const HIGHLIGHT_SIZE = 20;

const HIGHLIGHTS = [
  { x: 48.7, y: 45, opacity: 0.16 },
  { x: 108.7, y: 45, opacity: 0.18 },
  { x: 548.7, y: 45, opacity: 0.18 },
  { x: 608.7, y: 45, opacity: 0.16 },
  { x: 48.7, y: 125, opacity: 0.18 },
  { x: 68.7, y: 205, opacity: 0.13 },
  { x: 48.7, y: 285, opacity: 0.18 },
  { x: 608.7, y: 125, opacity: 0.18 },
  { x: 588.7, y: 205, opacity: 0.13 },
  { x: 608.7, y: 285, opacity: 0.18 },
  { x: 108.7, y: 345, opacity: 0.16 },
  { x: 548.7, y: 345, opacity: 0.13 },
];

export default function GridLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1220 810"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <g clipPath="url(#clip0_grid_nilaya)">
          <mask
            id="mask0_grid_nilaya"
            maskUnits="userSpaceOnUse"
            x="10"
            y="-1"
            width="1200"
            height="812"
            style={{ maskType: "alpha" }}
          >
            <rect x="10" y="-0.84668" width="1200" height="811.693" fill="url(#paint0_linear_grid_nilaya)" />
          </mask>
          <g mask="url(#mask0_grid_nilaya)">
            {Array.from({ length: COLS }).map((_, col) =>
              Array.from({ length: ROWS }).map((_, row) => (
                <rect
                  key={`${col}-${row}`}
                  x={START_X + col * CELL}
                  y={START_Y + row * CELL}
                  width={CELL - 0.08}
                  height={CELL - 0.08}
                  stroke="rgba(212,175,55,0.1)"
                  strokeWidth="0.08"
                  fill="none"
                />
              ))
            )}
            {HIGHLIGHTS.map((h, i) => (
              <rect key={i} x={h.x} y={h.y} width={HIGHLIGHT_SIZE} height={HIGHLIGHT_SIZE} fill={`rgba(212,175,55,${h.opacity})`} />
            ))}
          </g>
        </g>
        <rect x="0.5" y="0.5" width="1219" height="809" rx="15.5" stroke="rgba(255,255,255,0.06)" fill="none" />
        <defs>
          <linearGradient id="paint0_linear_grid_nilaya" x1="35.0676" y1="23.6807" x2="903.8" y2="632.086" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d4af37" stopOpacity="0" />
            <stop offset="1" stopColor="#d4af37" stopOpacity="0.6" />
          </linearGradient>
          <clipPath id="clip0_grid_nilaya">
            <rect width="1220" height="810" rx="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
