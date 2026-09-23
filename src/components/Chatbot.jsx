import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Bot, User, ArrowRight, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { loadChatContext, findAnswer, buildContextText, todayISO } from "@/lib/chatbotKnowledge";

const initialMessage = {
  from: "bot",
  text: "Olá! 👋 Sou o Concierge CETI, seu assistente virtual. Posso falar sobre matrículas, calendário, cardápio, eventos, avisos, portal do aluno e mais. Como posso ajudar?",
};

// Fallback com IA: pergunta + contexto real da escola para o modelo responder.
async function askAI(question, ctx) {
  const today = todayISO().split("-").reverse().join("/");
  const prompt = `Você é o "Concierge CETI", o assistente virtual do site do CETI Sebastião Soares Ribeiro (plataforma SSR-Connect), uma escola pública estadual do Piauí, no Brasil.

Regras:
- Responda SEMPRE em português do Brasil, de forma cordial, objetiva e em no máximo 3 frases.
- Use APENAS as informações do CONTEXTO abaixo. NÃO invente telefones, datas, valores, nomes ou endereços.
- Se o contexto não tiver a resposta, diga que não tem essa informação e sugira falar com a secretaria pela página de Contato (/contato).
- Perguntas sobre acesso de alunos, professores ou responsáveis devem direcionar ao Portal Escolar (/portal-aluno), cujo login e senha são fornecidos pela escola.

Data de hoje: ${today}

CONTEXTO DA ESCOLA:
${buildContextText(ctx)}

PERGUNTA DO USUÁRIO: ${question}

Resposta:`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt });
  const text =
    typeof res === "string" ? res : res?.response || res?.text || res?.content || "";
  if (text && typeof text === "string") return text.trim();
  throw new Error("Sem resposta");
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ctx, setCtx] = useState(null);
  const bodyRef = useRef(null);
  const navigate = useNavigate();

  // Carrega o contexto real (cardápio, eventos, avisos...) ao abrir o chat.
  useEffect(() => {
    if (open && !ctx) {
      loadChatContext().then(setCtx).catch(() => setCtx({}));
    }
  }, [open, ctx]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (override) => {
    const text = (override ?? input).trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text }]);

    const match = findAnswer(text, ctx || {});
    if (match) {
      setMessages((m) => [...m, { from: "bot", text: match.answer, links: match.links }]);
      return;
    }

    // Sem resposta na base → usa a IA com o contexto da escola.
    setBusy(true);
    setMessages((m) => [...m, { from: "bot", typing: true }]);
    try {
      const answer = await askAI(text, ctx || {});
      setMessages((m) => [
        ...m.slice(0, -1),
        { from: "bot", text: answer, ai: true },
      ]);
    } catch {
      setMessages((m) => [
        ...m.slice(0, -1),
        {
          from: "bot",
          text: "Não tenho essa informação nos dados publicados. Consulte a secretaria pela página de Contato.",
          links: [{ label: "Fale Conosco", to: "/contato" }],
        },
      ]);
    }
    setBusy(false);
  };

  const suggestions = ["Como faço matrícula?", "Cardápio de hoje", "Próximos eventos"];

  return (
    <div className="fixed bottom-[calc(4.75rem_+_env(safe-area-inset-bottom))] lg:bottom-[calc(1.25rem_+_env(safe-area-inset-bottom))] right-[calc(1.25rem_+_env(safe-area-inset-right))] z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[440px] max-h-[calc(100dvh-11rem)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-secondary px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">Concierge CETI</p>
                <p className="flex items-center gap-1 text-[11px] opacity-80">
                  <Sparkles className="h-3 w-3" /> Responde sobre a escola
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fechar chat" className="rounded-full p-1 transition hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div ref={bodyRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto bg-background/40 p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2 ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from === "bot" && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <div className="flex max-w-[75%] flex-col gap-2">
                  <p
                    className={`whitespace-pre-line rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      m.from === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    {m.typing ? (
                      <span className="flex items-center gap-1 py-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                      </span>
                    ) : (
                      m.text
                    )}
                  </p>
                  {m.links?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <button
                          key={l.to + l.label}
                          onClick={() => {
                            navigate(l.to);
                            setOpen(false);
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
                        >
                          {l.label}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {m.from === "user" && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border bg-card p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Digite sua dúvida..."
              className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none ring-primary transition focus:ring-2"
            />
            <button
              onClick={() => send()}
              disabled={busy}
              aria-label="Enviar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:scale-105 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir assistente"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-2xl shadow-primary/40 transition-transform hover:scale-110 hover:rotate-3"
      >
        {open ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}