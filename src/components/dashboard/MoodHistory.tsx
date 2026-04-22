import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import type { MoodCheckin } from "@/hooks/useMoodCheckins";
import { useLanguage } from "@/contexts/LanguageContext";

const moodEmojis: Record<string, string> = {
  Happy: "😊", Calm: "😌", Neutral: "😐",
  Stressed: "😰", Sad: "😢", Angry: "😠", "Burnt Out": "🔥",
};

const moodTelugu: Record<string, string> = {
  Happy: "సంతోషం", Calm: "ప్రశాంతం", Neutral: "సాధారణం",
  Stressed: "ఒత్తిడి", Sad: "బాధ", Angry: "కోపం", "Burnt Out": "అలసట",
};

interface Props {
  checkins: MoodCheckin[];
}

export function MoodHistory({ checkins }: Props) {
  const { t } = useLanguage();

  if (checkins.length === 0) {
    return (
      <Card className="rounded-2xl glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {t("Check-in History", "చెక్-ఇన్ చరిత్ర")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-6">
            {t("No check-ins yet. Complete your first check-in above!", "ఇంకా చెక్-ఇన్‌లు లేవు. మీ మొదటి చెక్-ఇన్ పూర్తి చేయండి!")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          {t("Check-in History", "చెక్-ఇన్ చరిత్ర")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {checkins.map((c) => {
          const date = new Date(c.created_at);
          const dateStr = date.toLocaleDateString(undefined, {
            weekday: "short", month: "short", day: "numeric",
          });
          const timeStr = date.toLocaleTimeString(undefined, {
            hour: "2-digit", minute: "2-digit",
          });

          return (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/20 transition-colors"
            >
              <span className="text-2xl">{moodEmojis[c.mood] || "😐"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {t(c.mood, moodTelugu[c.mood] || c.mood)}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {c.intensity}/10
                  </Badge>
                </div>
                <div className="flex gap-3 text-[11px] text-muted-foreground mt-0.5">
                  <span>⚡ {c.energy_score}/10</span>
                  <span>🎯 {c.focus_score}/10</span>
                  <span>😴 {c.sleep_hours}h</span>
                  {c.stress_score && <span>📊 {t("Stress", "ఒత్తిడి")}: {c.stress_score}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">{dateStr}</p>
                <p className="text-[10px] text-muted-foreground">{timeStr}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
