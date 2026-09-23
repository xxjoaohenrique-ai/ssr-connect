import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, GraduationCap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";

const mainLinks = [
  { label: "Início", to: "/" },
  { label: "Sobre", to: "/sobre" },
  { label: "Cursos", to: "/cursos" },
  { label: "Admin", to: "/admin" },
];

const resourceLinks = [
  { label: "Biblioteca Digital", to: "/biblioteca" },
  { label: "Notícias", to: "/noticias" },
  { label: "Galeria", to: "/galeria" },
  { label: "Calendário Escolar", to: "/calendario" },
  { label: "Portal do Aluno", to: "/portal-aluno" },
];

// Cabeçalho inteligente com glassmorphism e navegação responsiva
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu mobile ao navegar
  useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }) =>
    `relative text-sm font-medium tracking-wide transition-colors hover:text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
      isActive ? "text-primary after:w-full" : "text-foreground/70 after:w-0"
    }`;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 glass-nav ${
        scrolled ? "pb-2 pt-[calc(0.5rem_+_env(safe-area-inset-top))] shadow-soft" : "pb-3 pt-[calc(0.75rem_+_env(safe-area-inset-top))]"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="heading-font text-xl font-extrabold tracking-tight">
            CETI<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden items-center gap-7 lg:flex">
          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-primary">
                Recursos <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {resourceLinks.map((l) => (
                <DropdownMenuItem key={l.to} asChild>
                  <Link to={l.to} className="cursor-pointer">
                    {l.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink to="/contato" className={linkClass}>
            Contato
          </NavLink>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/admin-login"
            className="hidden rounded-full border border-border/70 px-4 py-2.5 text-sm font-semibold text-foreground/80 transition hover:text-primary lg:inline-flex"
          >
            Entrar
          </Link>
          <Link
            to="/contato"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90 sm:inline-flex"
          >
            Matrículas
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground transition hover:bg-primary/10 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="lg:hidden">
          <div className="mx-4 mt-2 max-h-[calc(100dvh_-_7rem_-_env(safe-area-inset-top))] overflow-y-auto rounded-2xl border border-border/60 bg-card/95 p-4 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              {mainLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Recursos
              </div>
              {resourceLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="my-1 border-t border-border/60" />
              <NavLink
                to="/admin-login"
                className="rounded-xl border border-border/70 px-4 py-3 text-center text-sm font-semibold text-foreground/80"
              >
                Entrar
              </NavLink>
              <NavLink
                to="/contato"
                className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Fale Conosco
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}