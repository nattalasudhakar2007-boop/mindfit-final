import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Activity, Calendar, TrendingUp, Target, Brain, Moon, Zap, Flame } from "lucide-react";
import type { MoodCheckin } from "@/hooks/useMoodCheckins";

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
  streak: number;
  todayCheckin: MoodCheckin | null;
}

export function DashboardOverview({ checkins, streak, todayCheckin }: Props) {
  const { t } = useLanguage();

  // Calculate summary stats
  const totalCheckins = checkins.length;
  const avgStress = totalCheckins > 0
    ? (checkins.reduce((sum, c) => sum + (c.stress_score ?? 0), 0) / totalCheckins).toFixed(1)
    : "—";
  const avgSleep = totalCheckins > 0
    ? (checkins.reduce((sum, c) => sum + c.sleep_hours, 0) / totalCheckins).toFixed(1)
    : "—";
  const avgEnergy = totalCheckins > 0
    ? (checkins.reduce((sum, c) => sum + c.energy_score, 0) / totalCheckins).toFixed(1)
    : "—";
  const avgFocus = totalCheckins > 0
    ? (checkins.reduce((sum, c) => sum + c.focus_score, 0) / totalCheckins).toFixed(1)
    : "—";

  // Most frequent mood
  const moodCounts: Record<string, number> = {};
  checkins.forEach((c) => {
    moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  // Mood distribution for mini chart
  const moodDistribution = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const summaryCards = [
    { icon: Calendar, label: t("Total Check-ins", "మొత్తం చెక్-ఇన్‌లు"), value: totalCheckins.toString(), color: "text-primary", bg: "bg-primary/10" },
    { icon: Flame, label: t("Current Streak", "ప్రస్తుత స్ట్రీక్"), value: `${streak} ${t("days", "రోజులు")}`, color: "text-wellness-orange", bg: "bg-wellness-orange/10" },
    { icon: TrendingUp, label: t("Avg Stress", "సగటు ఒత్తిడి"), value: `${avgStress}/10`, color: "text-destructive", bg: "bg-destructive/10" },
    { icon: Moon, label: t("Avg Sleep", "సగటు నిద్ర"), value: `${avgSleep}h`, color: "text-accent", bg: "bg-accent/10" },
    { icon: Zap, label: t("Avg Energy", "సగటు శక్తి"), value: `${avgEnergy}/10`, color: "text-wellness-green", bg: "bg-wellness-green/10" },
    { icon: Target, label: t("Avg Focus", "సగటు ఫోకస్"), value: `${avgFocus}/10`, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <Card className="rounded-2xl glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {t("Your Dashboard Overview", "మీ డాష్‌బోర్డ్ అవలోకనం")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {summaryCards.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card/50 text-center">
              <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-lg font-heading font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mood Distribution & Today Status */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Top Moods */}
          <div className="rounded-xl border border-border p-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              {t("Mood Distribution (Last 30 Days)", "మూడ్ పంపిణీ (చివరి 30 రోజులు)")}
            </p>
            {moodDistribution.length > 0 ? (
              <div className="space-y-1.5">
                {moodDistribution.map(([mood, count]) => {
                  const pct = Math.round((count / totalCheckins) * 100);
                  return (
                    <div key={mood} className="flex items-center gap-2">
                      <span className="text-lg">{moodEmojis[mood] || "😐"}</span>
                      <span className="text-xs w-20 truncate">{t(mood, moodTelugu[mood] || mood)}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{t("No data yet", "ఇంకా డేటా లేదు")}</p>
            )}
          </div>

          {/* Today's Check-in Status */}
          <div className="rounded-xl border border-border p-4 space-y-2">
            <p className="text-sm font-medium">{t("Today's Status", "ఈ రోజు స్థితి")}</p>
            {todayCheckin ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{moodEmojis[todayCheckin.mood] || "😐"}</span>
                  <div>
                    <p className="font-heading font-bold text-lg">
                      {t(todayCheckin.mood, moodTelugu[todayCheckin.mood] || todayCheckin.mood)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("Intensity", "తీవ్రత")}: {todayCheckin.intensity}/10
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-wellness-green" />
                    <span>{t("Energy", "శక్తి")}: {todayCheckin.energy_score}/10</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3 w-3 text-primary" />
                    <span>{t("Focus", "ఫోకస్")}: {todayCheckin.focus_score}/10</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Moon className="h-3 w-3 text-accent" />
                    <span>{t("Sleep", "నిద్ర")}: {todayCheckin.sleep_hours}h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-destructive" />
                    <span>{t("Stress", "ఒత్తిడి")}: {todayCheckin.stress_score ?? "—"}/10</span>
                  </div>
                </div>
                {todayCheckin.reasons && todayCheckin.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {todayCheckin.reasons.map((r) => (
                      <Badge key={r} variant="outline" className="text-[10px] px-1.5 py-0">{r}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <span className="text-3xl mb-2">📝</span>
                <p className="text-sm text-muted-foreground">
                  {t("You haven't checked in today. Scroll down to start!", "మీరు ఈ రోజు చెక్-ఇన్ చేయలేదు. ప్రారంభించడానికి క్రిందకు స్క్రోల్ చేయండి!")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top mood badge */}
        {topMood && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">{t("Most frequent mood:", "అత్యంత తరచుగా మూడ్:")}</span>
            <Badge className="gap-1">
              {moodEmojis[topMood[0]]} {t(topMood[0], moodTelugu[topMood[0]] || topMood[0])} ({topMood[1]}x)
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
