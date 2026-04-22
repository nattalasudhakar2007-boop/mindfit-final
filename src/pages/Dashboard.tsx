import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MoodCheckIn, type MoodData } from "@/components/dashboard/MoodCheckIn";
import { StressGauge } from "@/components/dashboard/StressGauge";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { WeeklyCharts } from "@/components/dashboard/WeeklyCharts";
import { MoodHistory } from "@/components/dashboard/MoodHistory";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wind, BookOpen, Music, StretchHorizontal, CheckCircle2, Sparkles, TrendingUp, Loader2, Heart, Dumbbell, Coffee, Smile } from "lucide-react";
import { useMoodCheckins } from "@/hooks/useMoodCheckins";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

const moodWeights: Record<string, number> = {
  Happy: 1, Calm: 2, Neutral: 4, Stressed: 7, Sad: 6, Angry: 8, "Burnt Out": 9,
};

function calcStress(d: MoodData): number {
  const m = (moodWeights[d.mood] ?? 5) / 10;
  const f = (10 - d.focusScore) / 10;
  const e = (10 - d.energyScore) / 10;
  const sh = (8 - Math.min(d.sleepHours, 8)) / 8;
  const sq = (5 - d.sleepQuality) / 5;
  const raw = (m * 0.3 + f * 0.2 + e * 0.15 + sh * 0.2 + sq * 0.15) * 10;
  return Math.max(1, Math.min(10, Math.round(raw * 10) / 10));
}

function suggestion(s: number, t: (en: string, te: string) => string) {
  if (s <= 3.5) return t(
    "Great job! You're in a good place. Keep up your healthy habits and consider a journaling session to reflect on what's going well.",
    "బాగుంది! మీరు మంచి స్థితిలో ఉన్నారు. మీ ఆరోగ్యకరమైన అలవాట్లను కొనసాగించండి మరియు బాగా జరుగుతున్న విషయాలపై ఆలోచించడానికి జర్నలింగ్ చేయండి."
  );
  if (s <= 6.5) return t(
    "You're experiencing moderate stress. Try a breathing exercise, listen to some focus music, or take a short walk to reset your mind.",
    "మీకు మోస్తరు ఒత్తిడి ఉంది. శ్వాస వ్యాయామం చేయండి, ఫోకస్ మ్యూజిక్ వినండి, లేదా మనసు రీసెట్ చేయడానికి చిన్న నడక చేయండి."
  );
  return t(
    "Your stress is elevated. Please prioritize rest, try a guided breathing session, reach out to a friend, and consider talking to a counselor.",
    "మీ ఒత్తిడి ఎక్కువగా ఉంది. దయచేసి విశ్రాంతికి ప్రాధాన్యత ఇవ్వండి, శ్వాస వ్యాయామం చేయండి, స్నేహితుడిని సంప్రదించండి, కౌన్సెలర్‌తో మాట్లాడటం పరిగణించండి."
  );
}

