# SSR-CONNECT — implantação em 23/09/2026

- Site: https://ssr-connect.pages.dev
- Supabase exclusivo: `gczbmneklbmiitsgjvbm` (São Paulo).
- Tabela `ssr_records` com RLS e sem acesso direto de anon/authenticated.
- Bucket `ssr-public` existente; usar somente para materiais públicos.
- Funções `ssrApi`, `adminApi`, `portalApi` implantadas.
- `PORTAL_TOKEN_SECRET` aleatório configurado apenas no servidor.
- Compilação Vite e testes de tokens passaram.
- Consultas públicas retornam HTTP 200; dados privados sem sessão retornam 401/403.
- Home, JavaScript, `/portal-aluno` e `/admin-login` responderam HTTP 200.
- Verificação visual em navegador não realizada nesta sessão.

## Causa do problema

O repositório remoto não continha `src/`, `scripts/`, `tests/` nem as Edge
Functions. O HTML referenciava `/src/main.jsx`, mas esse arquivo não existia
no GitHub. A publicação correta usa os arquivos compilados em `dist`.

## Atualizar a hospedagem

O Cloudflare foi configurado por upload direto, sem sincronização automática
com GitHub. Após alterar o código:

```sh
npm ci
npm test
npm run build
npx wrangler pages deploy dist --project-name ssr-connect --branch main
```

`.env.production` contém somente URL e chave publicável do projeto dedicado.
Nunca adicionar chaves secretas ou o segredo de sessão a esse arquivo.

## Dados anteriores

O banco estava vazio no início desta implantação. O código exportado não
inclui alunos, professores, responsáveis, contas antigas ou mídias. A
importação exige uma exportação dos registros; não desligar o sistema antigo
antes de importar e conferir os dados. O banco Palmeirais Conectada não foi alterado.
