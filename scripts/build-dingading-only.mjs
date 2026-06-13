import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const portfolioRoot = path.dirname(scriptDir);
const workspaceRoot = path.dirname(portfolioRoot);
const configDir = path.join(scriptDir, 'project-builds/configs');
const outRoot = path.join(portfolioRoot, 'projects');

const EXCLUDED_ROUTES = [
  'api',
  'band',
  'livehouses',
  'login',
  'myband',
  'mypage',
  'sse-test',
  'test',
  'tier',
  'tier-sse-test',
];

function run(cmd, cwd, env = {}) {
  try {
    execSync(cmd, { cwd, stdio: 'inherit', shell: true, env: { ...process.env, ...env } });
  } catch (err) {
    if (cmd.startsWith('robocopy') && err.status >= 0 && err.status <= 7) return;
    throw err;
  }
}

function exists(p) {
  return fs.existsSync(p);
}

function backupFile(filePath) {
  if (!exists(filePath)) return null;
  const backup = `${filePath}.portfolio-backup`;
  fs.copyFileSync(filePath, backup);
  return backup;
}

function restoreFile(filePath, backupPath) {
  if (backupPath && exists(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    fs.unlinkSync(backupPath);
  }
}

function replaceFile(targetPath, sourcePath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

function copyBuilt(sourceDir, targetDir) {
  if (!exists(sourceDir)) throw new Error(`Build output not found: ${sourceDir}`);
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  if (exists(targetDir)) run(`cmd /c rmdir /s /q "${targetDir}"`, portfolioRoot);
  run(`robocopy "${sourceDir}" "${targetDir}" /E /NFL /NDL /NJH /NJS /nc /ns /np`, portfolioRoot);
}

const source = path.join(workspaceRoot, 'Dingading/frontend');
const appDir = path.join(source, 'src/app');
const routeBackupRoot = path.join(source, '.routes-portfolio-backup');
const nextConfig = path.join(source, 'next.config.ts');
const nextBackup = backupFile(nextConfig);
const movedRoutes = [];

replaceFile(nextConfig, path.join(configDir, 'dingading.next.config.ts'));
if (exists(routeBackupRoot)) fs.rmSync(routeBackupRoot, { recursive: true, force: true });
fs.mkdirSync(routeBackupRoot, { recursive: true });

for (const route of EXCLUDED_ROUTES) {
  const from = path.join(appDir, route);
  const to = path.join(routeBackupRoot, route);
  if (exists(from)) {
    fs.renameSync(from, to);
    movedRoutes.push(route);
  }
}

try {
  run('npm run build', source, { NEXT_PUBLIC_USE_MOCK: 'true' });
  copyBuilt(path.join(source, 'out'), path.join(outRoot, 'dingading'));
  console.log('Dingading built -> projects/dingading');
} finally {
  for (const route of movedRoutes) {
    const from = path.join(routeBackupRoot, route);
    const to = path.join(appDir, route);
    if (exists(from)) fs.renameSync(from, to);
  }
  if (exists(routeBackupRoot)) fs.rmSync(routeBackupRoot, { recursive: true, force: true });
  restoreFile(nextConfig, nextBackup);
}
