import { useEffect, useState } from "react";
import {
  Save, Loader2, UtensilsCrossed, CheckCircle2, Coffee, Soup, Cookie,
} from "lucide-react";
import { adminList, adminCreate, adminUpdate } from "@/lib/adminApi";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MEALS = [
  { key: "lanche_manha", label: "Lanche da manhã", icon: Coffee, ph: "Ex.: Pão com manteiga, suco..." },
  { key: "almoco", label: "Almoço", icon: Soup, ph: "Ex.: Arroz, feijão, carne..." },
  { key: "lanche_tarde", label: "Lanche da tarde", icon: Cookie, ph: "Ex.: Bolo, fruta, leite..." },
];

const todayName = () => {
  const d = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
  const base = d.replace("-feira", "").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
};

const daySig = (cur) =>
  [cur?.lanche_manha || "", cur?.almoco || "", cur?.lanche_tarde || ""].join("¦");

export default function MenuManager() {
  const [form, setForm] = useState(null);
  const [savedSigs, setSavedSigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(null);
  const today = todayName();

  const load = async () => {
    setLoading(true);
    const all = await adminList("Menu");
    const map = {};
    const sigs = {};
    for (const d of DAYS) {
      const r = all.find((x) => x.weekday === d);
      map[d] = { id: r?.id, lanche_manha: r?.lanche_manha || "", almoco: r?.almoco || "", lanche_tarde: r?.lanche_tarde || "" };
      sigs[d] = daySig(map[d]);
    }
    setForm(map);
    setSavedSigs(sigs);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (day, field) => (e) =>
    setForm((f) => ({ ...f, [day]: { ...f[day], [field]: e.target.value } }));

  const dirtyDays = form ? DAYS.filter((d) => daySig(form[d]) !== savedSigs[d]) : [];
  const completeDays = form ? DAYS.filter((d) => MEALS.every((m) => (form[d]?.[m.key] || "").trim())).length : 0;

  const save = async (e) => {
    e.preventDefault();
    if (!dirtyDays.length) return;
    setSaving(true); setOk(null);
    for (const d of dirtyDays) {
      const cur = form[d];
      if (cur.id) {
        await adminUpdate("Menu", cur.id, { lanche_manha: cur.lanche_manha, almoco: cur.almoco, lanche_tarde: cur.lanche_tarde });
      } else {
        await adminCreate("Menu", { weekday: d, lanche_manha: cur.lanche_manha, almoco: cur.almoco, lanche_tarde: cur.lanche_tarde, is_active: true });
      }
    }
    setSaving(false);
    setOk(`Cardápio salvo! ${dirtyDays.length === 1 ? "1 dia atualizado." : `${dirtyDays.length} dias atualizados.`}`);
    load();
  };

  if (loading || !form) return <Loader2 className="mt-10 h-6 w-6 animate-spin text-primary" />;

  return (
    <form onSubmit={save}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UtensilsCrossed className="h-5 w-5" /></span>
        <div>
          <h2 className="heading-font text-2xl font-bold">Cardápio do refeitório</h2>
          <p className="text-sm text-muted-foreground">Defina o lanche da manhã, o almoço e o lanche da tarde de cada dia</p>
        </div>
      </div>

      {ok && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary">
          <CheckCircle2 className="h-4 w-4" /> {ok}
        </p>
      )}

      {/* Progresso de preenchimento */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Semana preenchida</p>
          <p className="text-xs text-muted-foreground">{completeDays} de {DAYS.length} dias completos</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${Math.round((completeDays / DAYS.length) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {DAYS.map((d) => {
          const cur = form[d];
          const filled = MEALS.filter((m) => (cur?.[m.key] || "").trim()).length;
          const isToday = d === today;
          const isDirty = daySig(cur) !== savedSigs[d];
          return (
            <div
              key={d}
              className={`rounded-2xl border bg-card p-4 transition sm:p-5 ${isToday ? "border-primary/60 shadow-card" : "border-border"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="heading-font text-sm font-bold">{d}</h3>
                {isToday && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">Hoje</span>}
                <span className="ml-auto flex items-center gap-2">
                  {isDirty && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-600">Não salvo</span>}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${filled === 3 ? "bg-secondary/10 text-secondary" : filled === 0 ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                    {filled === 3 ? "Completo" : filled === 0 ? "Vazio" : "Parcial"}
                  </span>
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {MEALS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.key}>
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <Icon className="h-3.5 w-3.5 text-primary" /> {m.label}
                      </label>
                      <textarea
                        rows={2}
                        value={cur?.[m.key] || ""}
                        onChange={set(d, m.key)}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring-2"
                        placeholder={m.ph}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-10 mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving || dirtyDays.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-float transition hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {dirtyDays.length > 0 ? `Salvar alterações (${dirtyDays.length})` : "Cardápio salvo"}
        </button>
      </div>
    </form>
  );
}