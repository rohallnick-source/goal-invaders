type InvaderProps = {
  color?: "green" | "magenta" | "cyan" | "yellow";
  size?: number;
  className?: string;
};

const colorMap = {
  green: "var(--neon-green)",
  magenta: "var(--neon-magenta)",
  cyan: "var(--neon-cyan)",
  yellow: "var(--neon-yellow)",
};

// 11x8 classic invader grid
const PIXELS = [
  [0,0,1,0,0,0,0,0,1,0,0],
  [0,0,0,1,0,0,0,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,1],
  [0,0,0,1,1,0,1,1,0,0,0],
];

export function Invader({ color = "green", size = 6, className = "" }: InvaderProps) {
  const fill = colorMap[color];
  return (
    <div
      role="img"
      aria-label="space invader"
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(11, ${size}px)`,
        gridTemplateRows: `repeat(8, ${size}px)`,
        filter: `drop-shadow(0 0 8px ${fill})`,
      }}
    >
      {PIXELS.flat().map((p, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            background: p ? fill : "transparent",
          }}
        />
      ))}
    </div>
  );
}
