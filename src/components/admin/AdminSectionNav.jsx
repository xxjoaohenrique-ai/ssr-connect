// Navegação de seções do painel admin — barra horizontal rolável e fixa (mobile/tablet).
export default function AdminSectionNav({ sections, active, onSelect }) {
  return (
    <div className="sticky top-[calc(4rem_+_env(safe-area-inset-top))] z-30 -mx-4 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
      <div className="scrollbar-thin flex gap-1.5 overflow-x-auto py-2.5">
        {sections.map((s) => {
          const isActive = active === s.key;
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(s.key)}
              className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}