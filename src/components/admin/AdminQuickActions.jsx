import { ChevronRight } from "lucide-react";

export default function AdminQuickActions({ actions, onNavigate }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => onNavigate(action.key)}
          className="ssr-admin-action flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/40"
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.tone}`}><action.icon className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{action.label}</span>
            <span className="block text-xs text-muted-foreground">{action.description}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
