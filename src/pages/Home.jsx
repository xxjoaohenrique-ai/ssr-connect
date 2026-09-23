import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, BookOpen, CalendarDays, School, BarChart3, Newspaper, Image as ImageIcon, Users, GraduationCap, Megaphone, Code2, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import TestimonialSection from "@/components/TestimonialSection";
import TickerBanner from "@/components/TickerBanner";
import HomeShowcase from "@/components/HomeShowcase";
import "@/styles/home-reference.css";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";

const STUDENTS_IMG = `${import.meta.env.BASE_URL}images/students.svg`;

const hubTiles = [
  { icon: BookOpen, title: "Biblioteca Digital", desc: "Vídeo-aulas e materiais de estudo publicados pelos professores.", to: "/biblioteca", color: "from-blue-500 to-blue-600" },
  { icon: CalendarDays, title: "Calendário Escolar", desc: "Provas, eventos, feriados e reuniões em um só lugar.", to: "/calendario", color: "from-emerald-500 to-emerald-600" },
  { icon: Newspaper, title: "Notícias e Avisos", desc: "Comunicados oficiais e atualizações da escola.", to: "/noticias", color: "from-amber-500 to-orange-500" },
  { icon: ImageIcon, title: "Galeria", desc: "Fotos e vídeos dos eventos e do dia a dia escolar.", to: "/galeria", color: "from-sky-500 to-indigo-500" },
  { icon: GraduationCap, title: "Portal do Aluno", desc: "Acesso a notas, materiais, aulas e avisos da turma.", to: "/portal-aluno", color: "from-violet-500 to-purple-600" },
  { icon: Users, title: "Sobre a Escola", desc: "Conheça a história, missão e estrutura do CETI.", to: "/sobre", color: "from-rose-500 to-pink-600" },
  { icon: Code2, title: "Cursos e Turmas", desc: "Cursos técnicos integrados e formação regular.", to: "/cursos", color: "from-emerald-500 to-teal-600" },
  { icon: Megaphone, title: "Fale Conosco", desc: "Dúvidas, matrículas e contato com a secretaria.", to: "/contato", color: "from-amber-500 to-orange-500" },
];

