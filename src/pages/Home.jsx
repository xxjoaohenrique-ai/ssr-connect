import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, BookOpen, CalendarDays, Newspaper, Image as ImageIcon, Users, GraduationCap, Megaphone, Code2, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import TestimonialSection from "@/components/TestimonialSection";
import TickerBanner from "@/components/TickerBanner";
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
    <div className="overflow-x-hidden">
      {/* BANNER DE AVISOS (editável pelo admin) */}
      <TickerBanner />

      {/* HERO — editorial, responsivo e sem indicadores fictícios */}
      <section className="ssr-hero ssr-home-hero relative isolate overflow-hidden border-b border-border/70">
        <div className="ssr-hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl min-w-0 items-center gap-8 px-4 py-11 sm:gap-12 sm:px-6 sm:py-16 lg:min-h-[620px] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12 lg:px-8 lg:py-24">
          <div className="min-w-0 max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-primary sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              CETI Sebastião Soares Ribeiro
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} className="heading-font mt-6 max-w-3xl text-[clamp(2.35rem,5.5vw,5.1rem)] font-extrabold leading-[1.08] tracking-[-0.055em] text-balance sm:mt-7">
              A vida escolar,<br />
              <span className="text-primary">mais conectada.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.16 }} className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Notícias, avisos, materiais de estudo e calendário em um espaço feito para estudantes, famílias e professores.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.22 }} className="mt-8 grid gap-3 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
              <Link to="/portal-aluno" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90">
                Acessar o portal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/sobre" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary">
                Conheça o CETI
              </Link>
            </motion.div>
            <motion.form onSubmit={handleSearch} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} role="search" className="mt-8 flex max-w-xl min-w-0 items-center gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-soft focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 sm:mt-9 sm:gap-2">
              <Search aria-hidden="true" className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <label htmlFor="ssr-home-search" className="sr-only">Pesquisar informações da escola</label>
              <input id="ssr-home-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Notícias, cursos, biblioteca..." autoComplete="off" enterKeyHint="search" className="min-w-0 flex-1 bg-transparent py-2 text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-sm" />
              <button type="submit" disabled={!query.trim()} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-foreground px-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4">Buscar</button>
            </motion.form>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.18 }} className="ssr-hero-panel ssr-feature-panel relative min-w-0 rounded-[1.75rem] border border-border bg-card p-5 shadow-card sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">SSR-CONNECT</p>
                <h2 className="heading-font mt-1.5 text-2xl font-bold tracking-tight">O que você precisa?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Acesse os espaços mais usados.</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><GraduationCap className="h-6 w-6" /></span>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { icon: GraduationCap, title: "Portal do aluno", desc: "Sua área de estudos", to: "/portal-aluno" },
                { icon: CalendarDays, title: "Calendário escolar", desc: "Datas e eventos", to: "/calendario" },
                { icon: BookOpen, title: "Biblioteca digital", desc: "Materiais e conteúdos", to: "/biblioteca" },
              ].map((item) => (
                <Link key={item.to} to={item.to} className="ssr-quick-link group flex items-center gap-4 rounded-2xl border border-transparent p-3.5 transition-colors hover:border-border hover:bg-muted/60">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{item.desc}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
            <Link to="/noticias" className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-primary/5 px-4 py-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">
              Acompanhe os comunicados da escola <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
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

      {/* CALENDÁRIO */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-wrap items-end justify-between gap-2">
          <SectionHeading align="left" eyebrow="Agenda" title="Próximos eventos" />
          <Link to="/calendario" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">Calendário completo</Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : events.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-muted-foreground">Nenhum evento próximo.</p>
          ) : (
            events.map((e, i) => {
              const p = toParts(e.date);
              return (
                <motion.div key={e.id} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group flex min-w-0 items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-soft sm:p-5">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <span className="heading-font text-2xl font-bold leading-none">{p.day}</span>
                    <span className="text-[11px] uppercase tracking-wide">{p.month}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-snug">{e.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{e.location || e.type}</p>
                  </div>
                </motion.div>
              );
            })
          )}
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