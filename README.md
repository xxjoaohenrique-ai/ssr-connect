# SSR-CONNECT

Portal do CETI Sebastião Soares Ribeiro, feito com React/Vite, Supabase Auth e Supabase Edge Functions.

## Publicação

O endereço principal é [ssr-connect.pages.dev](https://ssr-connect.pages.dev). O workflow `.github/workflows/cloudflare-pages.yml` compila e publica no Cloudflare Pages quando há push em `main`. O workflow personalizado de GitHub Pages foi limitado a execução manual, mas o GitHub ainda iniciou o workflow gerenciado `pages build and deployment` após o merge de 13/10/2026. Isso indica que a publicação por branch ainda está ativa nas configurações de Pages do repositório; a alteração do arquivo do workflow não a desativa. O Cloudflare continua sendo a hospedagem principal.

O build do Cloudflare usa `.env.production` para a URL do Supabase e a chave publicável. Chaves publishable/anon são destinadas ao navegador. Nunca coloque `SUPABASE_SERVICE_ROLE_KEY`, `PORTAL_TOKEN_SECRET` ou senhas em arquivos `VITE_*` ou no repositório.

Para rodar localmente:

```bash
npm ci
npm run dev
```

Para validar antes de publicar:

```bash
npm test
npm run build
```

O deploy automático do Cloudflare também executa testes e build. Consulte [CONFIGURAR_CLOUDFLARE.md](CONFIGURAR_CLOUDFLARE.md) para detalhes das credenciais e da hospedagem.

## Estrutura

- `src/`: páginas, portal escolar, painel administrativo e componentes.
- `src/api/ssrClient.js`: comunicação com Supabase Auth e as funções Edge.
- `supabase/functions/ssrApi`: leitura pública filtrada, depoimentos e upload da equipe.
- `supabase/functions/adminApi`: operações administrativas autenticadas.
- `supabase/functions/portalApi`: autenticação e dados de alunos, professores e responsáveis.
- `supabase/migrations/`: estrutura do banco e políticas.
- `scripts/`: importação e exportação de dados e criação inicial de administrador.

## Situação conhecida

- Os registros e contas antigos do Base44 precisam ser exportados, importados e conferidos; o código do site não migra esses dados automaticamente.
- O importador não transfere usuários da autenticação nativa do Base44.
- A extração automática de nomes de PDFs e a consulta remota de IA não estão configuradas; a interface usa entrada manual e conhecimento local.
- Antes desta atualização, os últimos workflows bem-sucedidos visíveis no GitHub eram de 24/09/2026. Isso confirma build e publicação naquela data, não uma verificação ao vivo atual.
- A verificação visual das páginas e um teste integrado com dados reais ainda precisam ser feitos.

## Segurança

As operações privilegiadas passam pelas Edge Functions, que validam tokens e papéis no servidor. A tabela usa RLS sem acesso direto de `anon` e `authenticated`. O bucket `ssr-public` é público: use-o somente para arquivos que podem ser vistos por qualquer pessoa. Não envie documentos pessoais ou listas de alunos para esse bucket.