// Mood-based activity recommendations
function getActivities(mood: string | null, t: (en: string, te: string) => string) {
  if (mood === "Happy" || mood === "Calm") {
    return [
      { icon: BookOpen, title: t("Gratitude Journal", "కృతజ్ఞత జర్నల్"), desc: t("Write 3 things you're grateful for", "మీరు కృతజ్ఞత చెప్పే 3 విషయాలు రాయండి") },
      { icon: Music, title: t("Upbeat Playlist", "ఉత్సాహ సంగీతం"), desc: t("Keep the vibe going with happy tunes", "హ్యాపీ ట్యూన్స్‌తో ఉత్సాహంగా ఉండండి") },
      { icon: Smile, title: t("Share Kindness", "దయను పంచుకోండి"), desc: t("Compliment someone or send a kind message", "ఎవరికైనా ప్రశంసించండి లేదా మంచి సందేశం పంపండి") },
      { icon: Dumbbell, title: t("Light Workout", "తేలికపాటి వ్యాయామం"), desc: t("Channel your energy into a fun workout", "మీ శక్తిని వ్యాయామంలో ఉపయోగించండి") },
    ];
  }
  if (mood === "Stressed" || mood === "Angry") {
    return [
      { icon: Wind, title: t("Deep Breathing", "లోతైన శ్వాస"), desc: t("4-7-8 breathing for 5 minutes to calm down", "ప్రశాంతంగా ఉండటానికి 4-7-8 శ్వాస 5 నిమిషాలు") },
      { icon: StretchHorizontal, title: t("Stretch & Release", "స్ట్రెచ్ & విడుదల"), desc: t("Release tension with a full body stretch", "పూర్తి శరీర స్ట్రెచ్‌తో ఒత్తిడిని విడుదల చేయండి") },
      { icon: Music, title: t("Calming Sounds", "ప్రశాంత శబ్దాలు"), desc: t("Listen to nature sounds or lo-fi beats", "ప్రకృతి శబ్దాలు లేదా లో-ఫై బీట్స్ వినండి") },
      { icon: BookOpen, title: t("Stress Journal", "ఒత్తిడి జర్నల్"), desc: t("Write down what's bothering you", "మిమ్మల్ని ఏది బాధపెడుతుందో రాయండి") },
    ];
  }
  if (mood === "Sad") {
    return [
      { icon: Heart, title: t("Self-Compassion", "ఆత్మ-కరుణ"), desc: t("Be kind to yourself — you deserve it", "మీపై దయ చూపించుకోండి — మీరు దానికి అర్హులు") },
      { icon: Coffee, title: t("Comfort Activity", "సౌకర్య కార్యకలాపం"), desc: t("Make a warm drink and take a break", "వెచ్చని పానీయం తాగి విశ్రాంతి తీసుకోండి") },
      { icon: Music, title: t("Uplifting Music", "ఉత్తేజకరమైన సంగీతం"), desc: t("Listen to songs that lift your spirits", "మీ ఆత్మస్థైర్యాన్ని పెంచే పాటలు వినండి") },
      { icon: BookOpen, title: t("Positive Reading", "సానుకూల పఠనం"), desc: t("Read something inspiring or motivational", "ప్రేరణాత్మకమైన విషయం చదవండి") },
    ];
  }
  if (mood === "Burnt Out") {
    return [
      { icon: Wind, title: t("Guided Meditation", "గైడెడ్ ధ్యానం"), desc: t("10-minute guided relaxation session", "10 నిమిషాల గైడెడ్ రిలాక్సేషన్") },
      { icon: Coffee, title: t("Take a Real Break", "నిజమైన విశ్రాంతి"), desc: t("Step away from screens completely", "స్క్రీన్ల నుండి పూర్తిగా దూరంగా ఉండండి") },
      { icon: StretchHorizontal, title: t("Gentle Yoga", "సున్నితమైన యోగా"), desc: t("Slow, restorative yoga poses", "నెమ్మదిగా, పునరుద్ధరణ యోగా భంగిమలు") },
      { icon: Heart, title: t("Seek Support", "సహాయం కోరండి"), desc: t("Talk to someone you trust about how you feel", "మీకు నమ్మకమైన వ్యక్తితో మాట్లాడండి") },
    ];
  }
  // Default / Neutral
  return [
    { icon: Wind, title: t("Breathing Exercise", "శ్వాస వ్యాయామం"), desc: t("4-7-8 breathing for 5 minutes", "4-7-8 శ్వాస 5 నిమిషాలు") },
    { icon: BookOpen, title: t("Journaling Prompt", "జర్నలింగ్ ప్రాంప్ట్"), desc: t("Write 3 things you're grateful for", "మీరు కృతజ్ఞత చెప్పే 3 విషయాలు రాయండి") },
    { icon: Music, title: t("Focus Music", "ఫోకస్ మ్యూజిక్"), desc: t("Listen to lo-fi beats for 25 min", "25 నిమిషాలు లో-ఫై బీట్స్ వినండి") },
    { icon: StretchHorizontal, title: t("Stretch Routine", "స్ట్రెచ్ రొటీన్"), desc: t("5-minute desk stretch break", "5 నిమిషాల డెస్క్ స్ట్రెచ్ బ్రేక్") },
  ];
}

