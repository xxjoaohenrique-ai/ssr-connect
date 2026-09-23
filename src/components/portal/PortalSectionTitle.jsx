// Título de seção usado para agrupar cartões dos dashboards do portal.
export default function PortalSectionTitle({ children }) {
  return (
    <div className="pt-3">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{children}</h3>
      <div className="mt-1.5 h-1 w-10 rounded-full bg-gradient-to-r from-primary to-secondary" />
    </div>
  );
}