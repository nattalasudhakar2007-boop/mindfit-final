import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background blobs */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-tight">
              Track Your Mind.{" "}
              <span className="text-gradient">Improve Your Focus.</span>{" "}
              Build Mental Fitness.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
              An AI-powered student wellness platform designed to detect stress early and boost productivity.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="text-base px-8">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-base px-8">Login</Button>
              </Link>
            </div>
          </div>

          <div className="animate-fade-in-up delay-200 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <img
                src={heroImage}
                alt="Students using the MindFit wellness application"
                className="w-full h-auto animate-float"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
