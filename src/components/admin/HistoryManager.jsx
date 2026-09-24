import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Loader2, Save } from "lucide-react";
import { adminCreate, adminList, adminUpdate } from "@/lib/adminApi";
import { HISTORY_DEFAULTS } from "@/lib/historyDefaults";
import { Field, inputCls } from "./ui";

export default function HistoryManager() {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(HISTORY_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminList("ContactInfo")
      .then((rows) => {
        setRecord(rows[0] || null);
        setForm({ ...HISTORY_DEFAULTS, ...rows[0] });
      })
      .catch(() => setError("Não foi possível carregar a história. Tente novamente mais tarde."));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const data = { history_title: form.history_title.trim(), history_text: form.history_text.trim() };
    try {
      const updated = record?.id
        ? await adminUpdate("ContactInfo", record.id, data)
        : await adminCreate("ContactInfo", data);
      setRecord(updated);
      setForm((current) => ({ ...current, ...data }));
      setSaved(true);
    } catch {
      setError("Não foi possível salvar a história. Confira sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></span>
        <div><h2 className="heading-font text-2xl font-bold">História da escola</h2><p className="text-sm text-muted-foreground">Edite o texto mostrado em Sobre a Escola.</p></div>
      </div>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <Field label="Título da seção"><input className={inputCls} value={form.history_title || ""} maxLength={100} required onChange={(e) => setForm((value) => ({ ...value, history_title: e.target.value }))} /></Field>
        <Field label="História (separe os parágrafos com uma linha em branco)"><textarea className={inputCls} rows={12} value={form.history_text || ""} maxLength={6000} required onChange={(e) => setForm((value) => ({ ...value, history_text: e.target.value }))} /></Field>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {saved && <p role="status" className="flex items-center gap-2 text-sm text-secondary"><CheckCircle2 className="h-4 w-4" /> História salva com sucesso.</p>}
      <button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar história
      </button>
    </form>
  );
}
