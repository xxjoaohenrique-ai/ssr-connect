import { NavLink } from "react-router-dom";
import { Home, BookOpen, Newspaper, CalendarDays, UserRound } from "lucide-react";

// Navegação inferior fixa — só aparece em telas pequenas (mobile/webview).
// Usa env(safe-area-inset-bottom) para respeitar a área gestual do iPhone/Android.
const items = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/cursos", label: "Cursos", icon: BookOpen },
  { to: "/noticias", label: "Notícias", icon: Newspaper },
  { to: "/calendario", label: "Agenda", icon: CalendarDays },
  { to: "/portal-aluno", label: "Minha conta", icon: UserRound },
];

export default function MobileNav() {
  return (
    <nav
      aria-label="Navegação rápida no celular e tablet"
      className="ssr-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-[0_-8px_30px_-20px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 items-stretch px-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) =>
              `flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[11px] font-semibold transition-colors sm:text-xs ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
