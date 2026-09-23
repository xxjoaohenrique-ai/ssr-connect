export default function AdminQuickActions({ actions, onNavigate }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => onNavigate(action.key)}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/40"
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.tone}`}><action.icon className="h-5 w-5" /></span>
          <span>
            <span className="block text-sm font-semibold">{action.label}</span>
            <span className="block text-xs text-muted-foreground">{action.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}