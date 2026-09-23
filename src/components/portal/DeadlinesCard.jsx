import { useEffect, useState } from "react";
import { ClipboardCheck, Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const todayMidnight = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const daysUntil = (dateStr) => Math.round((new Date(dateStr + "T00:00:00") - todayMidnight()) / 86400000);

const TYPE_TONE = {
  "Prova": "bg-amber-500/15 text-amber-600",
  "Atividade": "bg-primary/10 text-primary",
};

// Destaca visualmente os próximos prazos de entrega (provas e atividades)
// vindos do calendário escolar, com contagem de dias e alerta para prazos próximos.
export default function DeadlinesCard({ title = "Próximos prazos de entrega", subtitle = "Provas e atividades que estão chegando", limit = 4 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await base44.entities.CalendarEvent.filter({ is_active: true }, "date", 50);
        const todayStr = new Date().toISOString().slice(0, 10);
        const upcoming = all
          .filter((e) => (e.date || "") >= todayStr && (e.type === "Prova" || e.type === "Atividade"))
          .slice(0, limit);
        if (active) setItems(upcoming);
      } catch (e) { console.error(e); } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const fmt = (d) => {
    try { return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); } catch { return d; }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardCheck className="h-5 w-5" /></span>
        <div>
          <h3 className="heading-font text-base font-bold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum prazo próximo. Você está em dia!</p>
        ) : (
          items.map((e) => {
            const days = daysUntil(e.date);
            const urgent = days <= 3;
            const [day, month] = fmt(e.date).split(" ");
            return (
              <div key={e.id} className={`flex items-start gap-3 rounded-2xl border p-4 ${urgent ? "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10" : "border-border bg-background"}`}>
                <span className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl ${urgent ? "bg-amber-500 text-white" : "bg-primary/10 text-primary"}`}>
                  <span className="text-sm font-extrabold leading-none">{day}</span>
                  <span className="text-[10px] uppercase">{month}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${TYPE_TONE[e.type] || "bg-muted text-muted-foreground"}`}>{e.type}</span>
                    {urgent && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white"><AlertTriangle className="h-3 w-3" /> Em breve</span>}
                  </div>
                  <p className="mt-0.5 text-sm font-semibold">{e.title}</p>
                  {e.location && <p className="text-xs text-muted-foreground">{e.location}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${urgent ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>
                  {days <= 0 ? "Hoje" : days === 1 ? "1 dia" : `${days} dias`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}