# SSR-CONNECT independente do Base44

Este repositório foi convertido a partir do ZIP exportado pelo proprietário.
Ele contém frontend React/Vite, autenticação Supabase Auth, backend Supabase Edge
Functions, tabelas JSONB, armazenamento de mídia e configuração de hospedagem
Cloudflare Pages. **Não está implantado e não contém dados exportados do Base44.**

**Não usar o Supabase do Palmeirais Conectada.** Crie um NOVO projeto para o SSR-CONNECT.
Não publique nem desative o site Base44 enquanto não testar as contas e os dados.

## Visão geral

- `src/`: interface original React (páginas, portal escolar, admin e estilos).
- `src/api/ssrClient.js`: ponte para Supabase; `base44Client.js` é somente alias de compatibilidade de imports.
- `supabase/functions/portalApi`: regras originais de login e rotas do aluno, professor, responsável.
- `supabase/functions/adminApi`: acesso exclusivo à administração via sessão SSR.
- `supabase/functions/ssrApi`: consulta pública filtrada, depoimentos pendentes e upload da equipe.
- `supabase/migrations/202609220001_ssr_connect.sql`: tabela, RLS e bucket de mídia.
- `scripts/`: criação da primeira conta administrativa e importação posterior dos dados JSON.

## 1. Novo banco dedicado

1. Entre em https://supabase.com/dashboard e crie projeto chamado `ssr-connect`.
2. No **SQL Editor do projeto novo**, execute o arquivo
   `supabase/migrations/202609220001_ssr_connect.sql`.
3. Em **Settings > API** (ou Connect), copie a Project URL e a chave
   **publishable/anon** para um arquivo `.env.local` com base em `.env.example`.
4. Em **Authentication > URL Configuration**, configure Site URL para o domínio
   do novo site e os Redirect URLs `https://SEU-SITE/*` e
   `http://localhost:5173/*`. Habilite login por e-mail; login pelo Google
   só funciona após configurar o Google como provedor no Supabase.
5. Configure no backend um segredo aleatório **PORTAL_TOKEN_SECRET** de pelo
   menos 32 bytes. Nunca insira segredo/chave de serviço em arquivo `VITE_`.

## 2. Backend, sem Base44

Com o Supabase CLI disponível (`npx supabase --help`), na pasta do projeto:

```bash
npx supabase login
npx supabase link --project-ref SEU_ID_DO_NOVO_PROJETO
npx supabase secrets set PORTAL_TOKEN_SECRET=UM_SEGREDO_FORTE_E_ALEATORIO
npx supabase functions deploy portalApi
npx supabase functions deploy adminApi
npx supabase functions deploy ssrApi
```

As funções devem estar configuradas com `verify_jwt=false` em
`supabase/config.toml`; **cada endpoint valida suas próprias permissões**.
Verifique `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` nas configurações
reservadas do backend, sem expô-las no frontend. Depois da implantação,
faça login e teste consulta pública, criação/edição, professor e aluno.

## 3. Primeiro administrador

O ZIP não tem dados de banco nem contas. Se NÃO houver administradores
importados, configure variáveis *temporárias só no seu terminal*:
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
e execute `node scripts/seed-admin.mjs`. A senha deve ter 12+ caracteres.
Se importar `AdminAccount`, não crie uma segunda conta sem necessidade.
Não grave senhas nem `SUPABASE_SERVICE_ROLE_KEY` no repositório.

## 4. Dados antigos, se já houver usuários

Exportar código ZIP **não** exporta entidades/dados/usuários/mídias.
Faça backup independente no Base44 e, quando disponíveis, exporte os registros
em arquivos separados `Student.json`, `Teacher.json`, `Parent.json`, `AdminAccount.json`,
`News.json`, `Notice.json`, `CalendarEvent.json`, `Menu.json`, `Lesson.json`, etc.
Cada arquivo deve conter um array de registros completos, **incluindo id e
password_hash onde já existirem**. Rode com credenciais apenas no terminal:

```bash
node scripts/import-export.mjs ./exportacao-base44
```

O importador preserva IDs para não romper vínculos entre responsáveis,
alunos e aulas. Depois compare a contagem por entidade, verifique
permissões e teste login de contas existentes. **Usuários da autenticação
nativa do Base44 não são migrados pelo exportador JSON**: eles precisarão
recriar senha/cadastro no Supabase Auth. As contas escolares baseadas em
`Student`, `Teacher`, `Parent`, `AdminAccount` poderão usar os hashes
migrados pelo script, se completos.

**Mídia:** o ZIP continha três imagens vinculadas a `media.base44.com`,
mas não os seus bytes. Elas foram trocadas por ilustrações SVG locais para
eliminar a dependência externa. Se quiser as imagens exatas, exporte-as e
coloque em `public/images/` alterando os três caminhos em Home/About.
Arquivos `file_url` antigos dentro dos registros de aulas e galeria também
precisam ser baixados/republicados no bucket `ssr-public`, com links atualizados.
Evite colocar fichas pessoais ou listas de alunos no bucket público.

## 5. Rodar e hospedar interface

```bash
npm ci
npm run dev
npm run build
```

Configure Cloudflare Pages com repositório próprio do SSR-CONNECT:
Framework Vite, comando `npm ci && npm run build`, pasta `dist`, duas
variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. O arquivo
`public/_redirects` mantém a navegação React em links diretos e atualização.
No Cloudflare, teste no domínio temporário **antes** de apontar qualquer domínio.

## Limitações e verificações antes de publicar

- **Importação automática de nomes por PDF** antes oferecida por IA do
  Base44: indisponível; permaneceu entrada manual. Não enviamos PDFs com
  nomes de alunos para armazenamento público.
- **Chatbot:** respostas da base de conhecimento local funcionam quando
  seus dados estiverem importados; consulta remota à IA está desativada.
- **Senhas antigas:** o código herdado usa SHA-256 simples para contas
  escolares. Recomenda-se migrá-las para hash lento e revisão de sessões
  em uma etapa de segurança posterior; nunca compartilhar os hashes.
- **Segurança:** tabela SQL com RLS e sem acesso direto anon/authenticated;
  dados de alunos passam somente pelas funções que validam papéis/tokens.
- **Publicação real:** este ZIP prepara o projeto, mas não cria Supabase,
  não transfere dados e não altera o site original.

## Testes incluídos

`npm test` valida assinatura, integridade e expiração de tokens SSR (Node 22+).
Os arquivos JS/TS também passaram por verificação de sintaxe, e os imports
`@/` foram conferidos. Um `npm run build` completo e um teste de integração
com banco exigem instalar dependências e configurar o **novo** Supabase;
esses testes não foram executados neste ambiente sem acesso ao registro npm.
