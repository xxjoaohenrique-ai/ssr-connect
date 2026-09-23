import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Video, Link as LinkIcon, BookOpen, Loader2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import { base44 } from "@/api/base44Client";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Library() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await base44.entities.Lesson.filter({ is_active: true });
        if (active) setLessons(all);
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const q = query.toLowerCase().trim();
  const filtered = lessons.filter((l) =>
    !q ||
    (l.title || "").toLowerCase().includes(q) ||
    (l.discipline || "").toLowerCase().includes(q) ||
    (l.author || "").toLowerCase().includes(q)
  );

  const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : null);

  return (
    <div>
      <PageHero
        eyebrow="Biblioteca Digital"
        title="Materiais de estudo"
        description="Vídeo-aulas, links e materiais publicados pelos professores do CETI Sebastião Soares Ribeiro."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, disciplina ou professor..."
            className="w-full rounded-full border border-border bg-card py-3 pl-12 pr-4 text-sm outline-none ring-primary transition focus:ring-2"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              {lessons.length === 0
                ? "Ainda não há materiais publicados. Os professores publicam vídeo-aulas e links pelo Portal do Professor."
                : "Nenhum material encontrado para sua busca."}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l, i) => {
              const isVideo = l.type === "Vídeo";
              return (
                <motion.article
                  key={l.id}
                  custom={i}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  className="group flex flex-col rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${isVideo ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                      {l.type}
                    </span>
                    {l.discipline && <span className="text-[11px] font-medium text-muted-foreground">{l.discipline}</span>}
                  </div>
                  <h3 className="heading-font mt-2 font-semibold leading-snug group-hover:text-primary">{l.title}</h3>
                  {l.description && <p className="mt-1.5 text-sm text-muted-foreground">{l.description}</p>}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div className="min-w-0 text-[11px] text-muted-foreground">
                      {l.author && <p className="truncate">{l.author}</p>}
                      <p>{l.turma || "Todas as turmas"}{l.date ? ` · ${fmtDate(l.date)}` : ""}</p>
                    </div>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      {isVideo ? <Video className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
                      {isVideo ? "Assistir" : "Abrir"}
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}