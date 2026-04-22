import { Flame, Brain, Zap, Moon } from "lucide-react";
import type { MoodCheckin } from "@/hooks/useMoodCheckins";

interface Props {
  todayCheckin: MoodCheckin | null;
  streak: number;
}

const moodEmojis: Record<string, string> = {
  Happy: "😊", Calm: "😌", Neutral: "😐",
  Stressed: "😰", Sad: "😢", Angry: "😠", "Burnt Out": "🔥",
};

export function QuickStats({ todayCheckin, streak }: Props) {
  const energyScore = todayCheckin?.energy_score ?? 0;
  const energyColor = energyScore >= 8 ? "text-wellness-red" : energyScore >= 5 ? "text-wellness-orange" : "text-wellness-green";
  const energyBg = energyScore >= 8 ? "bg-wellness-red/10" : energyScore >= 5 ? "bg-wellness-orange/10" : "bg-wellness-green/10";

  const stats = [
    {
      icon: Flame,
      label: "Streak",
      value: `${streak} day${streak !== 1 ? "s" : ""}`,
      color: "text-wellness-orange",
      bg: "bg-wellness-orange/10",
    },
    {
      icon: Brain,
      label: "Today's Mood",
      value: todayCheckin ? `${moodEmojis[todayCheckin.mood] || "😐"} ${todayCheckin.mood}` : "—",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Zap,
      label: "Energy",
      value: todayCheckin ? `${todayCheckin.energy_score}/10` : "—",
      color: energyColor,
      bg: energyBg,
    },
    {
      icon: Moon,
      label: "Sleep",
      value: todayCheckin ? `${todayCheckin.sleep_hours}h` : "—",
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 p-4 rounded-2xl glass-card animate-fade-in-up"
        >
          <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
            <s.icon className={`h-5 w-5 ${s.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-sm font-heading font-semibold truncate">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
