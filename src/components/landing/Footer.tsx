import { Brain, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
              <Brain className="h-5 w-5" /> MindFit
            </div>
            <p className="text-sm text-muted-foreground">
              A non-clinical AI-based student wellness platform. Not a substitute for professional medical advice.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-semibold">Quick Links</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="#about" className="block hover:text-foreground transition-colors">About</a>
              <a href="#features" className="block hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="block hover:text-foreground transition-colors">How It Works</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-semibold">Tech Stack</h4>
            <p className="text-sm text-muted-foreground">
              Frontend: React, TypeScript, Tailwind CSS<br />
              Charts: Recharts<br />
              Future: ML, NLP, Cloud deployment
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-destructive" /> for students everywhere
          </p>
          <p className="mt-1">© {new Date().getFullYear()} MindFit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
