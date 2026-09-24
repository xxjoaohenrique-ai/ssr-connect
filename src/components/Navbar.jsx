import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap, ArrowUpRight, ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const mainLinks = [
  { label: "Início", to: "/" },
  { label: "A Escola", to: "/sobre" },
  { label: "Notícias", to: "/noticias" },
  { label: "Agenda", to: "/calendario" },
  { label: "Cursos", to: "/cursos" },
  { label: "Contato", to: "/contato" },
];

const resourceLinks = [
  { label: "Biblioteca Digital", to: "/biblioteca" },
  { label: "Galeria", to: "/galeria" },
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
    `ssr-header-link rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "ssr-header-link-active" : ""
    }`;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 glass-nav ssr-site-header ssr-reference-header ${
        scrolled ? "pb-2 pt-[calc(0.5rem_+_env(safe-area-inset-top))] shadow-soft" : "pb-3 pt-[calc(0.75rem_+_env(safe-area-inset-top))]"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl min-w-0 items-center justify-between gap-2 px-3 min-[380px]:px-4 sm:gap-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" aria-label="SSR-CONNECT — ir para o início" className="ssr-brand group flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <span className="ssr-brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105 sm:h-10 sm:w-10">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="heading-font whitespace-nowrap text-[14px] font-extrabold tracking-tight min-[380px]:text-base sm:text-lg">SSR<span className="text-primary">-CONNECT</span></span>
            <span className="ssr-brand-subtitle hidden text-[10px] font-semibold tracking-wide text-muted-foreground sm:block">CETI Sebastião Soares Ribeiro</span>
          </span>
        </Link>

        {/* Links desktop */}
        <div className="ssr-desktop-links hidden items-center xl:flex">
          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Ações */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle className="ssr-header-theme" />
          <Link to="/admin-login" className="ssr-header-admin hidden items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium xl:inline-flex">
            <ShieldCheck className="h-4 w-4" /> Administração
          </Link>
          <Link
            to="/portal-aluno"
            className="ssr-header-enroll hidden min-h-10 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 xl:inline-flex"
          >
            Portal escolar <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="ssr-menu-mobile"
            className="ssr-mobile-trigger inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-primary/10 xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div id="ssr-menu-mobile" className="xl:hidden">
          <div className="ssr-mobile-menu mx-3 mt-2 max-h-[min(74dvh,calc(100dvh-6rem))] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-3 shadow-float min-[380px]:mx-4 sm:mx-auto sm:max-w-xl">
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
                Mais recursos
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
                className="flex items-center justify-center gap-2 rounded-xl border border-border/70 px-4 py-3 text-center text-sm font-semibold text-foreground/80 hover:bg-muted"
              >
                <ShieldCheck className="h-4 w-4" /> Acesso da administração
              </NavLink>
              <NavLink
                to="/portal-aluno"
                className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Acessar portal escolar
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
