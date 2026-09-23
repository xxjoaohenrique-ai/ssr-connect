import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Send, Loader2, Check } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { base44 } from "@/api/base44Client";

const ROLES = ["Aluno", "Pai/Mãe", "Ex-Aluno", "Professor"];

export default function TestimonialSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", role: "Aluno", content: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const load = async () => {
    try {
      const data = await base44.entities.Testimonial.filter({ is_approved: true }, "-created_date");
      setItems(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.Testimonial.create({ ...form, rating: Number(form.rating), is_approved: false });
      setForm({ name: "", role: "Aluno", content: "", rating: 5 });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  return (
    <section className="border-y border-border bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Comunidade"
          title="O que dizem sobre o CETI"
          description="Alunos, pais e ex-alunos compartilham suas experiências no colégio."
        />

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t, i) => (
              <motion.figure
                key={t.id}
                custom={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm"
              >
                <Quote className="h-8 w-8 text-primary/30" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{t.content}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                    {(t.name || "?").charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating || 5 }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </figcaption>
              </motion.figure>
            ))}
            {items.length === 0 && !loading && (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">Seja o primeiro a compartilhar sua experiência!</p>
            )}
          </div>
        )}

        <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-border bg-card p-8">
          <h3 className="heading-font text-xl font-bold">Compartilhe sua experiência</h3>
          <p className="mt-1 text-sm text-muted-foreground">Seu depoimento será publicado após aprovação da coordenação.</p>

          {sent ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/10 p-5 text-sm text-secondary">
              <Check className="h-5 w-5" /> Obrigado! Seu depoimento foi enviado e será revisado em breve.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input required value={form.name} onChange={set("name")} placeholder="Seu nome" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2" />
                <select value={form.role} onChange={set("role")} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <textarea required rows={3} value={form.content} onChange={set("content")} placeholder="Conte sua experiência no CETI..." className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-3 text-sm">
                  Avaliação:
                  <span className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => setForm((f) => ({ ...f, rating: n }))} aria-label={`${n} estrelas`}>
                        <Star className={`h-5 w-5 ${n <= form.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                      </button>
                    ))}
                  </span>
                </label>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-105 disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}