import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "green" | "magenta" | "cyan";

interface ArcadeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  green: "bg-neon-green text-primary-foreground pixel-border-green hover:brightness-110",
  magenta: "bg-neon-magenta text-primary-foreground pixel-border-magenta hover:brightness-110",
  cyan: "bg-neon-cyan text-primary-foreground hover:brightness-110",
};

export const ArcadeButton = forwardRef<HTMLButtonElement, ArcadeButtonProps>(
  ({ className, variant = "green", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "font-pixel text-xs sm:text-sm uppercase tracking-widest px-6 py-4 transition-all duration-150 active:translate-y-0.5",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
ArcadeButton.displayName = "ArcadeButton";
