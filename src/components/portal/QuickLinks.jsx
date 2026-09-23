import { Link } from "react-router-dom";
import { ClipboardList, FolderOpen, Megaphone, UtensilsCrossed, ArrowRight, ArrowUpRight } from "lucide-react";

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

// Acesso rápido do aluno: notas (SEDUC), documentos/materiais, avisos da turma e cardápio.
export default function QuickLinks() {
  const items = [
    { key: "notas", icon: ClipboardList, title: "Notas e Boletim", desc: "Portal SEDUC-PI", tone: "bg-primary text-primary-foreground", href: "https://estudante.seduc.pi.gov.br/login", external: true },
    { key: "docs", icon: FolderOpen, title: "Documentos e Materiais", desc: "Biblioteca digital e apostilas", tone: "bg-secondary text-secondary-foreground", target: "materiais" },
    { key: "avisos", icon: Megaphone, title: "Avisos da turma", desc: "Comunicados oficiais", tone: "bg-amber-500 text-white", target: "avisos" },
    { key: "cardapio", icon: UtensilsCrossed, title: "Cardápio semanal", desc: "Refeições da semana", tone: "bg-primary text-primary-foreground", target: "cardapio" },
  ];

  return (
    <div>
      <h3 className="heading-font mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Acesso rápido</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((t) => {
          const inner = (
            <>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.tone}`}><t.icon className="h-6 w-6" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-tight">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              {t.external ? <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </>
          );
          const cls = "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:scale-[1.02] hover:border-primary/40";
          if (t.href) return <a key={t.key} href={t.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>;
          if (t.to) return <Link key={t.key} to={t.to} className={cls}>{inner}</Link>;
          return <button key={t.key} type="button" onClick={() => scrollTo(t.target)} className={cls}>{inner}</button>;
        })}
      </div>
    </div>
  );
}