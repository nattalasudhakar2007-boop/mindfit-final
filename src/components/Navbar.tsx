import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <Brain className="h-7 w-7" />
          MindFit
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {isDashboard ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Dashboard</Link>
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </Link>
            </>
          ) : (
            <>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3 animate-fade-in-up">
          {isDashboard ? (
            <Link to="/" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground">
              Logout
            </Link>
          ) : (
            <>
              <a href="#about" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground">About</a>
              <a href="#features" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground">Features</a>
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground">How It Works</a>
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}><Button size="sm">Get Started</Button></Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
