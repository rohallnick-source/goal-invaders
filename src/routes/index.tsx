import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Invader } from "@/components/Invader";
import { ArcadeButton } from "@/components/ArcadeButton";
import { XPBar } from "@/components/XPBar";
import { Starfield } from "@/components/Starfield";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Life XP — Level Up Your Goals" },
      {
        name: "description",
        content:
          "Life XP turns your goals into an arcade quest. Plan with AI, earn XP, unlock badges, and watch friends level up.",
      },
      { property: "og:title", content: "Life XP — Level Up Your Goals" },
      {
        property: "og:description",
        content:
          "Turn daily, weekly, monthly and quarterly goals into XP. Plan with AI. Earn badges. Beat the high score.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const goAuth = () => navigate({ to: user ? "/dashboard" : "/auth" });
  return (
    <div className="min-h-screen scanlines crt-flicker relative overflow-hidden">
      <Starfield />

      {/* Nav */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-border/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Invader color="green" size={4} className="invader-float" />
          <span className="font-pixel text-sm sm:text-base text-neon-green text-glow-green">
            LIFE XP
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
          <a href="#how" className="hover:text-neon-cyan transition">
            How it works
          </a>
          <a href="#badges" className="hover:text-neon-magenta transition">
            Badges
          </a>
          <a href="#feed" className="hover:text-neon-green transition">
            Feed
          </a>
          <a href="#feedback" className="hover:text-neon-yellow transition">
            Feedback
          </a>
        </nav>
        <ArcadeButton variant="magenta" onClick={goAuth} className="hidden sm:inline-block">
          {user ? "Dashboard" : "Insert Coin"}
        </ArcadeButton>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-20 pb-28 max-w-6xl mx-auto text-center">
        <div className="font-pixel text-[10px] text-neon-cyan text-glow-cyan mb-6 blink">
          ★ PLAYER 1 — PRESS START ★
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl text-neon-green text-glow-green leading-tight">
          LEVEL UP
          <br />
          YOUR LIFE.
        </h1>
        <p className="mt-8 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
          Life XP turns your goals into an arcade quest. Plan with an AI co-pilot, smash daily
          missions, earn XP, and unlock pixel badges as you ascend the leaderboard.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
          <ArcadeButton variant="green" onClick={goAuth}>
            {user ? "Enter Dashboard" : "Start Quest"}
          </ArcadeButton>
          <ArcadeButton variant="cyan" onClick={goAuth}>
            {user ? "Continue Mission" : "Sign In"}
          </ArcadeButton>
        </div>

        {/* XP preview card */}
        <div className="mt-16 max-w-md mx-auto bg-card/80 backdrop-blur p-6 pixel-border">
          <div className="flex items-center gap-4 mb-4">
            <Invader color="magenta" size={5} className="invader-float" />
            <div className="text-left">
              <div className="font-pixel text-xs text-neon-magenta text-glow-magenta">
                CMDR_NOVA
              </div>
              <div className="text-sm text-muted-foreground">Daily streak: 12 ☄</div>
            </div>
          </div>
          <XPBar level={7} current={840} max={1000} />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl text-neon-cyan text-glow-cyan text-center mb-14">
          HOW THE GAME WORKS
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              color: "green" as const,
              title: "AI CO-PILOT",
              body: "Chat with your AI strategist to break dreams into daily, weekly, monthly and quarterly missions.",
            },
            {
              color: "magenta" as const,
              title: "EARN XP",
              body: "Every task is worth XP. Daily quests fuel streaks. Weekly bosses drop bigger rewards.",
            },
            {
              color: "cyan" as const,
              title: "UNLOCK BADGES",
              body: "Pixel-perfect badges and new ranks unlock as you level. Show them off on your feed.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-card/70 backdrop-blur p-6 pixel-border hover:-translate-y-1 transition-transform duration-300"
            >
              <Invader color={c.color} size={5} className="invader-float mb-4" />
              <h3
                className={`text-sm mb-3 ${c.color === "green" ? "text-neon-green text-glow-green" : c.color === "magenta" ? "text-neon-magenta text-glow-magenta" : "text-neon-cyan text-glow-cyan"}`}
              >
                {c.title}
              </h3>
              <p className="text-muted-foreground text-base">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Badges showcase */}
      <section id="badges" className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl text-neon-magenta text-glow-magenta text-center mb-4">
          UNLOCKABLE RANKS
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          From Rookie Pilot to Galaxy Commander.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { name: "ROOKIE", lvl: "1-9", color: "cyan" as const },
            { name: "PILOT", lvl: "10-24", color: "green" as const },
            { name: "ACE", lvl: "25-49", color: "yellow" as const },
            { name: "COMMANDER", lvl: "50+", color: "magenta" as const },
          ].map((b) => (
            <div key={b.name} className="flex flex-col items-center bg-card/60 p-5 pixel-border">
              <Invader color={b.color} size={6} className="invader-float mb-3" />
              <div className="font-pixel text-[10px] text-foreground">{b.name}</div>
              <div className="text-xs text-muted-foreground mt-1">LVL {b.lvl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feed teaser */}
      <section id="feed" className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl text-neon-green text-glow-green text-center mb-12">
          THE GUILD FEED
        </h2>
        <div className="space-y-4">
          {[
            {
              user: "CMDR_NOVA",
              color: "magenta" as const,
              msg: "cleared WEEKLY BOSS — Ship 3 client deliverables",
              xp: 250,
            },
            {
              user: "PIXEL_SAGE",
              color: "cyan" as const,
              msg: "unlocked badge: 30-Day Reading Streak",
              xp: 500,
            },
            {
              user: "GALAXY_GWEN",
              color: "green" as const,
              msg: "completed quarterly quest — Launch side project",
              xp: 2000,
            },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-4 bg-card/70 p-4 pixel-border">
              <Invader color={p.color} size={4} />
              <div className="flex-1">
                <span
                  className={`font-pixel text-[10px] ${p.color === "magenta" ? "text-neon-magenta" : p.color === "cyan" ? "text-neon-cyan" : "text-neon-green"}`}
                >
                  {p.user}
                </span>{" "}
                <span className="text-muted-foreground">{p.msg}</span>
              </div>
              <div className="font-pixel text-[10px] text-neon-yellow">+{p.xp} XP</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback CTA */}
      <section id="feedback" className="relative z-10 px-6 py-24 max-w-3xl mx-auto text-center">
        <h2
          className="text-2xl sm:text-3xl text-neon-yellow text-glow-cyan mb-6"
          style={{ textShadow: "0 0 12px var(--neon-yellow)" }}
        >
          GAME FEEDBACK
        </h2>
        <p className="text-muted-foreground mb-8">
          Found a bug? Got an idea for a new boss fight? Players who submit feedback earn rare XP
          boosters.
        </p>
        <ArcadeButton variant="magenta">Send Transmission</ArcadeButton>
      </section>

      <footer className="relative z-10 px-6 py-8 border-t border-border/60 text-center font-pixel text-[10px] text-muted-foreground">
        © {new Date().getFullYear()} LIFE XP — GAME ON.
      </footer>
    </div>
  );
}
