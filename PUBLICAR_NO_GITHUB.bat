@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo.
echo SSR-CONNECT - Enviar arquivos para o GitHub

echo Destino: https://github.com/xxjoaohenrique-ai/ssr-connect

echo.
where git >nul 2>&1
if errorlevel 1 (
  echo ERRO: Git nao encontrado. Instale Git for Windows em https://git-scm.com/downloads/win
  pause
  exit /b 1
)
if not exist ".git" (
  git init -b main
  if errorlevel 1 goto :erro
)
git branch -M main
if errorlevel 1 goto :erro
for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "REMOTE_ORIGIN=%%u"
if defined REMOTE_ORIGIN (
  if /I not "%REMOTE_ORIGIN%"=="https://github.com/xxjoaohenrique-ai/ssr-connect.git" (
    if /I not "%REMOTE_ORIGIN%"=="https://github.com/xxjoaohenrique-ai/ssr-connect" (
      echo ERRO: A pasta ja aponta para outro repositorio: %REMOTE_ORIGIN%
      echo Nenhum arquivo foi enviado. Corrija manualmente a origem.
      pause
      exit /b 1
    )
  )
) else (
  git remote add origin https://github.com/xxjoaohenrique-ai/ssr-connect.git
  if errorlevel 1 goto :erro
)
echo.
echo Preparando os arquivos... arquivos .env e credenciais locais sao ignorados.
git add -A
if errorlevel 1 goto :erro
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Adicionar codigo independente do SSR-CONNECT"
  if errorlevel 1 (
    echo ERRO ao criar commit. Configure nome e email do Git em sua maquina.
    goto :erro
  )
)
echo.
echo Enviando para o GitHub. O Git pode solicitar login no navegador.
git push -u origin main
if errorlevel 1 goto :erro
echo.
echo CONCLUIDO: https://github.com/xxjoaohenrique-ai/ssr-connect
echo O codigo no GitHub nao significa que o app ja esta hospedado ou com banco configurado.
pause
exit /b 0
:erro
echo.
echo Nao foi possivel concluir o envio. Confira a mensagem de erro acima.
pause
exit /b 1
