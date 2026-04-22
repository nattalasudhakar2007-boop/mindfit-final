import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "en" ? "te" : "en")}
      className="gap-1.5 text-xs font-medium"
    >
      <Languages className="h-4 w-4" />
      {lang === "en" ? "తెలుగు" : "English"}
    </Button>
  );
}
