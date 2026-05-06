import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { chatWithCopilot } from "@/server/copilot.functions";
import { Invader } from "@/components/Invader";
import { ArcadeButton } from "@/components/ArcadeButton";
import { XPBar } from "@/components/XPBar";
import { Starfield } from "@/components/Starfield";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { LogOut, Send, Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Goal = Tables<"goals">;
type Profile = Tables<"profiles">;
type Cadence = Goal["cadence"];

const XP_BY_CADENCE: Record<Cadence, number> = {
  daily: 10,
  weekly: 50,
  monthly: 200,
  quarterly: 1000,
};

const CADENCE_COLORS: Record<Cadence, "green" | "cyan" | "magenta" | "yellow"> = {
  daily: "green",
  weekly: "cyan",
  monthly: "magenta",
  quarterly: "yellow",
};

const RANK_FOR_LEVEL = (lvl: number) =>
  lvl >= 50 ? "COMMANDER" : lvl >= 25 ? "ACE" : lvl >= 10 ? "PILOT" : "ROOKIE";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Life XP — Mission Control" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: p }, { data: g }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setGoals(g ?? []);
    };
    load();

    const channel = supabase
      .channel("profile-" + user.id)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => setProfile(payload.new as Profile))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center scanlines">
        <Starfield />
        <div className="font-pixel text-neon-green text-glow-green blink relative z-10">LOADING…</div>
      </div>
    );
  }

  const xpInLevel = profile.total_xp % 1000;
  const rank = RANK_FOR_LEVEL(profile.level);

  return (
    <div className="min-h-screen scanlines crt-flicker relative">
      <Starfield />
      <header className="relative z-10 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border/60 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-3">
          <Invader color="green" size={3} className="invader-float" />
          <span className="font-pixel text-xs sm:text-sm text-neon-green text-glow-green">LIFE XP</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="font-pixel text-[10px] text-neon-magenta">{profile.display_name}</div>
            <div className="font-pixel text-[9px] text-neon-yellow">LVL {profile.level} · {rank}</div>
          </div>
          <button onClick={signOut} className="p-2 hover:text-neon-magenta transition" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* HUD */}
        <div className="bg-card/80 backdrop-blur p-5 pixel-border">
          <div className="flex items-center gap-4 mb-4">
            <Invader color={profile.avatar_color as any} size={4} className="invader-float" />
            <div className="flex-1">
              <div className="font-pixel text-xs text-neon-magenta text-glow-magenta">{profile.display_name}</div>
              <div className="text-xs text-muted-foreground">{rank} · {profile.total_xp} XP TOTAL</div>
            </div>
          </div>
          <XPBar level={profile.level} current={xpInLevel} max={1000} />
        </div>

        <Tabs defaultValue="copilot" className="w-full">
          <TabsList className="bg-card/60 pixel-border w-full grid grid-cols-2">
            <TabsTrigger value="copilot" className="font-pixel text-[10px]">AI CO-PILOT</TabsTrigger>
            <TabsTrigger value="goals" className="font-pixel text-[10px]">GOALS</TabsTrigger>
          </TabsList>

          <TabsContent value="copilot" className="mt-4">
            <CopilotChat onAddGoal={(t, c) => addGoalQuick(user.id, t, c, setGoals)} />
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            <GoalsBoard goals={goals} setGoals={setGoals} userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

async function addGoalQuick(
  userId: string,
  title: string,
  cadence: Cadence,
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>,
) {
  const { data, error } = await supabase
    .from("goals")
    .insert({ user_id: userId, title, cadence, xp_reward: XP_BY_CADENCE[cadence] })
    .select()
    .single();
  if (error) return toast.error(error.message);
  setGoals((g) => [data, ...g]);
  toast.success(`+ Mission added (${cadence})`);
}

/* ─────────── Co-pilot chat ─────────── */

type Msg = { role: "user" | "assistant"; content: string };

