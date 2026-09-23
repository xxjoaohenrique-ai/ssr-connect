import { NavLink } from "react-router-dom";
import { Home, BookOpen, Newspaper, CalendarDays, UserRound } from "lucide-react";

// Navegação inferior fixa — só aparece em telas pequenas (mobile/webview).
// Usa env(safe-area-inset-bottom) para respeitar a área gestual do iPhone/Android.
const items = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/cursos", label: "Cursos", icon: BookOpen },
  { to: "/noticias", label: "Notícias", icon: Newspaper },
  { to: "/calendario", label: "Agenda", icon: CalendarDays },
  { to: "/portal-aluno", label: "Portal", icon: UserRound },
];

export default function MobileNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border glass-nav lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}