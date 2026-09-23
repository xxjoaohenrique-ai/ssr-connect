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
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha ao navegar ou pressionar Escape, mas não durante a rolagem do menu.
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

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
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" aria-label="SSR-CONNECT — ir para o início" className="group flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="heading-font text-base font-extrabold tracking-tight sm:text-lg">SSR<span className="text-primary">-CONNECT</span></span>
            <span className="hidden text-[10px] font-semibold tracking-wide text-muted-foreground sm:block">CETI Sebastião Soares Ribeiro</span>
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden items-center gap-5 xl:gap-7 lg:flex">
          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex min-h-10 items-center gap-1 text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-primary">
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
            className="hidden min-h-10 items-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary xl:inline-flex"
          >
            Entrar
          </Link>
          <Link
            to="/contato"
            className="hidden min-h-10 items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 xl:inline-flex"
          >
            Fale com a escola
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="ssr-menu-mobile"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-primary/10 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div id="ssr-menu-mobile" className="lg:hidden">
          <div className="mx-4 mt-2 max-h-[70dvh] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-3 shadow-float sm:mx-6">
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