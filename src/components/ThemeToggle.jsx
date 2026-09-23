import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

// Botão de alternância de tema claro/escuro
export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground transition-all hover:bg-primary/10 hover:text-primary hover:scale-105 ${className}`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}