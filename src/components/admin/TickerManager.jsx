import { useEffect, useState } from "react";
import { Megaphone, Loader2, Save, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { adminList, adminCreate, adminUpdate } from "@/lib/adminApi";

export default function TickerManager() {
  const [id, setId] = useState(null);
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = await adminList("Ticker");
        const t = rows[0];
        if (t) { setId(t.id); setContent(t.content || ""); setIsActive(!!t.is_active); }
        else setContent("Aulas procedendo normalmente · Inscrições abertas para 2027");
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      if (id) await adminUpdate("Ticker", id, { content, is_active: isActive });
      else { const created = await adminCreate("Ticker", { content, is_active: isActive }); setId(created.id); }
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Megaphone className="h-5 w-5" /></span>
        <div>
          <h3 className="heading-font text-base font-bold">Banner de avisos</h3>
          <p className="text-xs text-muted-foreground">Frase que aparece no topo da página inicial</p>
        </div>
      </div>

      <form onSubmit={save} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Texto do banner</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="Use · para separar os avisos" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2" />
          <p className="mt-1.5 text-xs text-muted-foreground">Dica: separe os avisos com " · " para o efeito de marcadores.</p>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-primary" />
          <span className="text-sm font-medium">Banner ativo (visível na página inicial)</span>
        </label>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pré-visualização</p>
          <div className={`rounded-2xl bg-gradient-to-r from-[#1e88e5] to-[#00897b] px-4 py-2.5 text-center text-xs font-medium text-white sm:text-sm ${isActive ? "" : "opacity-50"}`}>
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white align-middle" />
            {content || "Texto do banner..."}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || !content.trim()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar banner
          </button>
          {saved && <span className="inline-flex items-center gap-1 text-sm font-medium text-secondary"><CheckCircle2 className="h-4 w-4" /> Salvo!</span>}
        </div>
      </form>
    </div>
  );
}