const Dashboard = () => {
  const { checkins, todayCheckin, streak, saveCheckin, getWeeklyData, loading } = useMoodCheckins();
  const { t } = useLanguage();
  const [moodData, setMoodData] = useState<MoodData | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const stress = moodData ? calcStress(moodData) : todayCheckin?.stress_score ?? null;
  const currentMood = moodData?.mood ?? todayCheckin?.mood ?? null;
  const activities = getActivities(currentMood, t);

  const handleSubmit = async (data: MoodData) => {
    setMoodData(data);
    setSaving(true);
    const result = await saveCheckin(data);
    setSaving(false);
    if (result) {
      toast({ title: t("Check-in saved! ✨", "చెక్-ఇన్ సేవ్ అయింది! ✨"), description: t("Your mood data has been recorded.", "మీ మూడ్ డేటా రికార్డ్ చేయబడింది.") });
    }
  };

  const toggleComplete = (title: string) =>
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });

  const weeklyData = getWeeklyData();
  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t("Morning", "శుభోదయం")
    : hour < 18
    ? t("Afternoon", "శుభ మధ్యాహ్నం")
    : t("Evening", "శుభ సాయంత్రం");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-heading font-bold">
              {t("Good", "శుభ")} {greeting} 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              <Sparkles className="inline h-4 w-4 mr-1" />
              {t("Small steps lead to big changes. Let's check in today.", "చిన్న అడుగులు పెద్ద మార్పులకు దారితీస్తాయి. ఈ రోజు చెక్-ఇన్ చేద్దాం.")}
            </p>
          </div>
          {streak > 0 && (
            <Badge className="bg-wellness-orange/10 text-wellness-orange border-wellness-orange/30 text-sm gap-1 px-3 py-1.5">
              🔥 {streak} {t("day streak", "రోజుల స్ట్రీక్")}
            </Badge>
          )}
        </div>

        <QuickStats todayCheckin={todayCheckin} streak={streak} />

        {/* Dashboard Overview */}
        <DashboardOverview checkins={checkins} streak={streak} todayCheckin={todayCheckin} />

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <MoodCheckIn onSubmit={handleSubmit} />
            {saving && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("Saving check-in...", "చెక్-ఇన్ సేవ్ అవుతోంది...")}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Stress Gauge */}
            <Card className="rounded-2xl glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t("Stress Level", "ఒత్తిడి స్థాయి")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stress !== null ? (
                  <div className="space-y-3">
                    <StressGauge value={stress} />
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">{suggestion(stress, t)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-8 text-center">
                    {t("Complete your check-in to see your stress score.", "మీ ఒత్తిడి స్కోర్ చూడటానికి చెక్-ఇన్ పూర్తి చేయండి.")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Mood-based Activity Recommendations */}
            <Card className="rounded-2xl glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-lg">
                  {t("Recommended Activities", "సిఫార్సు చేసిన కార్యకలాపాలు")}
                  {currentMood && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      ({t(`Based on: ${currentMood}`, `ఆధారంగా: ${currentMood}`)})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activities.map((a) => (
                  <div
                    key={a.title}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                      completed.has(a.title) ? "bg-wellness-green/5 border-wellness-green/30" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <a.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={completed.has(a.title) ? "secondary" : "outline"}
                      onClick={() => toggleComplete(a.title)}
                      className="shrink-0 h-8 text-xs gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {completed.has(a.title) ? t("Done", "పూర్తి") : t("Do", "చేయి")}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Progress */}
        <div>
          <h2 className="text-lg font-heading font-bold mb-3">{t("Weekly Progress", "వారపు పురోగతి")}</h2>
          <WeeklyCharts data={weeklyData} />
        </div>

        {/* Check-in History */}
        <MoodHistory checkins={checkins} />
      </div>
    </div>
  );
};

export default Dashboard;
