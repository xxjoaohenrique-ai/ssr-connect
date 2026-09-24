import { useEffect, useState } from "react";
import { Newspaper, CalendarDays, Users, Megaphone, Images, UtensilsCrossed, ShieldCheck, ArrowRight, BookOpen } from "lucide-react";
import { adminList } from "@/lib/adminApi";
import AdminStatsGrid from "./AdminStatsGrid";
import AdminQuickActions from "./AdminQuickActions";

const stats = [
  { key: "news", icon: Newspaper, label: "Notícias", tone: "text-primary bg-primary/10" },
  { key: "events", icon: CalendarDays, label: "Eventos", tone: "text-secondary bg-secondary/10" },
  { key: "students", icon: Users, label: "Alunos", tone: "text-amber-600 bg-amber-500/10" },
  { key: "notices", icon: Megaphone, label: "Avisos ativos", tone: "text-primary bg-primary/10" },
];

const actions = [
  { key: "news", icon: Newspaper, label: "Nova notícia", description: "Publique um conteúdo no portal", tone: "text-primary bg-primary/10" },
  { key: "notices", icon: Megaphone, label: "Criar aviso", description: "Envie um comunicado escolar", tone: "text-secondary bg-secondary/10" },
  { key: "events", icon: CalendarDays, label: "Adicionar evento", description: "Atualize o calendário escolar", tone: "text-amber-600 bg-amber-500/10" },
];

const areas = [
  { key: "history", icon: BookOpen, title: "História da escola", detail: "Texto da página Sobre a Escola" },
  { key: "management_team", icon: Users, title: "Equipe gestora", detail: "Nomes e cargos da página Sobre a Escola" },
  { key: "students", icon: Users, title: "Alunos e turmas", detail: "Cadastros e acessos dos estudantes" },
  { key: "gallery", icon: Images, title: "Galeria da escola", detail: "Fotos publicadas no site" },
  { key: "menu", icon: UtensilsCrossed, title: "Cardápio escolar", detail: "Almoço e lanche da semana" },
  { key: "access", icon: ShieldCheck, title: "Contas administrativas", detail: "Gerenciar os acessos da equipe" },
];

export default function AdminOverview({ onNavigate }) {
  const [counts, setCounts] = useState({ news: 0, events: 0, students: 0, notices: 0 });

  useEffect(() => {
    Promise.all([
      adminList("News").then((items) => items.length), adminList("CalendarEvent").then((items) => items.length),
      adminList("Student").then((items) => items.length), adminList("Notice", { filter: { is_active: true } }).then((items) => items.length),
    ]).then(([news, events, students, notices]) => setCounts({ news, events, students, notices })).catch(() => {});
  }, []);

  return (
    <div className="ssr-admin-overview space-y-6">
      <div className="ssr-admin-welcome">
        <div><h1 className="heading-font text-3xl font-extrabold tracking-tight sm:text-4xl">Olá, equipe!</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">Acompanhe as informações da escola e organize suas publicações.</p></div>
        <div className="ssr-admin-date"><CalendarDays className="h-5 w-5 shrink-0 text-primary" /><span><strong>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date())}</strong><small>Painel administrativo da escola</small></span></div>
      </div>
      <AdminStatsGrid stats={stats} counts={counts} onNavigate={onNavigate} />
      <section className="ssr-admin-panel">
        <h2 className="heading-font text-xl font-bold">Ações rápidas</h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">Publique um conteúdo ou envie um comunicado para a comunidade escolar.</p>
        <AdminQuickActions actions={actions} onNavigate={onNavigate} />
      </section>
      <section className="ssr-admin-panel">
        <h2 className="heading-font text-xl font-bold">Gerenciar a escola</h2>
        <p className="mt-1 text-sm text-muted-foreground">Acesse e atualize as principais áreas do portal.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {areas.map((area) => (
            <button key={area.key} type="button" onClick={() => onNavigate(area.key)} className="ssr-admin-area-card group flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><area.icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{area.title}</span><span className="block text-xs text-muted-foreground">{area.detail}</span></span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
