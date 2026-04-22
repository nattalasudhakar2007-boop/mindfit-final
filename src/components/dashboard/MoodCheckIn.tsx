import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceMoodDetector, type VoiceMoodResult } from "./VoiceMoodDetector";
import { SleepQualityQuiz } from "./SleepQualityQuiz";
import { EnergyScoreQuiz } from "./EnergyScoreQuiz";

export interface MoodData {
  mood: string;
  intensity: number;
  reasons: string[];
  focusScore: number;
  energyScore: number;
  sleepHours: number;
  sleepQuality: number;
}

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😰", label: "Stressed" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😠", label: "Angry" },
  { emoji: "🔥", label: "Burnt Out" },
];

const reasonOptions = [
  "Academics", "Exams", "Friends", "Family", "Health", "Sleep", "Relationship", "Financial", "Other",
];

interface Props {
  onSubmit: (data: MoodData) => void;
}

export function MoodCheckIn({ onSubmit }: Props) {
  const [mood, setMood] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [reasons, setReasons] = useState<string[]>([]);
  const [focusScore, setFocusScore] = useState(5);
  const [energyScore, setEnergyScore] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);

  const toggleReason = (r: string) =>
    setReasons((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const handleSubmit = () => {
    if (!mood) return;
    onSubmit({
      mood,
      intensity,
      reasons,
      focusScore,
      energyScore: energyScore ?? 5,
      sleepHours,
      sleepQuality: sleepQuality ?? 3,
    });
  };

  const isComplete = mood && energyScore !== null && sleepQuality !== null;

  return (
    <Card className="rounded-2xl glass-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Daily Mood Check-In</CardTitle>
        <CardDescription>How are you feeling today? Use voice or select manually.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Mood Detection */}
        <VoiceMoodDetector
          onResult={(r: VoiceMoodResult) => {
            setMood(r.suggestedMood);
            setIntensity(Math.round(r.confidence * 10));
          }}
        />

        {/* Mood Selection */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => setMood(m.label)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                mood === m.label
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Intensity */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mood Intensity: {intensity}/10</label>
          <Slider value={[intensity]} onValueChange={(v) => setIntensity(v[0])} min={1} max={10} step={1} />
        </div>

        {/* Reasons */}
        <div className="space-y-2">
          <label className="text-sm font-medium">What's affecting your mood?</label>
          <div className="flex flex-wrap gap-2">
            {reasonOptions.map((r) => (
              <Badge
                key={r}
                variant={reasons.includes(r) ? "default" : "outline"}
                className="cursor-pointer transition-all"
                onClick={() => toggleReason(r)}
              >
                {r}
              </Badge>
            ))}
          </div>
        </div>

        {/* Focus Score (slider) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Focus Score: {focusScore}/10</label>
          <Slider value={[focusScore]} onValueChange={(v) => setFocusScore(v[0])} min={1} max={10} step={1} />
        </div>

        {/* Energy Score Quiz */}
        <EnergyScoreQuiz onComplete={(score) => setEnergyScore(score)} />

        {/* Sleep Hours (slider) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sleep Hours: {sleepHours}h</label>
          <Slider value={[sleepHours]} onValueChange={(v) => setSleepHours(v[0])} min={0} max={12} step={0.5} />
        </div>

        {/* Sleep Quality Quiz */}
        <SleepQualityQuiz onComplete={(score) => setSleepQuality(score)} />

        <Button onClick={handleSubmit} disabled={!isComplete} className="w-full">
          {!isComplete ? "Complete all assessments to submit" : "Submit Check-In"}
        </Button>
      </CardContent>
    </Card>
  );
}
