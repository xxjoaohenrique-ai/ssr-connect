import { useEffect, useState, useCallback } from "react";
import { Users, Loader2, Search, Check } from "lucide-react";
import { portalApi } from "@/lib/portalApi";
import { COURSE_OPTIONS } from "@/lib/courses";

// Tabela editável rápida: lista os alunos das turmas do professor e salva
// alterações (turma, curso, matrícula, situação) direto no cadastro do aluno,
// refletindo automaticamente no Portal do Aluno.
export default function TurmaStudentsTable({ turmas, teacherId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [turmaFilter, setTurmaFilter] = useState("Todas");
  const [savingId, setSavingId] = useState(null);
  const [savedAt, setSavedAt] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await portalApi({ action: "studentsByTurma", turmas, teacherId });
      setStudents(data.students);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [turmas, teacherId]);

  useEffect(() => { load(); }, [load]);

  const save = async (id, patch) => {
    setSavingId(id);
    try {
      await portalApi({ action: "updateStudent", id, patch, teacherId });
      setStudents((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
      setSavedAt((m) => ({ ...m, [id]: Date.now() }));
    } catch (e) { console.error(e); }
    setSavingId(null);
  };

  const matchesSearch = (s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (s.name || "").toLowerCase().includes(q) || (s.student_login || "").toLowerCase().includes(q) || (s.turma || "").toLowerCase().includes(q);
  };
  const matchesTurma = (s) => turmaFilter === "Todas" || s.turma === turmaFilter;
  const filtered = students.filter((s) => matchesSearch(s) && matchesTurma(s));
  const countByTurma = {};
  students.forEach((s) => { countByTurma[s.turma || ""] = (countByTurma[s.turma || ""] || 0) + 1; });
  const chipCls = (active) =>
    `rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${active ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`;

  const inputCls = "w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none transition hover:border-border focus:border-primary focus:bg-background";

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></span>
        <div className="flex-1">
          <h3 className="heading-font text-base font-bold">Minha turma</h3>
          <p className="text-xs text-muted-foreground">Edição rápida do perfil dos alunos — salva automaticamente no portal</p>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, login ou turma" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none ring-primary transition focus:ring-2" />
      </div>

      {!loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setTurmaFilter("Todas")} className={chipCls(turmaFilter === "Todas")}>Todas ({students.length})</button>
          {turmas.map((t) => (
            <button key={t} onClick={() => setTurmaFilter(t)} className={chipCls(turmaFilter === t)}>
              {t} ({countByTurma[t] || 0})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Nenhum aluno encontrado.</p>
      ) : (
        <div className="mt-4 -mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pl-2">Aluno</th>
                <th className="pb-2">Turma</th>
                <th className="pb-2">Curso</th>
                <th className="pb-2">Matrícula</th>
                <th className="pb-2 pr-2 text-center">Situação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const justSaved = savedAt[s.id] && Date.now() - savedAt[s.id] < 2500;
                return (
                  <tr key={s.id} className="border-t border-border/60">
                    <td className="py-1 pl-2 align-middle">
                      <p className="font-medium leading-tight">{s.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{s.student_login}</p>
                    </td>
                    <td className="py-1 align-middle">
                      <input key={`t-${s.id}-${s.turma}`} defaultValue={s.turma || ""} onBlur={(e) => { const v = e.target.value.trim(); if (v !== (s.turma || "")) save(s.id, { turma: v }); }} className={inputCls} placeholder="—" />
                    </td>
                    <td className="py-1 align-middle">
                      <select key={`c-${s.id}-${s.course}`} defaultValue={s.course || ""} onChange={(e) => save(s.id, { course: e.target.value })} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none transition hover:border-border focus:border-primary focus:bg-background">
                        <option value="">—</option>
                        {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-1 align-middle">
                      <input key={`e-${s.id}-${s.enrollment}`} defaultValue={s.enrollment || ""} onBlur={(e) => { const v = e.target.value.trim(); if (v !== (s.enrollment || "")) save(s.id, { enrollment: v }); }} className={inputCls} placeholder="—" />
                    </td>
                    <td className="py-1 pr-2 align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => save(s.id, { is_active: !s.is_active })}
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${s.is_active ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"}`}
                        >
                          {s.is_active ? "Ativo" : "Inativo"}
                        </button>
                        {savingId === s.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                        {justSaved && savingId !== s.id && <Check className="h-3.5 w-3.5 text-secondary" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}