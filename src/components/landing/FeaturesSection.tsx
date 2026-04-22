import {
  SmilePlus,
  Activity,
  Lightbulb,
  Target,
  Moon,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  { icon: SmilePlus, title: "Daily Mood Check-In", desc: "Log your mood, energy, and focus levels every day with a simple, supportive interface." },
  { icon: Activity, title: "Stress Score Detection", desc: "Get an instant stress score based on your daily inputs and behavior patterns." },
  { icon: Lightbulb, title: "Personalized Suggestions", desc: "Receive tailored activity recommendations — breathing, journaling, music, and more." },
  { icon: Target, title: "Productivity & Focus Tracking", desc: "Monitor your focus trends and discover what helps you concentrate best." },
  { icon: Moon, title: "Sleep Monitoring", desc: "Track sleep hours and quality to understand how rest impacts your wellness." },
  { icon: BarChart3, title: "Wellness Dashboard", desc: "Visualize your progress with beautiful charts and celebrate your growth." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            Everything You Need for <span className="text-gradient">Mental Fitness</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Tools designed specifically for students to manage stress, improve focus, and build healthy habits.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className="group glass-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up rounded-2xl"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardHeader className="space-y-4">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <CardTitle className="font-heading text-lg">{f.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