function CopilotChat({ onAddGoal }: { onAddGoal: (title: string, cadence: Cadence) => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const callChat = useServerFn(chatWithCopilot);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data?.length) setMessages(data.filter((m) => m.role !== "system") as Msg[]);
        else setMessages([{
          role: "assistant",
          content: "★ CO-PILOT ONLINE ★\n\nWhat's the boss you're trying to defeat? Tell me a goal — fitness, career, learning, anything — and I'll break it into daily, weekly, monthly and quarterly missions worth real XP.",
        }]);
      });
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const { reply, error } = await callChat({ data: { messages: next } });
      if (error) toast.error(error);
      if (reply) setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error(e.message ?? "Co-pilot offline");
    } finally {
      setBusy(false);
    }
  };

  // Parse "- Goal text [cadence]" lines from the latest assistant message
  const parseGoals = (text: string) => {
    const re = /^[-*]\s+(.+?)\s*\[(daily|weekly|monthly|quarterly)\]/gim;
    const out: { title: string; cadence: Cadence }[] = [];
    let m;
    while ((m = re.exec(text))) out.push({ title: m[1].trim(), cadence: m[2].toLowerCase() as Cadence });
    return out;
  };

  return (
    <div className="bg-card/80 backdrop-blur pixel-border flex flex-col h-[60vh] min-h-[420px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const suggestions = !isUser ? parseGoals(m.content) : [];
          return (
            <div key={i} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              <div className="shrink-0 mt-1">
                <Invader color={isUser ? "magenta" : "cyan"} size={3} />
              </div>
              <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
                <div className={`font-pixel text-[9px] mb-1 ${isUser ? "text-neon-magenta" : "text-neon-cyan"}`}>
                  {isUser ? "YOU" : "CO-PILOT"}
                </div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground bg-background/40 p-3 pixel-border inline-block text-left">
                  {m.content}
                </div>
                {suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 justify-start">
                    {suggestions.map((s, j) => (
                      <button
                        key={j}
                        onClick={() => onAddGoal(s.title, s.cadence)}
                        className="font-pixel text-[9px] px-2 py-1 pixel-border bg-background/60 hover:bg-neon-green/10 hover:text-neon-green transition"
                      >
                        + {s.cadence.toUpperCase()}: {s.title.slice(0, 40)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {busy && (
          <div className="flex gap-3">
            <Invader color="cyan" size={3} className="invader-float" />
            <div className="font-pixel text-[10px] text-neon-cyan blink">CO-PILOT THINKING…</div>
          </div>
        )}
      </div>
      <div className="border-t border-border/60 p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Describe your goal, ask for a plan…"
          disabled={busy}
        />
        <ArcadeButton variant="green" onClick={send} disabled={busy}>
          <Send className="w-3 h-3" />
        </ArcadeButton>
      </div>
    </div>
  );
}

/* ─────────── Goals board ─────────── */

function GoalsBoard({
  goals, setGoals, userId,
}: { goals: Goal[]; setGoals: React.Dispatch<React.SetStateAction<Goal[]>>; userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cadence, setCadence] = useState<Cadence>("daily");

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { data, error } = await supabase.from("goals").insert({
      user_id: userId,
      title: title.trim(),
      description: desc.trim() || null,
      cadence,
      xp_reward: XP_BY_CADENCE[cadence],
    }).select().single();
    if (error) return toast.error(error.message);
    setGoals((g) => [data, ...g]);
    setTitle(""); setDesc(""); setShowForm(false);
    toast.success("Mission added!");
  };

  const toggle = async (goal: Goal) => {
    const { data, error } = await supabase
      .from("goals")
      .update({ completed: !goal.completed })
      .eq("id", goal.id)
      .select()
      .single();
    if (error) return toast.error(error.message);
    setGoals((g) => g.map((x) => x.id === goal.id ? data : x));
    if (!goal.completed) toast.success(`+${goal.xp_reward} XP! ★`);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setGoals((g) => g.filter((x) => x.id !== id));
  };

  const cadences: Cadence[] = ["daily", "weekly", "monthly", "quarterly"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-pixel text-xs text-neon-cyan text-glow-cyan">★ MISSION TRACKER ★</h2>
        <ArcadeButton variant="magenta" onClick={() => setShowForm((s) => !s)}>
          <Plus className="w-3 h-3" /> {showForm ? "Cancel" : "New Mission"}
        </ArcadeButton>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-card/80 p-4 pixel-border space-y-3">
          <Input placeholder="Mission title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
          <Textarea placeholder="Optional details…" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} />
          <div className="flex flex-wrap gap-2">
            {cadences.map((c) => (
              <button key={c} type="button" onClick={() => setCadence(c)}
                className={`font-pixel text-[9px] px-3 py-2 pixel-border transition ${
                  cadence === c ? "bg-neon-green/20 text-neon-green text-glow-green" : "bg-background/40 text-muted-foreground hover:text-foreground"
                }`}>
                {c.toUpperCase()} · {XP_BY_CADENCE[c]} XP
              </button>
            ))}
          </div>
          <ArcadeButton type="submit" variant="green">Deploy Mission</ArcadeButton>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {cadences.map((c) => {
          const list = goals.filter((g) => g.cadence === c);
          const color = CADENCE_COLORS[c];
          return (
            <div key={c} className="bg-card/70 p-4 pixel-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-pixel text-[11px] text-neon-${color} text-glow-${color}`}>
                  {c.toUpperCase()}
                </h3>
                <span className="font-pixel text-[9px] text-muted-foreground">
                  {list.filter((g) => g.completed).length}/{list.length}
                </span>
              </div>
              {list.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No {c} missions yet.</p>
              ) : (
                <ul className="space-y-2">
                  {list.map((g) => (
                    <li key={g.id} className={`flex items-start gap-3 p-2 bg-background/40 transition ${g.completed ? "opacity-50" : ""}`}>
                      <Checkbox checked={g.completed} onCheckedChange={() => toggle(g)} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${g.completed ? "line-through" : ""}`}>{g.title}</div>
                        {g.description && <div className="text-xs text-muted-foreground mt-0.5">{g.description}</div>}
                        <div className="font-pixel text-[9px] text-neon-yellow mt-1">+{g.xp_reward} XP</div>
                      </div>
                      <button onClick={() => remove(g.id)} className="text-muted-foreground hover:text-neon-magenta transition" aria-label="Delete">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
