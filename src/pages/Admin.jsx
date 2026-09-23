import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, Megaphone, CalendarDays, MessageSquare, ShieldCheck, Users, UtensilsCrossed, Phone, LayoutDashboard, Radio, Images, LogOut } from "lucide-react";
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
import { clearAdmin } from "@/lib/adminAuth";

const SECTIONS = [
  { key: "overview", label: "Início", group: "Início", icon: LayoutDashboard, desc: "Visão geral do portal", Component: AdminOverview },
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
    <div>
      {/* Cabeçalho do painel */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 prism-gradient" />
        <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Painel Administrativo
            </span>
            <h1 className="heading-font mt-5 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Gestão de conteúdo
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
              Edite notícias, avisos, eventos e cardápio — tudo se atualiza no site na hora, sem precisar de código.
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground/80 transition hover:border-destructive/40 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {/* Navegação mobile: barra horizontal rolável e fixa */}
            <AdminSectionNav sections={SECTIONS} active={active} onSelect={setActive} />

            {/* Navegação desktop: sidebar vertical */}
            <div className="hidden rounded-3xl border border-border bg-card p-3 shadow-soft lg:block">
              {NAV_GROUPS.map((group) => (
                <div key={group} className="mb-4 last:mb-1">
                  <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                  {SECTIONS.filter((section) => section.group === group).map((s) => {
                    const isActive = active === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setActive(s.key)}
                        className={`group mb-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-soft"
                            : "hover:translate-x-0.5 hover:bg-muted"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                            isActive ? "bg-white/20" : "bg-primary/10 text-primary group-hover:bg-primary/15"
                          }`}
                        >
                          <s.icon className="h-5 w-5" />
                        </span>
                        <span>
                          <p className="text-sm font-semibold">{s.label}</p>
                          <p className={`text-xs ${isActive ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{s.desc}</p>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
              <div className="mt-2 flex items-start gap-2 rounded-2xl border border-border bg-background p-4 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                Área protegida — apenas contas de administrador (e-mail e senha) acessam este painel.
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div key={active} className="animate-fade-in-up">
              <Current onNavigate={setActive} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}