const courses = [
  { icon: Code2, name: "Desenvolvimento de Sistemas", desc: "Programação, banco de dados e projetos reais — formação técnica para o mercado de tecnologia." },
  { icon: Megaphone, name: "Marketing", desc: "Branding, redes sociais e estratégias de venda — comunicação e mercado para o mundo digital." },
  { icon: BookOpen, name: "Formação Regular", desc: "Formação geral do Ensino Médio, integrada aos conhecimentos de cada área." },
];

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const toParts = (dateStr) => {
  if (!dateStr) return { day: "", month: "" };
  const d = new Date(dateStr + "T00:00:00");
  return { day: String(d.getDate()), month: MONTHS_SHORT[d.getMonth()] };
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const results = await Promise.allSettled([
        base44.entities.News.filter({ is_published: true }, "-date", 3),
        base44.entities.Notice.filter({ is_active: true }, "-date", 4),
        base44.entities.CalendarEvent.filter({ is_active: true }, "date"),
      ]);
      if (!active) return;
      const [newsResult, noticesResult, eventsResult] = results;
      if (newsResult.status === "fulfilled") setNews(newsResult.value);
      if (noticesResult.status === "fulfilled") setNotices(noticesResult.value);
      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value.filter((e) => e.date && new Date(e.date + "T00:00:00") >= today).slice(0, 4));
      }
      setDataError(results.some((result) => result.status === "rejected"));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!q) return;
    if (/biblio|livro|material|apostila/.test(q)) navigate("/biblioteca");
    else if (/curso|turma|ensino|marketing|sistema/.test(q)) navigate("/cursos");
    else if (/calend|prova|evento|agenda/.test(q)) navigate("/calendario");
    else if (/notic|avis|comunic/.test(q)) navigate("/noticias");
    else if (/foto|galer|video/.test(q)) navigate("/galeria");
    else if (/professor|docente/.test(q)) navigate("/professores");
    else if (/portal|aluno|pai|responsavel/.test(q)) navigate("/portal-aluno");
    else if (/contato|secretaria|matricula/.test(q)) navigate("/contato");
    else navigate("/sobre");
  };

  return (
    <div className="ssr-reference-home overflow-x-hidden">
      {/* BANNER DE AVISOS (editável pelo admin) */}
      <TickerBanner />

      {/* HERO: referência visual reproduzida como componentes reais, não uma imagem estática. */}
      <section className="ssr-reference-hero" aria-labelledby="ssr-home-heading">
        <div className="ssr-reference-hero-inner">
          <div className="ssr-reference-copy">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="ssr-reference-label">
              <School size={16} aria-hidden="true" /> CETI Sebastião Soares Ribeiro
            </motion.div>
            <motion.h1 id="ssr-home-heading" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} className="heading-font ssr-reference-title">
              <span>Sua escola.</span>
              <span>Suas descobertas.</span>
              <span className="ssr-reference-gradient">Seu próximo passo.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.16 }} className="ssr-reference-lead">
              Aprenda, acompanhe as novidades e participe da vida escolar.
              Tudo o que conecta você ao CETI, em um só lugar.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.22 }} className="ssr-reference-actions">
              <Link to="/portal-aluno" className="ssr-reference-cta ssr-reference-cta--primary"><GraduationCap size={22} aria-hidden="true" /> Acessar minha conta <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link to="/sobre" className="ssr-reference-cta ssr-reference-cta--secondary"><School size={20} aria-hidden="true" /> Conheça o CETI</Link>
            </motion.div>
            <motion.form onSubmit={handleSearch} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} role="search" className="ssr-reference-search">
              <Search size={21} aria-hidden="true" />
              <label htmlFor="ssr-home-search" className="sr-only">Pesquisar informações da escola</label>
              <input id="ssr-home-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="O que você procura?" autoComplete="off" enterKeyHint="search" />
              <button type="submit" disabled={!query.trim()}>Buscar <ArrowRight size={17} aria-hidden="true" /></button>
            </motion.form>
            <nav className="ssr-reference-quick" aria-label="Acessos rápidos">
              <Link to="/noticias"><Megaphone size={16} aria-hidden="true" /> Comunicados</Link>
              <Link to="/portal-aluno"><BarChart3 size={16} aria-hidden="true" /> Resultados</Link>
              <Link to="/calendario"><CalendarDays size={16} aria-hidden="true" /> Calendário</Link>
            </nav>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.18 }} className="min-w-0">
            <HomeShowcase events={events} loading={loading} />
          </motion.div>
        </div>
      </section>

      {/* KNOWLEDGE HUB */}
      <section className="ssr-home-section mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Hub do Conhecimento" title="Tudo o que você precisa, em um só lugar" description="Centralize o acesso às ferramentas e informações essenciais da vida escolar — para alunos, professores, pais e comunidade." />
        <div className="ssr-home-hub-grid mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {hubTiles.map((t, i) => (
            <motion.div key={t.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" whileHover={{ y: -6, scale: 1.02 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Link to={t.to} className="ssr-home-tile group flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-card sm:p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><t.icon className="h-6 w-6" /></span>
                <h3 className="heading-font mt-4 text-base font-semibold leading-snug sm:mt-5 sm:text-lg">{t.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary sm:mt-5">Acessar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* APRESENTAÇÃO */}
      <section className="relative overflow-hidden border-y border-border bg-card/30 py-12 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <Image src={STUDENTS_IMG} alt="Ilustração de estudantes em um ambiente de aprendizagem" fittingType="fill" className="aspect-[4/3] w-full" />
            </div>
          </motion.div>

          <div>
            <SectionHeading align="left"               eyebrow="Sobre o CETI" title="Um espaço para aprender e crescer"               description="O CETI Sebastião Soares Ribeiro reúne ensino regular, formação técnica e atividades para a comunidade escolar." />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Conheça os cursos, acompanhe as novidades e encontre os canais de comunicação da escola em um só lugar.</p>
            <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
              {[{ n: "Ensino", l: "Regular" }, { n: "Cursos", l: "Técnicos" }, { n: "Vida", l: "Escolar" }].map((s) => (
                <div key={s.l} className="min-w-0 rounded-2xl border border-border bg-background px-1.5 py-3 text-center sm:p-4">
                  <p className="heading-font text-base font-bold text-primary sm:text-2xl">{s.n}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
            <Link to="/sobre" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-105">Conheça nossa história <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* CURSOS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Nossos Cursos" title="Técnico e formação regular, lado a lado" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {courses.map((c, i) => (
            <motion.div key={c.name} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="ssr-home-course group flex min-w-0 flex-col rounded-3xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-xl sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-6 w-6" /></span>
              <h3 className="heading-font mt-5 text-xl font-semibold">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              <Link to="/cursos" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">Saiba mais <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NOTÍCIAS + AVISOS */}
      {dataError && <p role="status" className="mx-auto max-w-7xl px-4 pt-5 text-sm text-muted-foreground sm:px-6 lg:px-8">Algumas informações não puderam ser atualizadas agora. Os demais espaços continuam disponíveis.</p>}
      <section className="border-y border-border bg-card/30 py-12 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <div className="flex min-w-0 flex-wrap items-end justify-between gap-2">
              <SectionHeading align="left" eyebrow="Notícias" title="Atualizações recentes" />
              <Link to="/noticias" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">Ver todas</Link>
            </div>
            <div className="mt-8 space-y-5">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : news.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma notícia publicada ainda.</p>
              ) : (
                news.map((n, i) => {
                  const p = toParts(n.date);
                  return (
                    <motion.article key={n.id} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="ssr-home-news group flex min-w-0 gap-3 rounded-2xl border border-border bg-background p-3 transition hover:border-primary/30 hover:shadow-soft sm:gap-4 sm:p-5">
                      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-muted/40 sm:h-24 sm:w-28">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{p.month}</span>
                        <span className="heading-font text-2xl font-bold text-foreground">{p.day}</span>
                      </div>
                      <div>
                        <span className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">{n.category}</span>
                        <h3 className="heading-font mt-2 break-words text-base font-semibold leading-snug group-hover:text-primary sm:text-lg">{n.title}</h3>
                        <p className="mt-1 break-words text-sm text-muted-foreground">{n.excerpt}</p>
                      </div>
                    </motion.article>
                  );
                })
              )}
            </div>
          </div>

          {/* Mural de avisos */}
          <div>
            <SectionHeading align="left" eyebrow="Mural" title="Avisos importantes" />
            <div className="mt-8 space-y-4">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : notices.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Nenhum aviso no momento.</p>
              ) : (
                notices.map((n, i) => {
                  const urgent = n.priority === "urgente";
                  return (
                    <motion.div key={n.id} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className={`flex gap-3 rounded-2xl border p-4 ${urgent ? "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10" : "border-border bg-background"}`}>
                      <span className={`mt-0.5 ${urgent ? "text-amber-500" : "text-primary"}`}>{urgent ? <AlertTriangle className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}</span>
                      <div>
                        <span className={`text-[11px] font-semibold uppercase tracking-wide ${urgent ? "text-amber-600 dark:text-amber-400" : "text-primary"}`}>{urgent ? "Urgente" : "Aviso"}</span>
                        <p className="mt-0.5 text-sm leading-relaxed">{n.content}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <TestimonialSection />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-5 py-10 text-center text-primary-foreground shadow-card sm:px-16 sm:py-16">
          <div className="absolute inset-0 opacity-30 prism-gradient" />
          <div className="relative">
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }} className="heading-font text-3xl font-bold sm:text-4xl text-balance">Quer conhecer melhor o CETI?</motion.h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85 text-balance">Tire suas dúvidas sobre matrículas ou converse com a secretaria.</p>
            <Link to="/contato" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-semibold text-primary shadow-soft transition hover:opacity-90 sm:px-8 sm:py-4">Falar com a secretaria <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}