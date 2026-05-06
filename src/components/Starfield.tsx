import { Invader } from "./Invader";

export function Starfield() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 starfield opacity-70" />
      <div className="absolute top-[12%] invader-drift" style={{ animationDelay: "0s" }}>
        <Invader color="magenta" size={5} className="invader-float" />
      </div>
      <div className="absolute top-[28%] invader-drift" style={{ animationDelay: "-4s", animationDuration: "16s" }}>
        <Invader color="cyan" size={4} className="invader-float" />
      </div>
      <div className="absolute top-[62%] invader-drift" style={{ animationDelay: "-8s", animationDuration: "20s" }}>
        <Invader color="green" size={6} className="invader-float" />
      </div>
      <div className="absolute top-[78%] invader-drift" style={{ animationDelay: "-2s", animationDuration: "14s" }}>
        <Invader color="yellow" size={4} className="invader-float" />
      </div>
    </div>
  );
}
