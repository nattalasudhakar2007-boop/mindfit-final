import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface EnergyQuestion {
  id: string;
  question: string;
  options: { label: string; score: number }[];
}

const energyQuestions: EnergyQuestion[] = [
  {
    id: "physical",
    question: "How does your body feel right now?",
    options: [
      { label: "Full of energy", score: 10 },
      { label: "Good & active", score: 8 },
      { label: "Decent", score: 6 },
      { label: "Sluggish", score: 4 },
      { label: "Completely drained", score: 2 },
    ],
  },
  {
    id: "mental",
    question: "How sharp is your mental focus?",
    options: [
      { label: "Laser focused", score: 10 },
      { label: "Clear-headed", score: 8 },
      { label: "Slightly foggy", score: 6 },
      { label: "Hard to concentrate", score: 4 },
      { label: "Can't think straight", score: 2 },
    ],
  },
  {
    id: "motivation",
    question: "How motivated do you feel to do tasks today?",
    options: [
      { label: "Very motivated", score: 10 },
      { label: "Fairly motivated", score: 8 },
      { label: "Neutral", score: 6 },
      { label: "Low motivation", score: 4 },
      { label: "Zero motivation", score: 2 },
    ],
  },
  {
    id: "social",
    question: "Do you feel like talking to or being around people?",
    options: [
      { label: "Absolutely!", score: 10 },
      { label: "Yes, mostly", score: 8 },
      { label: "Indifferent", score: 6 },
      { label: "Prefer to be alone", score: 4 },
      { label: "Want total isolation", score: 2 },
    ],
  },
  {
    id: "appetite",
    question: "How is your appetite today?",
    options: [
      { label: "Healthy & normal", score: 10 },
      { label: "Slightly off", score: 7 },
      { label: "Not hungry at all", score: 4 },
      { label: "Stress eating", score: 4 },
      { label: "Skipping meals", score: 2 },
    ],
  },
];

interface Props {
  onComplete: (score: number) => void;
}

export function EnergyScoreQuiz({ onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === energyQuestions.length;

  const handleAnswer = (questionId: string, score: number) => {
    const updated = { ...answers, [questionId]: score };
    setAnswers(updated);

    if (Object.keys(updated).length === energyQuestions.length) {
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      const avg = Math.round(total / energyQuestions.length);
      onComplete(avg);
    }
  };

  const calculatedScore = allAnswered
    ? Math.round(Object.values(answers).reduce((a, b) => a + b, 0) / energyQuestions.length)
    : null;

  const getLabel = (s: number) => {
    if (s >= 8) return "High Energy";
    if (s >= 6) return "Moderate";
    if (s >= 4) return "Low";
    return "Very Low";
  };

  return (
    <Card className="rounded-2xl border-dashed border-wellness-green/30 bg-wellness-green/5">
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-wellness-green" />
          <h4 className="text-sm font-heading font-semibold">Energy Level Assessment</h4>
          <Badge variant="outline" className="text-[10px]">
            {answeredCount}/{energyQuestions.length}
          </Badge>
        </div>

        <div className="space-y-4">
          {energyQuestions.map((q, qi) => (
            <div key={q.id} className="space-y-2 animate-fade-in-up" style={{ animationDelay: `${qi * 80}ms` }}>
              <p className="text-xs font-medium text-foreground">{q.question}</p>
              <div className="flex flex-wrap gap-1.5">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(q.id, opt.score)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                      answers[q.id] === opt.score
                        ? "bg-wellness-green text-primary-foreground border-wellness-green shadow-sm"
                        : "border-border hover:border-wellness-green/50 hover:bg-wellness-green/10"
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
            <span className="text-xs text-muted-foreground">Your energy level:</span>
            <Badge className="bg-wellness-green/20 text-wellness-green border-wellness-green/30">
              {calculatedScore}/10 — {getLabel(calculatedScore)}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
