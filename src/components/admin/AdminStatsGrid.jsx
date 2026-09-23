export default function AdminStatsGrid({ stats, counts }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.tone}`}><stat.icon className="h-5 w-5" /></span>
          <div>
            <p className="heading-font text-2xl font-bold leading-none">{counts[stat.key]}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}