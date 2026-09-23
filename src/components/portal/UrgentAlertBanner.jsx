import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Banner destacado de avisos urgentes (ex.: suspensão de aulas, eventos
// extraordinários). Filtra avisos ativos com prioridade "urgente" relevantes
// ao público do perfil ("Todos" + o público informado).
export default function UrgentAlertBanner({ audience }) {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await base44.entities.Notice.filter({ is_active: true, priority: "urgente" }, "-date", 20);
        const relevant = all.filter((n) => !n.audience || n.audience === "Todos" || n.audience === audience);
        if (active) setAlerts(relevant);
      } catch (e) { console.error(e); }
    })();
    return () => { active = false; };
  }, [audience]);

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((a) => (
        <div key={a.id} className="relative flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white animate-pulse"><AlertTriangle className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">Aviso urgente</span>
              {a.audience && a.audience !== "Todos" && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">{a.audience}</span>}
              {a.date && <span className="text-[11px] text-muted-foreground">{new Date(a.date + "T00:00:00").toLocaleDateString("pt-BR")}</span>}
            </div>
            {a.title && <p className="mt-0.5 text-sm font-bold text-foreground">{a.title}</p>}
            <p className="text-sm leading-snug text-foreground/90">{a.content}</p>
          </div>
          <button onClick={() => setDismissed((d) => [...d, a.id])} aria-label="Dispensar aviso" className="shrink-0 rounded-lg p-1 text-amber-600 transition hover:bg-amber-100 dark:text-amber-400"><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}