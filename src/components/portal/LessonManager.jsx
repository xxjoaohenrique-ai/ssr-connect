import { useEffect, useState, useCallback } from "react";
import { Video, Link as LinkIcon, Plus, Loader2, Trash2, ExternalLink, FileText, Upload, CheckCircle2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { portalApi } from "@/lib/portalApi";

// Gerenciador de aulas para o professor: publica vídeo-aulas, links e arquivos
// de apoio para uma turma, com upload direto, atalhos de disciplina e filtro
// rápido dos materiais já publicados.
export default function LessonManager({ turmas, disciplines = [], author, teacherId }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", type: "Vídeo", url: "", turma: "", discipline: disciplines[0] || "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);
  const [filterTurma, setFilterTurma] = useState("Todas");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Lesson.list("-date", 200);
      setLessons(all.filter((l) => !author || l.author === author));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [author]);

  useEffect(() => { load(); }, [load]);

  // Upload direto do arquivo: envia para o armazenamento e preenche o
  // formulário automaticamente — o professor só confirma turma e publica.
  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setOk(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({
        ...f,
        type: "Arquivo",
        url: file_url,
        title: f.title || file.name.replace(/\.[^.]+$/, ""),
      }));
      setFileName(file.name);
    } catch (e) {
      console.error(e);
      setError("Não foi possível enviar o arquivo. Tente novamente.");
    }
    setUploading(false);
  };

  const clearFile = () => {
    setForm((f) => ({ ...f, type: "Vídeo", url: "", title: fileName ? "" : f.title }));
    setFileName(null);
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const { lesson: rec } = await portalApi({
        action: "createLesson",
        teacherId,
        lesson: {
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type,
          url: form.url.trim(),
          turma: form.turma,
          discipline: form.discipline.trim(),
          author: author || "Professor",
        },
      });
      setLessons((l) => [rec, ...l]);
      setForm({ title: "", description: "", type: "Vídeo", url: "", turma: "", discipline: disciplines[0] || "" });
      setFileName(null);
      setOk("Material publicado! Seus alunos já podem acessá-lo.");
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao publicar. Tente novamente.");
    }
    setSaving(false);
  };

  const remove = async (id) => {
    try { await portalApi({ action: "deleteLesson", id, teacherId }); setLessons((l) => l.filter((x) => x.id !== id)); } catch (e) { console.error(e); }
  };

  const visible = lessons.filter((l) => filterTurma === "Todas" || l.turma === filterTurma);
  const countByTurma = {};
  lessons.forEach((l) => { countByTurma[l.turma || ""] = (countByTurma[l.turma || ""] || 0) + 1; });

  const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2";
  const chipCls = (active) =>
    `rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${active ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Video className="h-5 w-5" /></span>
        <div>
          <h3 className="heading-font text-base font-bold">Aulas e materiais</h3>
          <p className="text-xs text-muted-foreground">Publique vídeos, links e arquivos para seus alunos por turma</p>
        </div>
      </div>

      <form onSubmit={create} className="mt-5 space-y-3">
        {/* Upload rápido de arquivo — arraste ou clique */}
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition hover:border-primary/50 hover:bg-primary/5 ${fileName ? "border-secondary/50 bg-secondary/5" : "border-border bg-background"}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); uploadFile(e.dataTransfer?.files?.[0]); }}
        >
          <input
            type="file"
            className="hidden"
            onChange={(e) => { uploadFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm font-semibold">Enviando arquivo...</p>
            </>
          ) : fileName ? (
            <>
              <span className="flex items-center gap-2 rounded-full bg-secondary/15 px-4 py-1.5 text-xs font-semibold text-secondary">
                <CheckCircle2 className="h-4 w-4" /> {fileName}
              </span>
              <p className="text-xs text-muted-foreground">Arquivo pronto — ajuste turma e disciplina abaixo</p>
            </>
          ) : (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Upload className="h-5 w-5" /></span>
              <p className="text-sm font-semibold">Arraste um arquivo aqui ou clique para escolher</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, planilhas e outros materiais de aula</p>
            </>
          )}
        </label>
        {fileName && (
          <button type="button" onClick={clearFile} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-destructive">
            <X className="h-3.5 w-3.5" /> Remover arquivo e usar link manual
          </button>
        )}

        {(error || ok) && (
          <p className={`rounded-xl px-4 py-3 text-sm font-medium ${error ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}>
            {error || ok}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título da aula" className={inputCls} required />
          <select value={form.turma} onChange={(e) => setForm({ ...form, turma: e.target.value })} className={inputCls}>
            <option value="">Todas as turmas</option>
            {(turmas || []).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls} disabled={!!fileName}>
            <option value="Vídeo">Vídeo-aula</option>
            <option value="Link">Link externo</option>
            <option value="Arquivo">Arquivo anexado</option>
          </select>
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder={fileName ? "Arquivo já enviado" : "Link do vídeo (YouTube) ou URL"} className={inputCls} required disabled={!!fileName} />
        </div>

        {/* Atalhos de disciplina — um clique em vez de digitar */}
        {disciplines.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            {disciplines.map((d) => (
              <button key={d} type="button" onClick={() => setForm({ ...form, discipline: d })} className={chipCls(form.discipline === d)}>{d}</button>
            ))}
          </div>
        )}
        <input value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })} placeholder="Disciplina (opcional)" className={inputCls} />

        <button type="submit" disabled={saving || uploading} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Publicar
        </button>
      </form>

      {/* Publicados — filtro rápido por turma */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-5">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publicados ({lessons.length})</span>
        <button onClick={() => setFilterTurma("Todas")} className={chipCls(filterTurma === "Todas")}>Todas</button>
        {(turmas || []).map((t) => (
          <button key={t} onClick={() => setFilterTurma(t)} className={chipCls(filterTurma === t)}>
            {t} ({countByTurma[t] || 0})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : visible.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhum material publicado {filterTurma !== "Todas" ? `para ${filterTurma}` : "ainda"}.</p>
        ) : visible.map((l) => {
          const icon = l.type === "Vídeo" ? Video : l.type === "Arquivo" ? FileText : LinkIcon;
          const Icon = icon;
          return (
            <div key={l.id} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${l.type === "Vídeo" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">{l.title}</p>
                <p className="text-[11px] text-muted-foreground">{l.turma || "Todas as turmas"}{l.discipline ? ` · ${l.discipline}` : ""} · {l.type}</p>
                {l.description && <p className="mt-1 text-xs text-muted-foreground">{l.description}</p>}
                <a href={l.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Abrir</a>
              </div>
              <button onClick={() => remove(l.id)} aria-label="Remover" className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}