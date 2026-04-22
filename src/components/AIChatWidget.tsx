import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Loader2, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type Msg = { role: "user" | "assistant"; content: string };
type LangPref = "english" | "telugu" | "telglish";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wellness-chat`;

function buildContextMessage(
  text: string,
  langPref: LangPref,
  voiceFeatures?: {
    pitch: "high" | "medium" | "low";
    tone: string;
    energy: "high" | "low";
    speed: "fast" | "slow" | "normal";
  }
): string {
  const context: Record<string, unknown> = {
    text,
    language_preference: langPref,
    user_gender: "unknown",
  };
  if (voiceFeatures) {
    context.voice_features = voiceFeatures;
  }
  return `[CONTEXT] ${JSON.stringify(context)}\n\n${text}`;
}

// Strip metadata line from display
function cleanResponse(content: string): string {
  return content.replace(/\n?\[EMOTION:.*?\]$/m, "").trim();
}

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    onError("Please log in to use the AI assistant.");
    return;
  }

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Something went wrong");
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { /* partial */ }
    }
  }
  onDone();
}

const WELCOME: Msg = {
  role: "assistant",
  content: "Hi there! 👋 I'm your MindFit wellness companion. How are you feeling today? I'm here to help with stress, focus, sleep, or anything on your mind.",
};

export function AIChatWidget() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLang, setChatLang] = useState<LangPref>(lang === "te" ? "telugu" : "english");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const cycleLang = () => {
    setChatLang((prev) => {
      if (prev === "english") return "telugu";
      if (prev === "telugu") return "telglish";
      return "english";
    });
  };

  const langLabel: Record<LangPref, string> = {
    english: "EN",
    telugu: "తె",
    telglish: "T+E",
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const contextMsg = buildContextMessage(text, chatLang);
    const userMsg: Msg = { role: "user", content: text };
    const apiUserMsg: Msg = { role: "user", content: contextMsg };

    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    let soFar = "";
    const allMsgs = [
      ...messages.filter((m) => m !== WELCOME).map((m) =>
        m.role === "user" ? { ...m, content: buildContextMessage(m.content, chatLang) } : m
      ),
      apiUserMsg,
    ];

    await streamChat({
      messages: allMsgs,
      onDelta: (chunk) => {
        soFar += chunk;
        const cleaned = cleanResponse(soFar);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last !== WELCOME) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: cleaned } : m));
          }
          return [...prev, { role: "assistant", content: cleaned }];
        });
      },
      onDone: () => setLoading(false),
      onError: (msg) => {
        setMessages((p) => [...p, { role: "assistant", content: `⚠️ ${msg}` }]);
        setLoading(false);
      },
    });
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-primary text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open AI assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <Card className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] rounded-2xl glass-card flex flex-col shadow-xl animate-fade-in-up overflow-hidden">
          {/* Header */}
          <div className="gradient-primary px-4 py-3 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-2 text-white">
              <Bot className="h-5 w-5" />
              <span className="font-heading font-semibold text-sm">MindFit AI</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={cycleLang}
                className="text-white hover:bg-white/20 h-8 w-8 text-xs font-bold"
                title={`Language: ${chatLang}`}
              >
                <span className="text-[10px]">{langLabel[chatLang]}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-white hover:bg-white/20 h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>ul]:mb-1">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-secondary" />
                    </div>
                  )}
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-xl px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={chatLang === "telugu" ? "మీరు ఎలా ఉన్నారు?" : chatLang === "telglish" ? "How are you feeling ra?" : "How are you feeling?"}
              className="text-sm"
              disabled={loading}
            />
            <Button size="icon" onClick={send} disabled={loading || !input.trim()} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
