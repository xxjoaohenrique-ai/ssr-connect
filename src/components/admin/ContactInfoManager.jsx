import { useEffect, useState } from "react";
import { Save, Loader2, CheckCircle2, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { adminList, adminCreate, adminUpdate } from "@/lib/adminApi";
import { Field, inputCls } from "./ui";
import { CONTACT_DEFAULTS } from "@/lib/contactDefaults";

// Edita o registro único de textos da página de Contato. Cria na primeira vez.
export default function ContactInfoManager() {
  const [info, setInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    adminList("ContactInfo")
      .then((rows) => setInfo(rows[0] ? { ...CONTACT_DEFAULTS, ...rows[0] } : { ...CONTACT_DEFAULTS }))
      .catch(() => setInfo({ ...CONTACT_DEFAULTS }));
  }, []);

  const set = (k) => (e) => setInfo((i) => ({ ...i, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { id, created_date, updated_date, created_by_id, ...payload } = info;
    try {
      if (id) {
        await adminUpdate("ContactInfo", id, payload);
      } else {
        const created = await adminCreate("ContactInfo", payload);
        setInfo({ ...CONTACT_DEFAULTS, ...created });
      }
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (!info) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Phone className="h-5 w-5" /></span>
        <div>
          <h2 className="heading-font text-2xl font-bold">Página de Contato</h2>
          <p className="text-sm text-muted-foreground">Edite os textos exibidos na página pública de contato.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cabeçalho</p>
        <div className="space-y-4">
          <Field label="Título de destaque"><input value={info.hero_title} onChange={set("hero_title")} className={inputCls} /></Field>
          <Field label="Descrição do cabeçalho"><textarea rows={2} value={info.hero_description} onChange={set("hero_description")} className={inputCls} /></Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bloco de informações</p>
        <div className="space-y-4">
          <Field label="Título do bloco"><input value={info.intro_heading} onChange={set("intro_heading")} className={inputCls} /></Field>
          <Field label="Parágrafo de introdução"><textarea rows={2} value={info.intro_paragraph} onChange={set("intro_paragraph")} className={inputCls} /></Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dados de contato</p>
        <div className="space-y-4">
          <Field label="Endereço"><input value={info.address} onChange={set("address")} className={inputCls} /></Field>
          <Field label="Telefone"><input value={info.phone} onChange={set("phone")} className={inputCls} /></Field>
          <Field label="E-mail"><input value={info.email} onChange={set("email")} className={inputCls} /></Field>
          <Field label="Horário de atendimento"><input value={info.hours} onChange={set("hours")} className={inputCls} /></Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mapa e formulário</p>
        <div className="space-y-4">
          <Field label="URL do mapa (embed)"><input value={info.map_url} onChange={set("map_url")} className={inputCls} /></Field>
          <Field label="Título do formulário"><input value={info.form_heading} onChange={set("form_heading")} className={inputCls} /></Field>
        </div>
      </div>

      {ok && <p className="flex items-center gap-2 text-sm text-secondary"><CheckCircle2 className="h-4 w-4" /> Alterações salvas com sucesso!</p>}
      <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar alterações
      </button>
    </form>
  );
}