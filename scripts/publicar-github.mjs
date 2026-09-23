/** Envia o projeto COMPLETO para o repositório existente sem apagar sua história. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = 'https://github.com/xxjoaohenrique-ai/ssr-connect.git';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIR = new Set(['.git', 'node_modules', 'dist', 'dist-ssr', '.vite', '.idea']);
const isPrivate = (name) => name === '.env' || (name.startsWith('.env.') && name !== '.env.example') || name.endsWith('.local');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} falhou (código ${result.status}).`);
}
function copyProject(src, dest, relative = '') {
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP_DIR.has(entry.name) || isPrivate(entry.name) || entry.name.endsWith('.zip')) continue;
    const next = path.join(relative, entry.name);
    if (entry.isSymbolicLink()) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      count += copyProject(from, to, next);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      count++;
    }
  }
  return count;
}

const essentials = [
  'package.json', 'package-lock.json', 'src/App.jsx', 'src/api/ssrClient.js',
  'supabase/migrations/202609220001_ssr_connect.sql',
  'supabase/functions/portalApi/index.ts',
  'supabase/functions/adminApi/index.ts',
  'supabase/functions/ssrApi/index.ts',
];
for (const file of essentials) {
  if (!fs.existsSync(path.join(ROOT, file))) throw new Error(`O ZIP está incompleto: falta ${file}.`);
}

if (process.argv.includes('--check')) {
  const count = copyProject(ROOT, fs.mkdtempSync(path.join(os.tmpdir(), 'ssr-check-')));
  console.log(`Pacote do SSR-CONNECT: ${count} arquivos para enviar; 8 arquivos essenciais encontrados.`);
  process.exit(0);
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'ssr-github-'));
const checkout = path.join(work, 'repositorio');
// O argumento opcional é para validação LOCAL e não é usado pelo BAT do Windows.
const remoteArg = process.argv.indexOf('--test-remote');
const remote = remoteArg >= 0 ? process.argv[remoteArg + 1] : REPO;
if (!remote) throw new Error('Remote de teste ausente.');
console.log('Clonando o repositório SSR-CONNECT existente...');
run('git', ['clone', '--branch', 'main', '--single-branch', remote, checkout]);
const count = copyProject(ROOT, checkout);
console.log(`Copiados ${count} arquivos do projeto para o clone. Os arquivos existentes do GitHub foram preservados.`);
run('git', ['-C', checkout, 'add', '--all']);
const status = spawnSync('git', ['-C', checkout, 'diff', '--cached', '--quiet']);
if (status.status === 0) { console.log('Repositório já atualizado; não há alterações para enviar.'); process.exit(0); }
if (status.status !== 1) throw new Error('Não foi possível conferir as mudanças Git.');
run('git', ['-C', checkout, 'commit', '-m', 'Enviar codigo completo do SSR-CONNECT independente']);
run('git', ['-C', checkout, 'push', 'origin', 'main']);
console.log('ENVIO CONCLUÍDO: ' + REPO.replace(/\.git$/, ''));
