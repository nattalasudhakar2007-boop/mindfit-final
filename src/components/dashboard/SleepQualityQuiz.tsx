import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon } from "lucide-react";

interface SleepQuestion {
  id: string;
  question: string;
  options: { label: string; score: number }[];
}

const sleepQuestions: SleepQuestion[] = [
  {
    id: "fall_asleep",
    question: "How quickly did you fall asleep last night?",
    options: [
      { label: "Within 10 min", score: 5 },
      { label: "10-20 min", score: 4 },
      { label: "20-40 min", score: 3 },
      { label: "40-60 min", score: 2 },
      { label: "Over 1 hour", score: 1 },
    ],
  },
  {
    id: "wake_ups",
    question: "How many times did you wake up during the night?",
    options: [
      { label: "None", score: 5 },
      { label: "Once", score: 4 },
      { label: "2-3 times", score: 3 },
      { label: "4+ times", score: 2 },
      { label: "Barely slept", score: 1 },
    ],
  },
  {
    id: "morning_feel",
    question: "How did you feel when you woke up?",
    options: [
      { label: "Refreshed & ready", score: 5 },
      { label: "Okay, a bit groggy", score: 4 },
      { label: "Tired but functional", score: 3 },
      { label: "Very tired", score: 2 },
      { label: "Exhausted", score: 1 },
    ],
  },
  {
    id: "dream_quality",
    question: "How would you describe your sleep overall?",
    options: [
      { label: "Deep & peaceful", score: 5 },
      { label: "Mostly good", score: 4 },
      { label: "Light/restless", score: 3 },
      { label: "Poor & disturbed", score: 2 },
      { label: "Terrible", score: 1 },
    ],
  },
];

interface Props {
  onComplete: (score: number) => void;
}

export function SleepQualityQuiz({ onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === sleepQuestions.length;

  const handleAnswer = (questionId: string, score: number) => {
    const updated = { ...answers, [questionId]: score };
    setAnswers(updated);

    if (Object.keys(updated).length === sleepQuestions.length) {
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      const avg = Math.round(total / sleepQuestions.length);
      onComplete(avg);
    }
  };

  const calculatedScore = allAnswered
    ? Math.round(Object.values(answers).reduce((a, b) => a + b, 0) / sleepQuestions.length)
    : null;

  return (
    <Card className="rounded-2xl border-dashed border-accent/30 bg-accent/5">
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-accent" />
          <h4 className="text-sm font-heading font-semibold">Sleep Quality Assessment</h4>
          <Badge variant="outline" className="text-[10px]">
            {answeredCount}/{sleepQuestions.length}
          </Badge>
        </div>

        <div className="space-y-4">
          {sleepQuestions.map((q, qi) => (
            <div key={q.id} className="space-y-2 animate-fade-in-up" style={{ animationDelay: `${qi * 80}ms` }}>
              <p className="text-xs font-medium text-foreground">{q.question}</p>
              <div className="flex flex-wrap gap-1.5">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(q.id, opt.score)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                      answers[q.id] === opt.score
                        ? "bg-accent text-accent-foreground border-accent shadow-sm"
                        : "border-border hover:border-accent/50 hover:bg-accent/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {calculatedScore !== null && (
          <div className="flex items-center justify-center gap-2 pt-1 animate-fade-in-up">
            <span className="text-xs text-muted-foreground">Your sleep quality:</span>
            <Badge className="bg-accent/20 text-accent border-accent/30">
              {calculatedScore}/5 — {calculatedScore >= 4 ? "Great" : calculatedScore >= 3 ? "Fair" : "Poor"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
