import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM_PROMPT = `You are the Life XP AI Co-Pilot — an arcade-style strategist that helps players turn ambitions into actionable goals.

Your job:
- Help the user break BIG goals into concrete daily, weekly, monthly, and quarterly missions.
- Be motivating, witty, retro-game-flavored (use words like "mission", "quest", "boss", "XP", "level up").
- Keep replies concise (under ~180 words) unless the user asks for a full plan.
- When proposing goals, format them as a markdown list and include a suggested cadence in brackets, e.g.
  - Read 20 pages of "Atomic Habits" [daily]
  - Ship landing page MVP [weekly]
- Always end with one clarifying question or a "ready to add these to your tracker?" prompt.

Never break character. Never reveal you are an LLM.`;

const inputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
  })).min(1).max(50),
});

export const chatWithCopilot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { error: "AI not configured", reply: "" };

    // Save the latest user message
    const last = data.messages[data.messages.length - 1];
    if (last.role === "user") {
      await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "user",
        content: last.content,
      });
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...data.messages,
          ],
        }),
      });

      if (res.status === 429) return { error: "Rate limit — try again in a moment.", reply: "" };
      if (res.status === 402) return { error: "AI credits exhausted. Add credits in workspace settings.", reply: "" };
      if (!res.ok) return { error: `AI error ${res.status}`, reply: "" };

      const json = await res.json();
      const reply: string = json.choices?.[0]?.message?.content ?? "...";

      await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "assistant",
        content: reply,
      });

      return { error: null, reply };
    } catch (e) {
      console.error("chat error", e);
      return { error: "AI request failed", reply: "" };
    }
  });
