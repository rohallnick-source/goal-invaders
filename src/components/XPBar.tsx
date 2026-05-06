type XPBarProps = {
  level: number;
  current: number;
  max: number;
};

export function XPBar({ level, current, max }: XPBarProps) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="w-full font-pixel text-[10px] sm:text-xs">
      <div className="flex justify-between mb-2 text-muted-foreground">
        <span className="text-neon-green text-glow-green">LVL {level}</span>
        <span>{current} / {max} XP</span>
      </div>
      <div className="h-4 bg-muted pixel-border overflow-hidden">
        <div className="h-full xp-bar transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
