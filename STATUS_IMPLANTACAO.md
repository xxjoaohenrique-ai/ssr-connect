# SSR-CONNECT — estado verificado no repositório

Atualizado em 13/10/2026 com base nos arquivos e execuções visíveis no GitHub. Esta página registra o estado do código; não substitui uma checagem ao vivo dos serviços.

## Hospedagem

- Endereço principal definido no projeto: https://ssr-connect.pages.dev
- Publicação automática: Cloudflare Pages via `.github/workflows/cloudflare-pages.yml`, em pushes para `main`.
- O workflow personalizado de GitHub Pages agora é manual, mas o workflow gerenciado `pages build and deployment` ainda iniciou após o merge de 13/10/2026. Isso indica que as configurações de Pages do repositório continuam publicando automaticamente a partir de branch; o arquivo de workflow não altera essa configuração.
- Em 13/10/2026, os testes, o build do Cloudflare, a publicação do Cloudflare e o workflow gerenciado de Pages concluíram com sucesso. Isso confirma os jobs, não uma inspeção visual das páginas ao vivo.

## Aplicação e backend

O repositório contém o frontend React/Vite, as funções `ssrApi`, `adminApi` e `portalApi`, migração SQL, autenticação com tokens de sessão e configuração do Cloudflare. O registro de implantação anterior relata que funções e conta inicial de administrador foram configuradas em setembro; esse estado precisa ser confirmado no painel Supabase antes de uma manutenção que dependa dele.

## Item de hospedagem que ainda exige configuração

Para impedir uma publicação paralela no GitHub Pages, altere em Settings > Pages a fonte de publicação de branch para GitHub Actions (ou desative Pages). O conector GitHub usado nesta atualização não oferece acesso para mudar essa configuração; por isso, a publicação automática de Pages permaneceu ativa.

## Itens que ainda precisam de validação

- Exportar/importar e conferir os registros, contas e mídias que estavam no Base44. O código não contém esses dados.
- Fazer uma verificação visual atual em desktop e celular.
- Testar login de aluno, professor, responsável e administrador, além de cadastros e operações do painel, em ambiente de homologação.
- Confirmar no Cloudflare e Supabase que o deployment e as funções correspondem à versão atual.
- A extração automática de nomes de PDFs e a integração remota de IA permanecem indisponíveis conforme os adaptadores do frontend.

## Fluxo recomendado de atualização

1. Execute `npm ci`, `npm test` e `npm run build`.
2. Faça as alterações em uma branch e revise o resultado.
3. Integre à `main`; o workflow do Cloudflare executará os testes, o build e a publicação.
4. Confira o resultado do workflow e abra o endereço principal para testar a navegação e os fluxos afetados.

As chaves de serviço e `PORTAL_TOKEN_SECRET` devem ficar somente nos secrets do backend. `.env.production` deve conter apenas configuração publicável do frontend.
