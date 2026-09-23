import { Link } from "react-router-dom";
import { FolderOpen, ClipboardList, Video, BookOpen, FileText, ArrowRight, ArrowUpRight } from "lucide-react";

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

// Documentos e materiais de estudo organizados em cards claros e agrupados,
// para o aluno encontrar e acessar tudo com facilidade.
export default function MaterialsCard() {
  const docs = [
    { icon: FolderOpen, title: "Biblioteca Digital", desc: "Livros, apostilas e arquivos", to: "/biblioteca" },
    { icon: ClipboardList, title: "Notas e Boletim", desc: "Portal SEDUC-PI", href: "https://estudante.seduc.pi.gov.br/login" },
  ];
  const materials = [
    { icon: Video, title: "Vídeo-aulas", desc: "Aulas publicadas pelos professores", target: "videoaulas" },
    { icon: BookOpen, title: "Materiais por disciplina", desc: "Conteúdo organizado por matéria", to: "/biblioteca" },
    { icon: FileText, title: "Apostilas e PDFs", desc: "Materiais de apoio para estudo", to: "/biblioteca" },
  ];

  const renderCard = (t) => {
    const inner = (
      <>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105"><t.icon className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">{t.title}</p>
          <p className="text-xs text-muted-foreground">{t.desc}</p>
        </div>
        {t.href ? <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </>
    );
    const cls = "group flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition hover:scale-[1.02] hover:border-primary/40 hover:shadow-sm";
    if (t.href) return <a key={t.title} href={t.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>;
    if (t.to) return <Link key={t.title} to={t.to} className={cls}>{inner}</Link>;
    return <button key={t.title} type="button" onClick={() => scrollTo(t.target)} className={cls}>{inner}</button>;
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><FolderOpen className="h-5 w-5" /></span>
        <div>
          <h3 className="heading-font text-base font-bold">Documentos e materiais de estudo</h3>
          <p className="text-xs text-muted-foreground">Tudo organizado em um só lugar</p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Documentos</p>
          <div className="grid gap-3 sm:grid-cols-2">{docs.map(renderCard)}</div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Materiais de estudo</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{materials.map(renderCard)}</div>
        </div>
      </div>
    </div>
  );
}