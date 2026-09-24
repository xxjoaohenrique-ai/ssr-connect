import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Newspaper, Megaphone, CalendarDays, MessageSquare, ShieldCheck, Users, UtensilsCrossed, Phone, LayoutDashboard, Radio, Images, LogOut, BookOpen, GraduationCap, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import "@/styles/admin-dashboard.css";
import AdminOverview from "@/components/admin/AdminOverview";
import NewsManager from "@/components/admin/NewsManager";
import NoticeManager from "@/components/admin/NoticeManager";
import EventManager from "@/components/admin/EventManager";
import TestimonialManager from "@/components/admin/TestimonialManager";
import AdminAccessManager from "@/components/admin/AdminAccessManager";
import StudentManager from "@/components/admin/StudentManager";
import TeacherManager from "@/components/admin/TeacherManager";
import MenuManager from "@/components/admin/MenuManager";
import ContactInfoManager from "@/components/admin/ContactInfoManager";
import TickerManager from "@/components/admin/TickerManager";
import AdminSectionNav from "@/components/admin/AdminSectionNav";
import GalleryManager from "@/components/admin/GalleryManager";
import HistoryManager from "@/components/admin/HistoryManager";
import ManagementTeamManager from "@/components/admin/ManagementTeamManager";
import { clearAdmin } from "@/lib/adminAuth";

const SECTIONS = [
  { key: "overview", label: "Visão geral", group: "Início", icon: LayoutDashboard, desc: "Resumo da escola", Component: AdminOverview },
  { key: "history", label: "História", group: "Conteúdo", icon: BookOpen, desc: "História exibida em Sobre a Escola", Component: HistoryManager },
  { key: "management_team", label: "Equipe Gestora", group: "Conteúdo", icon: Users, desc: "Integrantes exibidos em Sobre a Escola", Component: ManagementTeamManager },
  { key: "news", label: "Notícias", group: "Conteúdo", icon: Newspaper, desc: "Publicar e editar notícias", Component: NewsManager },
  { key: "notices", label: "Avisos", group: "Conteúdo", icon: Megaphone, desc: "Mural de avisos e comunicados", Component: NoticeManager },
  { key: "events", label: "Eventos", group: "Conteúdo", icon: CalendarDays, desc: "Calendário escolar e provas", Component: EventManager },
  { key: "menu", label: "Cardápio", group: "Conteúdo", icon: UtensilsCrossed, desc: "Almoço e lanche da semana", Component: MenuManager },
  { key: "testimonials", label: "Depoimentos", group: "Conteúdo", icon: MessageSquare, desc: "Aprovar depoimentos da comunidade", Component: TestimonialManager },
  { key: "contact", label: "Contato", group: "Conteúdo", icon: Phone, desc: "Textos e dados da página de contato", Component: ContactInfoManager },
  { key: "ticker", label: "Banner Avisos", group: "Conteúdo", icon: Radio, desc: "Frase do topo da página inicial", Component: TickerManager },
  { key: "gallery", label: "Galeria", group: "Conteúdo", icon: Images, desc: "Fotos da escola publicadas no site", Component: GalleryManager },
  { key: "students", label: "Alunos", group: "Pessoas", icon: Users, desc: "Listas por turma e logins/senhas", Component: StudentManager },
  { key: "teachers", label: "Professores", group: "Pessoas", icon: Users, desc: "Aprovar cadastros e definir turmas", Component: TeacherManager },
  { key: "access", label: "Acesso", group: "Configurações", icon: ShieldCheck, desc: "Contas de administrador (e-mail e senha)", Component: AdminAccessManager },
];

const NAV_GROUPS = ["Início", "Conteúdo", "Pessoas", "Configurações"];

export default function Admin() {
  const [active, setActive] = useState("overview");
  const navigate = useNavigate();
  const Current = SECTIONS.find((s) => s.key === active).Component;
  const logout = () => {
    clearAdmin();
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="ssr-admin-shell">
      <header className="ssr-admin-topbar">
        <Link to="/" className="ssr-admin-brand" aria-label="SSR-CONNECT — página inicial">
          <GraduationCap className="h-7 w-7" aria-hidden="true" />
          <span>SSR<span className="ssr-admin-brand-accent">-CONNECT</span></span>
        </Link>
        <span className="ssr-admin-topbar-title">Painel administrativo</span>
        <div className="ssr-admin-topbar-actions">
          <Link to="/" className="ssr-admin-topbar-button"><ExternalLink className="h-4 w-4" /> <span>Ver site</span></Link>
          <ThemeToggle className="ssr-admin-theme" />
          <button type="button" onClick={logout} className="ssr-admin-topbar-button"><LogOut className="h-4 w-4" /> <span>Sair</span></button>
        </div>
      </header>

      <div className="ssr-admin-columns">
          <aside className="ssr-admin-aside">
            {/* Navegação mobile: barra horizontal rolável e fixa */}
            <AdminSectionNav sections={SECTIONS} active={active} onSelect={setActive} />

            {/* Navegação desktop: sidebar vertical */}
            <nav aria-label="Seções do painel administrativo" className="ssr-admin-sidebar hidden lg:block">
              {NAV_GROUPS.map((group) => (
                <div key={group} className="ssr-admin-nav-group">
                  <p className="ssr-admin-nav-heading">{group}</p>
                  {SECTIONS.filter((section) => section.group === group).map((s) => {
                    const isActive = active === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActive(s.key)}
                        className={`ssr-admin-nav-item ${isActive ? "ssr-admin-nav-item-active" : ""}`}
                      >
                        <span className="ssr-admin-nav-icon"><s.icon className="h-5 w-5" /></span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{s.label}</span>
                          <span className="ssr-admin-nav-description">{s.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>

          <div className="ssr-admin-content min-w-0">
            {active !== "overview" && <div className="ssr-admin-section-heading"><span className="text-xs font-semibold uppercase tracking-widest text-primary">Gerenciar conteúdo</span><h1 className="heading-font mt-2 text-3xl font-bold">{SECTIONS.find((s) => s.key === active).label}</h1><p className="mt-1 text-sm text-muted-foreground">{SECTIONS.find((s) => s.key === active).desc}</p></div>}
            <div key={active} className="animate-fade-in-up">
              <Current onNavigate={setActive} />
            </div>
          </div>
      </div>
    </div>
  );
}
