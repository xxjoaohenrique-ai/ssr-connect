import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, ChevronRight, Megaphone, AlertTriangle, User, Loader2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import { base44 } from "@/api/base44Client";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] } }),
};

export default function News() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("Todas");
  const [selected, setSelected] = useState(null);
  const [allNews, setAllNews] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [n, no] = await Promise.all([
          base44.entities.News.filter({ is_published: true }, "-date"),
          base44.entities.Notice.filter({ is_active: true }, "-date"),
        ]);
        setAllNews(n);
        setNotices(no);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const tags = ["Todas", ...new Set(allNews.map((n) => n.category))];
  const filtered = allNews.filter((n) => {
    const matchesQuery = (n.title || "").toLowerCase().includes(query.toLowerCase()) || (n.excerpt || "").toLowerCase().includes(query.toLowerCase());
    const matchesTag = tag === "Todas" || n.category === tag;
    return matchesQuery && matchesTag;
  });

  return (
    <div>
      <PageHero eyebrow="Notícias e Avisos" title="Fique por dentro de tudo" description="Comunicados oficiais, notícias e avisos importantes para a comunidade escolar." />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Lista de notícias */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar notícia..." className="w-full rounded-full border border-border bg-card py-3 pl-12 pr-4 text-sm outline-none ring-primary transition focus:ring-2" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <button key={t} onClick={() => setTag(t)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${tag === t ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-primary"}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {loading ? (
                <div className="flex justify-center py-12 sm:py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <>
                  {filtered.map((n, i) => (
                    <motion.article key={n.id} custom={i} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }} className="group cursor-pointer rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg" onClick={() => setSelected(n)}>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="rounded-full bg-secondary/10 px-3 py-1 font-semibold uppercase tracking-wide text-secondary">{n.category}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {n.date ? new Date(n.date + "T00:00:00").toLocaleDateString("pt-BR") : ""}</span>
                      </div>
                      <h2 className="heading-font mt-3 text-xl font-semibold leading-snug group-hover:text-primary">{n.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Ler mais <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                    </motion.article>
                  ))}
                  {filtered.length === 0 && <p className="mt-16 text-center text-sm text-muted-foreground">Nenhuma notícia encontrada.</p>}
                </>
              )}
            </div>
          </div>

          {/* Mural de avisos */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="heading-font flex items-center gap-2 text-lg font-bold"><Megaphone className="h-5 w-5 text-primary" /> Mural de Avisos</h3>
              <div className="mt-5 space-y-4">
                {notices.map((n) => {
                  const urgent = n.priority === "urgente";
                  return (
                    <div key={n.id} className={`rounded-2xl border p-4 ${urgent ? "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10" : "border-border bg-background"}`}>
                      <span className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide ${urgent ? "text-amber-600 dark:text-amber-400" : "text-primary"}`}>
                        {urgent ? <AlertTriangle className="h-3.5 w-3.5" /> : <Megaphone className="h-3.5 w-3.5" />} {urgent ? "Urgente" : "Aviso"}
                      </span>
                      <p className="mt-1 text-sm leading-relaxed">{n.content}</p>
                    </div>
                  );
                })}
                {notices.length === 0 && <p className="text-sm text-muted-foreground">Nenhum aviso no momento.</p>}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Modal de leitura */}
      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl scrollbar-thin sm:p-8" onClick={(e) => e.stopPropagation()}>
            <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">{selected.category}</span>
            <h2 className="heading-font mt-4 text-2xl font-bold leading-tight">{selected.title}</h2>
            <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {selected.date ? new Date(selected.date + "T00:00:00").toLocaleDateString("pt-BR") : ""}</span>
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {selected.author || "Equipe CETI"}</span>
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{selected.excerpt}</p>
            {selected.content && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{selected.content}</p>}
            <button onClick={() => setSelected(null)} className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:scale-105">Fechar</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}