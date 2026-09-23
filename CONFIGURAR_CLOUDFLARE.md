> **Atualização 23/09/2026:** site publicado em https://ssr-connect.pages.dev, funções Supabase e segredo de sessão configurados. Código completo enviado ao GitHub e conta administrativa provisionada. Os registros antigos ainda precisam de exportação/importação. Consulte [STATUS_IMPLANTACAO.md](STATUS_IMPLANTACAO.md); as etapas e os status antigos abaixo são históricos.

# Publicar SSR-CONNECT (sem mexer no Base44)

Estado confirmado: projeto Supabase `gczbmneklbmiitsgjvbm` criado na região São Paulo, tabela `ssr_records` e bucket `ssr-public` criados. O banco está **vazio** e as funções **não foram implantadas**. O repositório GitHub havia recebido somente alguns arquivos; execute o BAT para completar todos os 178 arquivos antes de conectar a hospedagem.

## 1. Corrigir o repositório incompleto

Extraia **todo** este ZIP no Windows, mantendo a estrutura de pastas. Tenha Git e Node.js 22+ instalados. Execute `PUBLICAR_NO_GITHUB.bat`. O script clona o repositório **existente**, copia todo o projeto, preserva as mudanças remotas não incluídas no ZIP (incluindo `.github/workflows`) e faz `git push` em `main` sem `--force`.

Confira no GitHub se estes caminhos existem:
- `src/App.jsx`
- `src/api/ssrClient.js`
- `supabase/functions/portalApi/index.ts`
- `supabase/functions/adminApi/index.ts`
- `supabase/functions/ssrApi/index.ts`
- `supabase/migrations/202609220001_ssr_connect.sql`

## 2. Backend Supabase

Projeto: https://supabase.com/dashboard/project/gczbmneklbmiitsgjvbm
O SQL de `supabase/migrations/202609220001_ssr_connect.sql` **já foi executado** neste projeto. NÃO execute no projeto de outro aplicativo.

Configure no painel **Edge Function Secrets** uma variável `PORTAL_TOKEN_SECRET` aleatória de pelo menos 32 bytes, mantida em segredo. `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são variáveis padrão das funções hospedadas; não copie chave secreta para o frontend ou GitHub.

Com Supabase CLI autenticado (verifique `npx supabase --help`), execute **na pasta extraída**:

```bash
npx supabase login
npx supabase link --project-ref gczbmneklbmiitsgjvbm
npx supabase functions deploy portalApi
npx supabase functions deploy adminApi
npx supabase functions deploy ssrApi
```

A configuração `supabase/config.toml` desabilita a verificação automática de JWT porque cada endpoint verifica os próprios tokens e permissões. Antes de publicar para usuários reais, faça os testes de autenticação e autorização de cada endpoint.

## 3. Cloudflare Pages (somente depois de completar e testar backend)

Entre em Cloudflare > Workers & Pages > Create application > Pages > Import existing Git repository e selecione **xxjoaohenrique-ai/ssr-connect**.

- Branch de produção: `main`
- Framework: Vite / React
- Comando de compilação: `npm ci && npm run build`
- Diretório de saída: `dist`
- Root directory: `/` (raiz do repositório)
- Variáveis (produção E preview): `VITE_SUPABASE_URL=https://gczbmneklbmiitsgjvbm.supabase.co` e `VITE_SUPABASE_ANON_KEY=<chave publicável do NOVO projeto>`.

Após receber o endereço `*.pages.dev`, configure Supabase Authentication > URL Configuration, URL principal e redirecionamento HTTPS para o novo endereço. Faça testes do portal e do painel antes de divulgar. Não desligue o Base44 até que os registros e mídias antigos sejam importados e conferidos. O ZIP exportado do Base44 só incluía código; **não contém alunos, senhas antigas, professores nem dados salvos**.

### Recursos ainda não substituídos
- Extração de PDF por IA e respostas remotas do chatbot do Base44 estão desabilitadas.
- O primeiro administrador requer importação das contas antigas ou provisionamento seguro por `scripts/seed-admin.mjs` com dados criados por você, após implantar as funções.
