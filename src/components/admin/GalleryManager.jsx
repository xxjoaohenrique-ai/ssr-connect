import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2, Upload, CheckCircle2, Eye, EyeOff, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { adminList, adminCreate, adminDelete, adminUpdate } from "@/lib/adminApi";
import { inputCls } from "@/components/admin/ui";
import { Image } from "@/components/ui/image";

// Gestão da galeria de fotos: envio, exibição/ocultação e remoção das fotos
// da escola que aparecem na página Galeria do site público.
export default function GalleryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState([]);
  const [done, setDone] = useState(0);
  const [ok, setOk] = useState(null);
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const newOnes = Array.from(fileList || [])
      .filter((f) => f.type?.startsWith("image/"))
      .map((f) => ({ file: f, title: f.name.replace(/\.[^.]+$/, ""), preview: URL.createObjectURL(f) }));
    if (!newOnes.length) return;
    setPending((p) => [...p, ...newOnes]);
  };

  const setEntryTitle = (i) => (e) =>
    setPending((p) => p.map((it, idx) => (idx === i ? { ...it, title: e.target.value } : it)));

  const removeEntry = (i) =>
    setPending((p) => {
      URL.revokeObjectURL(p[i].preview);
      return p.filter((_, idx) => idx !== i);
    });

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminList("GalleryImage"));
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!pending.length) return;
    setSaving(true);
    setOk(null);
    let published = 0;
    try {
      for (const entry of pending) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: entry.file });
        await adminCreate("GalleryImage", { title: (entry.title || entry.file.name).trim(), image_url: file_url, is_active: true });
        published++;
        setDone(published);
      }
      pending.forEach((entry) => URL.revokeObjectURL(entry.preview));
      setPending([]);
      setOk(`${published} ${published === 1 ? "foto publicada" : "fotos publicadas"} na galeria do site!`);
      load();
    } catch (err) {
      pending.slice(0, published).forEach((entry) => URL.revokeObjectURL(entry.preview));
      setPending(pending.slice(published));
      setOk(`Erro ao enviar — ${published} ${published === 1 ? "foto publicada" : "fotos publicadas"} antes do erro: ` + (err?.message || "tente novamente."));
      if (published) load();
    }
    setDone(0);
    if (inputRef.current) inputRef.current.value = "";
    setSaving(false);
  };

  const toggle = async (item) => {
    setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, is_active: !x.is_active } : x)));
    try {
      await adminUpdate("GalleryImage", item.id, { is_active: !item.is_active });
    } catch (e) { load(); }
  };

  const remove = async (id) => {
    try {
      await adminDelete("GalleryImage", id);
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Camera className="h-5 w-5" /></span>
        <div>
          <h2 className="heading-font text-2xl font-bold">Galeria de fotos</h2>
          <p className="text-sm text-muted-foreground">Envie as fotos da escola — elas aparecem na página Galeria do site</p>
        </div>
      </div>

      {ok && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary">
          <CheckCircle2 className="h-4 w-4" /> {ok}
        </p>
      )}

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer?.files);
        }}
      >
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-center transition hover:border-primary/50 hover:bg-primary/5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Camera className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold">Arraste as fotos aqui ou clique para escolher do computador</p>
          <p className="text-xs text-muted-foreground">Dá para selecionar várias fotos de uma vez — os títulos podem ser ajustados antes de publicar</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>

        {pending.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pending.map((entry, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-background">
                <div className="relative">
                  <img src={entry.preview} alt={entry.title} className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeEntry(i)}
                    aria-label="Remover da lista"
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow-soft transition hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-2">
                  <input
                    value={entry.title}
                    onChange={setEntryTitle(i)}
                    className={inputCls + " !py-1.5 !text-xs"}
                    placeholder="Ex.: Feira de Ciências 2026"
                    maxLength={120}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || pending.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-float transition hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {saving
            ? `Enviando... (${done}/${pending.length})`
            : pending.length > 1
              ? `Publicar ${pending.length} fotos`
              : "Publicar foto"}
        </button>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma foto enviada ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className={`overflow-hidden rounded-2xl border bg-card ${item.is_active ? "border-border" : "border-border opacity-60"}`}>
                <Image src={item.image_url} alt={item.title} className="aspect-square w-full" />
                <div className="p-3">
                  <p className="break-all text-xs font-semibold leading-snug">{item.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => toggle(item)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${item.is_active ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}
                    >
                      {item.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {item.is_active ? "Visível" : "Oculta"}
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      aria-label="Excluir"
                      className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}