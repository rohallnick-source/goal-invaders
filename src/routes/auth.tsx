import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { ArcadeButton } from "@/components/ArcadeButton";
import { Invader } from "@/components/Invader";
import { Starfield } from "@/components/Starfield";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Life XP — Sign In" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [callsign, setCallsign] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: callsign || undefined },
          },
        });
        if (error) throw error;
        toast.success("Pilot registered. Entering arcade…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/dashboard`,
      });
      if (result.error) toast.error("Google sign-in failed");
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen scanlines crt-flicker relative overflow-hidden flex items-center justify-center px-4">
      <Starfield />
      <div className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur p-8 pixel-border">
        <Link to="/" className="flex items-center gap-3 mb-6 justify-center">
          <Invader color="green" size={4} className="invader-float" />
          <span className="font-pixel text-sm text-neon-green text-glow-green">LIFE XP</span>
        </Link>
        <h1 className="font-pixel text-xs text-neon-cyan text-glow-cyan text-center mb-6">
          {mode === "signin" ? "★ ENTER COORDINATES ★" : "★ NEW PILOT ★"}
        </h1>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <Input
              placeholder="Callsign (optional)"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              maxLength={32}
            />
          )}
          <Input
            type="email"
            placeholder="email@galaxy.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password (min 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <ArcadeButton type="submit" variant="green" disabled={busy} className="w-full">
            {busy ? "..." : mode === "signin" ? "Press Start" : "Begin Quest"}
          </ArcadeButton>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="font-pixel text-[9px] text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <ArcadeButton variant="cyan" onClick={google} disabled={busy} className="w-full">
          Sign in with Google
        </ArcadeButton>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-neon-magenta transition"
        >
          {mode === "signin" ? "No account? Register a new pilot →" : "← Already a pilot? Sign in"}
        </button>
      </div>
    </div>
  );
}
