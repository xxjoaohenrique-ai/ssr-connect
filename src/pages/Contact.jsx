import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MessageSquare, Send, CheckCircle2, MapPin, Clock, Loader2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { CONTACT_DEFAULTS } from "@/lib/contactDefaults";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [info, setInfo] = useState(CONTACT_DEFAULTS);

  // Carrega os textos editáveis pelo admin (com fallback para os padrão).
  useEffect(() => {
    base44.entities.ContactInfo
      .list()
      .then((rows) => { if (rows[0]) setInfo({ ...CONTACT_DEFAULTS, ...rows[0] }); })
      .catch(() => {});
  }, []);

  const departments = [
    { icon: MapPin, title: "Endereço", value: info.address },
    { icon: Phone, title: "Telefone", value: info.phone },
    { icon: Mail, title: "E-mail", value: info.email },
    { icon: Clock, title: "Horário", value: info.hours },
  ];

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Informe seu nome.";
    if (!form.email.trim()) e.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido.";
    if (!form.subject.trim()) e.subject = "Informe um assunto.";
    if (!form.message.trim()) e.message = "Escreva sua mensagem.";
    else if (form.message.trim().length < 10) e.message = "A mensagem deve ter ao menos 10 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulação de envio (substitua por integração real quando necessário)
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div>
      <PageHero
        eyebrow="Contato"
        title={info.hero_title}
        description={info.hero_description}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Informações */}
          <div className="lg:col-span-2">
            <h2 className="heading-font text-2xl font-bold">{info.intro_heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {info.intro_paragraph}
            </p>
            <div className="mt-8 space-y-4">
              {departments.map((d, i) => (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{d.title}</p>
                    <p className="mt-0.5 text-sm font-medium">{d.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

          {/* Formulário */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 sm:py-16 text-center"
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                    <CheckCircle2 className="h-10 w-10" />
                  </span>
                  <h3 className="heading-font mt-6 text-2xl font-bold">Mensagem enviada!</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Recebemos sua mensagem e entraremos em contato em breve. Verifique seu e-mail.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-6 rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary"
                  >
                    Enviar outra mensagem
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <h2 className="heading-font text-2xl font-bold">{info.form_heading}</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field icon={User} label="Nome completo" error={errors.name}>
                      <input value={form.name} onChange={handleChange("name")} placeholder="Seu nome" className="w-full bg-transparent text-sm outline-none" />
                    </Field>
                    <Field icon={Mail} label="E-mail" error={errors.email}>
                      <input type="email" value={form.email} onChange={handleChange("email")} placeholder="seu@email.com" className="w-full bg-transparent text-sm outline-none" />
                    </Field>
                    <Field icon={Phone} label="Telefone (opcional)">
                      <input value={form.phone} onChange={handleChange("phone")} placeholder="(11) 90000-0000" className="w-full bg-transparent text-sm outline-none" />
                    </Field>
                    <Field icon={MessageSquare} label="Assunto" error={errors.subject}>
                      <input value={form.subject} onChange={handleChange("subject")} placeholder="Sobre o que é?" className="w-full bg-transparent text-sm outline-none" />
                    </Field>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mensagem</label>
                    <textarea
                      value={form.message}
                      onChange={handleChange("message")}
                      rows={5}
                      placeholder="Escreva sua mensagem aqui..."
                      className={`w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2 ${
                        errors.message ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] disabled:opacity-70 sm:w-auto sm:px-10"
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                    ) : (
                      <>Enviar mensagem <Send className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className={`flex items-center gap-2 rounded-2xl border bg-background px-4 py-3 transition focus-within:ring-2 focus-within:ring-primary ${error ? "border-destructive" : "border-border"}`}>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}