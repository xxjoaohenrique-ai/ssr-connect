import { base44 } from "@/api/base44Client";

// Base de conhecimento do Concierge CETI — combina respostas fixas com dados
// reais do site (cardápio, eventos, avisos, notícias e contato) e monta o
// contexto usado pelo fallback de IA.

export const todayName = () => {
  const d = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
  const base = d.replace("-feira", "").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso) => {
  const [y, m, d] = (iso || "").split("-");
  return y ? `${d}/${m}` : "";
};

const norm = (t) =>
  (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const has = (lower, keys) => keys.some((k) => lower.includes(k));

const safe = async (p) => {
  try { return await p; } catch { return []; }
};

// Carrega dados reais para enriquecer as respostas (tolera falhas individuais).
export async function loadChatContext() {
  const today = todayISO();
  const [contacts, notices, events, menu, news] = await Promise.all([
    safe(base44.entities.ContactInfo.list()),
    safe(base44.entities.Notice.filter({ is_active: true }, "-date", 3)),
    safe(base44.entities.CalendarEvent.filter({ is_active: true })),
    safe(base44.entities.Menu.filter({ is_active: true })),
    safe(base44.entities.News.filter({ is_published: true }, "-date", 3)),
  ]);
  const upcoming = (events || [])
    .filter((e) => (e.date || "") >= today)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .slice(0, 5);
  return {
    contact: contacts?.[0] || null,
    notices: notices || [],
    events: upcoming,
    menuToday: (menu || []).find((m) => m.weekday === todayName()) || null,
    news: news || [],
  };
}

// Respostas fixas (palavras-chave sem acento — o texto do usuário é normalizado).
const STATIC_KNOWLEDGE = [
  {
    keys: ["matricula", "inscri", "vaga", "transferencia"],
    answer:
      "As matrículas e transferências são feitas na secretaria da escola, conforme o calendário da rede estadual. Use a página de Contato para falar diretamente com a secretaria.",
    links: [{ label: "Fale com a secretaria", to: "/contato" }],
  },
  {
    keys: ["calendario", "feriado", "recesso", "letivo"],
    answer:
      "O calendário escolar completo — com provas, eventos, feriados e reuniões — fica na página de Calendário.",
    links: [{ label: "Ver Calendário", to: "/calendario" }],
  },
  {
    keys: ["biblioteca", "livro", "acervo", "ebook", "pesquisa escolar"],
    answer:
      "A biblioteca reúne obras e materiais de apoio ao estudo. Acesse a seção Biblioteca para explorar o acervo.",
    links: [{ label: "Biblioteca", to: "/biblioteca" }],
  },
  {
    keys: ["prova", "simulado", "avaliacao", "nota", "boletim", "recuperacao"],
    answer:
      "O calendário de provas e avaliações está no Calendário Escolar, e comunicados de última hora aparecem nas Notícias.",
    links: [{ label: "Calendário de Provas", to: "/calendario" }, { label: "Notícias", to: "/noticias" }],
  },
  {
    keys: ["curso", "modalidade", "ensino fundamental", "ensino medio", "tecnico"],
    answer:
      "Oferecemos a formação escolar básica do ensino médio integrado, conforme a base comum das escolas estaduais do Piauí. Veja os detalhes na página de Cursos.",
    links: [{ label: "Ver Cursos", to: "/cursos" }],
  },
  {
    keys: ["uniforme", "vestimenta"],
    answer:
      "As orientações sobre uniforme são divulgadas pela secretaria. Para as regras vigentes, fale com a escola pela página de Contato.",
    links: [{ label: "Fale Conosco", to: "/contato" }],
  },
  {
    keys: ["onibus", "transporte", "rota escolar"],
    answer:
      "As informações sobre transporte escolar e rotas são gerenciadas pela secretaria. Entre em contato para orientações do seu bairro.",
    links: [{ label: "Contato", to: "/contato" }],
  },
  {
    keys: ["mensalidade", "pagamento", "boleto", "taxa", "gratuito", "gratuidade"],
    answer:
      "O CETI Sebastião Soares Ribeiro é uma escola pública estadual — todo o ensino é gratuito, sem mensalidades ou taxas.",
  },
  {
    keys: ["portal", "login", "senha", "conta do aluno", "primeiro acesso", "esqueci"],
    answer:
      "O acesso de alunos, professores e responsáveis é pelo Portal Escolar, com o login e a senha fornecidos pela escola. Esqueceu a senha? Procure a secretaria para redefini-la.",
    links: [{ label: "Ir ao Portal Escolar", to: "/portal-aluno" }],
  },
  {
    keys: ["quem somos", "historia", "sobre a escola", "proposta pedagogica", "estrutura"],
    answer:
      "O CETI Sebastião Soares Ribeiro é uma escola pública de referência no ensino médio piauiense. Conheça nossa história e estrutura na página Sobre.",
    links: [{ label: "Sobre a escola", to: "/sobre" }],
  },
  {
    keys: ["ola", "oi", "bom dia", "boa tarde", "boa noite", "ajuda", "quem e voce"],
    answer:
      "Olá! Sou o Concierge CETI, assistente virtual da escola. Posso ajudar com matrículas, calendário, cardápio, eventos, portal do aluno e mais. Sobre o que você quer saber?",
  },
];

// Tenta responder com dados reais + base fixa. Retorna { answer, links } ou null.
export function findAnswer(text, ctx = {}) {
  const lower = norm(text);

  // Cardápio de hoje (dados reais)
  if (has(lower, ["cardapio", "merenda", "comida", "lanche", "almoco", "refeicao", "cantina", "o que tem pra comer"])) {
    const m = ctx.menuToday;
    if (m) {
      const parts = [
        m.lanche_manha && `Lanche da manhã: ${m.lanche_manha}`,
        m.almoco && `Almoço: ${m.almoco}`,
        m.lanche_tarde && `Lanche da tarde: ${m.lanche_tarde}`,
      ].filter(Boolean);
      if (parts.length) return { answer: `Hoje (${todayName()}) o cardápio do refeitório é:\n${parts.map((p) => `• ${p}`).join("\n")}` };
    }
    return { answer: `O cardápio de hoje (${todayName()}) ainda não foi publicado. Fique de olho no Portal Escolar, onde ele é atualizado pela secretaria.` };
  }

  // Próximos eventos (dados reais)
  if (has(lower, ["evento", "reuniao", "agenda", "proxim", "vai acontecer", "comemoracao"])) {
    const evs = ctx.events || [];
    if (evs.length) {
      return {
        answer: `Próximos eventos no calendário:\n${evs.map((e) => `• ${fmtDate(e.date)} — ${e.title}${e.location ? ` (${e.location})` : ""}`).join("\n")}`,
        links: [{ label: "Ver Calendário completo", to: "/calendario" }],
      };
    }
    return { answer: "No momento não há eventos futuros publicados no calendário.", links: [{ label: "Ver Calendário", to: "/calendario" }] };
  }

  // Avisos ativos (dados reais)
  if (has(lower, ["aviso", "comunicado", "mural", "recado", "urgente"])) {
    const ns = ctx.notices || [];
    if (ns.length) {
      return {
        answer: `Avisos mais recentes:\n${ns.map((n) => `• ${n.priority === "urgente" ? "🔴 " : n.priority === "alta" ? "🟠 " : ""}${n.title}`).join("\n")}`,
        links: [{ label: "Portal Escolar", to: "/portal-aluno" }],
      };
    }
    return { answer: "Não há avisos ativos neste momento." };
  }

  // Notícias (dados reais)
  if (has(lower, ["noticia", "novidade", "jornal", "ultimas"])) {
    const ns = ctx.news || [];
    if (ns.length) {
      return {
        answer: `Últimas notícias da escola:\n${ns.map((n) => `• ${n.title}`).join("\n")}`,
        links: [{ label: "Ver todas as Notícias", to: "/noticias" }],
      };
    }
    return { answer: "Ainda não há notícias publicadas.", links: [{ label: "Notícias", to: "/noticias" }] };
  }

  // Contato (dados reais, com descrição do que existe)
  if (has(lower, ["contato", "telefone", "email", "endereco", "horario de funcionamento", "horario de atendimento", "falar com", "secretaria", "whatsapp"])) {
    const c = ctx.contact;
    const parts = [
      c?.phone && `Telefone: ${c.phone}`,
      c?.email && `E-mail: ${c.email}`,
      c?.address && `Endereço: ${c.address}`,
      c?.hours && `Atendimento: ${c.hours}`,
    ].filter(Boolean);
    if (parts.length) {
      return { answer: `Você pode falar com a escola por:\n${parts.map((p) => `• ${p}`).join("\n")}`, links: [{ label: "Página de Contato", to: "/contato" }] };
    }
    return { answer: "Todos os canais de atendimento da escola estão na página de Contato.", links: [{ label: "Fale Conosco", to: "/contato" }] };
  }

  // Horário geral (após contato, para não captar "horário de funcionamento")
  if (has(lower, ["horario", "que horas", "expediente", "funciona ate"])) {
    const hours = ctx.contact?.hours;
    return {
      answer: hours
        ? `O funcionamento da escola é: ${hours}.`
        : "Os horários de funcionamento e de aula por turma são divulgados pela secretaria — confira na página de Contato.",
      links: [{ label: "Contato", to: "/contato" }],
    };
  }

  const match = STATIC_KNOWLEDGE.find((k) => has(lower, k.keys));
  if (match) return { answer: match.answer, links: match.links };
  return null;
}

// Contexto textual resumido para o fallback de IA.
export function buildContextText(ctx = {}) {
  const c = ctx.contact;
  const lines = [];
  lines.push(`- Contato: ${[c?.phone, c?.email, c?.address, c?.hours].filter(Boolean).join(" · ") || "ver página /contato"}`);
  lines.push(`- Avisos ativos: ${(ctx.notices || []).map((n) => n.title).join("; ") || "nenhum"}`);
  lines.push(`- Próximos eventos: ${(ctx.events || []).map((e) => `${fmtDate(e.date)} ${e.title}`).join("; ") || "nenhum"}`);
  const m = ctx.menuToday;
  lines.push(`- Cardápio de hoje: ${m ? [m.lanche_manha, m.almoco, m.lanche_tarde].filter(Boolean).join(" | ") : "não publicado"}`);
  lines.push(`- Últimas notícias: ${(ctx.news || []).map((n) => n.title).join("; ") || "nenhuma"}`);
  lines.push("- Páginas do site: /sobre, /cursos, /professores, /biblioteca, /noticias, /galeria, /calendario, /contato, /portal-aluno (Portal Escolar de alunos, professores e responsáveis)");
  lines.push("- O CETI Sebastião Soares Ribeiro é uma escola pública estadual do Piauí (ensino gratuito, sem mensalidades).");
  return lines.join("\n");
}