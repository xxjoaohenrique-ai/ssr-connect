import { useEffect, useState } from "react";
import { Loader2, UtensilsCrossed, Coffee, Soup, Cookie, ChevronDown, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MEALS = [
  { key: "lanche_manha", label: "Lanche da manhã", icon: Coffee },
  { key: "almoco", label: "Almoço", icon: Soup },
  { key: "lanche_tarde", label: "Lanche da tarde", icon: Cookie },
];

const todayName = () => {
  const d = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
  const base = d.replace("-feira", "").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
};

export default function MenuCard() {
  const today = todayName();
  const todayIdx = DAYS.indexOf(today);
  // A semana começa no dia de hoje — os próximos dias vêm em sequência.
  const orderedDays = todayIdx >= 0 ? [...DAYS.slice(todayIdx), ...DAYS.slice(0, todayIdx)] : DAYS;

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({ [today]: true });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await base44.entities.Menu.filter({ is_active: true });
        if (active) setMenu(all);
      } catch (e) { console.error(e); } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const toggle = (d) => setOpen((o) => ({ ...o, [d]: !o[d] }));

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UtensilsCrossed className="h-5 w-5" /></span>
        <div>
          <h3 className="heading-font text-base font-bold">Cardápio do refeitório</h3>
          <p className="text-xs text-muted-foreground">A partir de hoje — toque em um dia para ver os detalhes</p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : menu.length === 0 ? (
          <div className="py-6 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">Cardápio ainda não publicado.</p>
          </div>
        ) : (
          orderedDays.map((d) => {
            const item = menu.find((m) => m.weekday === d);
            const isToday = d === today;
            const isOpen = !!open[d];
            const almoco = (item?.almoco || "").trim();
            return (
              <div
                key={d}
                className={`overflow-hidden rounded-2xl border transition ${isToday ? "border-primary bg-primary/5" : "border-border bg-background"}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(d)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isToday ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {d.slice(0, 3)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`flex items-center gap-2 text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
                      {isToday ? "Hoje" : d}
                      {!almoco && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">a definir</span>}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {almoco ? `Almoço: ${almoco}` : "Sem refeições publicadas"}
                    </span>
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-border/70 px-4 pb-4 pt-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {MEALS.map((m) => {
                        const Icon = m.icon;
                        const value = (item?.[m.key] || "").trim();
                        return (
                          <div key={m.key} className={`rounded-xl border border-border/70 p-3 ${value ? "bg-card" : ""}`}>
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                              <Icon className="h-3.5 w-3.5 text-primary" /> {m.label}
                            </p>
                            <p className="mt-1 text-sm leading-snug">
                              {value || <span className="text-muted-foreground/60">—</span>}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}