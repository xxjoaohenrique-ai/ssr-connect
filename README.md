# SSR-CONNECT

Portal do CETI Sebastião Soares Ribeiro, feito com React/Vite, Supabase Auth e Supabase Edge Functions.

## Publicação

O endereço principal é [ssr-connect.pages.dev](https://ssr-connect.pages.dev). O workflow `.github/workflows/cloudflare-pages.yml` compila e publica no Cloudflare Pages quando há push em `main`. O endereço secundário [xxjoaohenrique-ai.github.io/ssr-connect](https://xxjoaohenrique-ai.github.io/ssr-connect/) usa `.github/workflows/pages.yml` para publicar o build React na subpasta `/ssr-connect/`, também a cada push em `main`. Em Settings > Pages, a origem deve ser **GitHub Actions**. Publicar diretamente os arquivos da branch expõe `/src/main.jsx` sem compilação e impede a aplicação de iniciar.

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

- Na revisão de 13/10/2026, a URL do Supabase em `.env.production` falhou com `ENOTFOUND`. É necessário confirmar se o projeto existe/está ativo e ajustar a configuração pública antes de validar dados e login em produção.
- A conta do administrador usa `AdminAccount`, independente do Supabase Auth e de contas Google. O fluxo `/forgot-password` não redefine essa conta. O e-mail deve ser consultado por um operador autorizado no banco; a senha existente não é recuperável a partir do hash. Um administrador com acesso pode redefinir a senha no painel.
- A revisão atual executou sete testes, lint, verificação de tipos e build. Após atualizar Tailwind para 4.3.3 e React Router para 7.18.4, `npm audit` não encontrou vulnerabilidades conhecidas. A página inicial foi conferida em celular e desktop e `/admin` redirecionou para login sem sessão. O teste integrado do backend ficou impedido pelo DNS.
- A interface agora exige navegadores compatíveis com Tailwind 4: Chrome 111+, Safari 16.4+ ou Firefox 128+.
- O contato abre o aplicativo de e-mail com a mensagem preenchida; o usuário precisa concluir o envio nesse aplicativo.

- Os registros e contas antigos do Base44 precisam ser exportados, importados e conferidos; o código do site não migra esses dados automaticamente.
- O importador não transfere usuários da autenticação nativa do Base44.
- A extração automática de nomes de PDFs e a consulta remota de IA não estão configuradas; a interface usa entrada manual e conhecimento local.
- Antes desta atualização, os últimos workflows bem-sucedidos visíveis no GitHub eram de 24/09/2026. Isso confirma build e publicação naquela data, não uma verificação ao vivo atual.
- A verificação visual das páginas e um teste integrado com dados reais ainda precisam ser feitos.

## Segurança

As operações privilegiadas passam pelas Edge Functions, que validam tokens e papéis no servidor. A tabela usa RLS sem acesso direto de `anon` e `authenticated`. O bucket `ssr-public` é público: use-o somente para arquivos que podem ser vistos por qualquer pessoa. Não envie documentos pessoais ou listas de alunos para esse bucket.
