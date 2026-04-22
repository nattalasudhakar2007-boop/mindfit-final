import { ClipboardEdit, Calculator, Sparkles, TrendingUp } from "lucide-react";

const steps = [
  { icon: ClipboardEdit, title: "Log Your Mood Daily", desc: "Take 2 minutes to check in with yourself — select your mood, energy, sleep, and focus." },
  { icon: Calculator, title: "System Calculates Stress", desc: "Our algorithm analyzes your inputs to generate a personalized stress score." },
  { icon: Sparkles, title: "Get Recommendations", desc: "Receive curated activities like breathing exercises, journaling prompts, and focus music." },
  { icon: TrendingUp, title: "Track & Improve", desc: "Watch your progress over time and build lasting mental fitness habits." },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            How <span className="text-gradient">MindFit</span> Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Four simple steps to better mental wellness.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="text-center space-y-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="relative mx-auto">
                <div className="h-16 w-16 rounded-full gradient-wellness flex items-center justify-center text-primary-foreground mx-auto">
                  <s.icon className="h-7 w-7" />
                </div>
                <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center font-heading">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-lg">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
