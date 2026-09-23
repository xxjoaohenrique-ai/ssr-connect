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
- Supabase Auth configurado com a URL publicada e redirecionamentos.
- Primeira conta administrativa criada; login e validação de sessão testados.
- Código completo enviado ao GitHub em `main`.

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


## Publicação automática via GitHub Actions (configurada em código)

O workflow `.github/workflows/cloudflare-pages.yml` foi acrescentado para
compilar e testar o projeto e publicar a pasta `dist` no **projeto Pages existente**
`ssr-connect` após cada push em `main`. Ele não cria outro projeto, não altera
o Supabase nem desativa a publicação separada do GitHub Pages.

**Para ativá-lo, ainda é necessário cadastrar duas credenciais no repositório:**

1. Em Cloudflare, crie um API token com permissão de editar Cloudflare Pages
   para a conta que contém o projeto `ssr-connect`. Não inclua esse token no código.
2. No GitHub, abra Settings > Secrets and variables > Actions > New repository secret
   e salve o token como `CLOUDFLARE_API_TOKEN`.
3. Na mesma área, salve o identificador da conta Cloudflare como
   `CLOUDFLARE_ACCOUNT_ID`. Ele consta no painel da conta Cloudflare.
4. Abra Actions > Publicar SSR-CONNECT no Cloudflare Pages > Run workflow
   para publicar a versão atual sem precisar criar um novo commit.

O workflow informa erro explícito quando faltar alguma credencial: um build
com sucesso, sozinho, **não confirma que o Cloudflare foi atualizado**.
