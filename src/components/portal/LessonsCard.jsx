import { useEffect, useState } from "react";
import { Video, Link as LinkIcon, ExternalLink, Loader2, PlayCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

function youtubeEmbed(url) {
  const m = (url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

// Card do Portal do Aluno: vídeo-aulas e links publicados pelos professores
// para a turma do aluno (ou para "Todas as turmas").
export default function LessonsCard({ turma }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await base44.entities.Lesson.filter({ is_active: true }, "-date", 100);
        const rel = all.filter((l) => !l.turma || l.turma === "Todas" || l.turma === turma);
        if (active) setLessons(rel);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [turma]);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Video className="h-5 w-5" /></span>
        <div>
          <h3 className="heading-font text-base font-bold">Vídeo-aulas e materiais</h3>
          <p className="text-xs text-muted-foreground">Conteúdo publicado pelos seus professores</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : lessons.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma aula publicada para sua turma ainda.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {lessons.map((l) => {
            const embed = l.type === "Vídeo" ? youtubeEmbed(l.url) : null;
            const isOpen = openId === l.id;
            return (
              <div key={l.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${l.type === "Vídeo" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                    {l.type === "Vídeo" ? <Video className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{l.title}</p>
                    <p className="text-[11px] text-muted-foreground">{l.author}{l.discipline ? ` · ${l.discipline}` : ""}{l.date ? ` · ${new Date(l.date + "T00:00:00").toLocaleDateString("pt-BR")}` : ""}</p>
                    {l.description && <p className="mt-1 text-xs text-muted-foreground">{l.description}</p>}
                  </div>
                </div>
                {embed ? (
                  <div className="mt-3">
                    {isOpen ? (
                      <div className="aspect-video overflow-hidden rounded-xl bg-black">
                        <iframe src={embed} title={l.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    ) : (
                      <button onClick={() => setOpenId(l.id)} className="group flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:border-primary/40 hover:text-primary">
                        <PlayCircle className="h-6 w-6 text-primary" /> Assistir vídeo-aula
                      </button>
                    )}
                  </div>
                ) : (
                  <a href={l.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:border-primary/40 hover:text-primary">
                    <ExternalLink className="h-4 w-4" /> Abrir link
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}