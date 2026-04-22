import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { Footer } from "@/components/landing/Footer";
import { BookOpen, Users, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* About Section */}
      <section id="about" className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              What is <span className="text-gradient">MindFit</span>?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              MindFit helps students monitor mood, stress, sleep, and focus through daily check-ins 
              and personalized activity suggestions. It's a supportive companion — not a clinical tool — 
              designed to help you build better mental fitness habits.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 pt-8">
              {[
                { icon: BookOpen, label: "Track Daily", desc: "Quick mood & energy check-ins" },
                { icon: Users, label: "Student-First", desc: "Built for academic life" },
                { icon: Shield, label: "Private & Safe", desc: "Your data stays yours" },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Index;
