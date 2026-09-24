import { ChevronRight } from "lucide-react";

export default function AdminStatsGrid({ stats, counts, onNavigate }) {
  return (
    <div className="ssr-admin-stats grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <button key={stat.key} type="button" onClick={() => onNavigate(stat.key)} className="ssr-admin-stat flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.tone}`}><stat.icon className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <span className="block text-xs text-muted-foreground">{stat.label}</span>
            <span className="heading-font block text-2xl font-bold leading-none">{counts[stat.key]}</span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
