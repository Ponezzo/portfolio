import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const portfolioRoot = path.dirname(scriptDir);
const workspaceRoot = path.dirname(portfolioRoot);
const configDir = path.join(scriptDir, 'project-builds/configs');
const overlayDir = path.join(scriptDir, 'project-builds/overlays');
const outRoot = path.join(portfolioRoot, 'projects');

function run(cmd, cwd, env = {}) {
  try {
    execSync(cmd, {
      cwd,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...env },
    });
  } catch (err) {
    if (cmd.startsWith('robocopy') && err.status >= 0 && err.status <= 7) return;
    throw err;
  }
}

function exists(dir) {
  return fs.existsSync(dir);
}

function backupFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const backup = `${filePath}.portfolio-backup`;
  fs.copyFileSync(filePath, backup);
  return backup;
}

function restoreFile(filePath, backupPath) {
  if (backupPath && fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    fs.unlinkSync(backupPath);
  }
}

function replaceFile(targetPath, sourcePath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

function applyOverlayTree(overlayRoot, targetRoot, createdFiles) {
  if (!exists(overlayRoot)) return;
  for (const entry of fs.readdirSync(overlayRoot, { withFileTypes: true })) {
    const from = path.join(overlayRoot, entry.name);
    const to = path.join(targetRoot, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      applyOverlayTree(from, to, createdFiles);
    } else {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      createdFiles.push(to);
    }
  }
}

function removeCreatedFiles(files) {
  for (const file of files) {
    if (exists(file)) fs.unlinkSync(file);
  }
}

function copyBuilt(sourceDir, targetDir) {
  if (!exists(sourceDir)) {
    throw new Error(`Build output not found: ${sourceDir}`);
  }
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  if (exists(targetDir)) {
    run(`cmd /c rmdir /s /q "${targetDir}"`, portfolioRoot);
  }
  run(`robocopy "${sourceDir}" "${targetDir}" /E /NFL /NDL /NJH /NJS /nc /ns /np`, portfolioRoot);
}

function buildFlip() {
  const source = path.join(workspaceRoot, 'S12P31S110/FE');
  if (!exists(source)) {
    console.warn('[build-projects] Skip FLIP: source not found at', source);
    return false;
  }

  const backups = [];
  const files = [
    [path.join(source, 'next.config.ts'), path.join(configDir, 'flip.next.config.ts')],
    [path.join(source, 'src/app/layout.tsx'), path.join(overlayDir, 'flip/layout.tsx')],
    [path.join(source, 'src/shared/mocks/MSWProvider.tsx'), path.join(overlayDir, 'flip/MSWProvider.tsx')],
    [
      path.join(source, 'src/shared/mocks/handlers/dashboard.ts'),
      path.join(overlayDir, 'flip/handlers/dashboard.ts'),
    ],
  ];

  for (const [target, overlay] of files) {
    backups.push([target, backupFile(target)]);
    replaceFile(target, overlay);
  }

  try {
    if (!exists(path.join(source, 'node_modules'))) run('npm ci', source);
    run('npm run build', source, { NEXT_PUBLIC_USE_MOCK: 'true' });
    copyBuilt(path.join(source, 'out'), path.join(outRoot, 'flip'));
    console.log('[build-projects] FLIP built -> projects/flip');
    return true;
  } finally {
    for (const [target, backup] of backups) restoreFile(target, backup);
  }
}

function buildDingading() {
  const source = path.join(workspaceRoot, 'Dingading/frontend');
  if (!exists(source)) {
    console.warn('[build-projects] Skip Dingading: source not found at', source);
    return false;
  }

  run('node scripts/build-dingading-only.mjs', portfolioRoot);
  return exists(path.join(outRoot, 'dingading', 'main', 'index.html'));
}

function buildCinemovie() {
  const source = path.join(workspaceRoot, 'CINEMovie/vue');
  if (!exists(source)) {
    console.warn('[build-projects] Skip CINEMovie: source not found at', source);
    return false;
  }

  if (!exists(path.join(source, 'node_modules'))) run('npm ci', source);
  run('npm run build -- --base=/prism-portfolio/projects/cinemovie/', source, {
    VITE_API_BASE_URL: '',
    VITE_TMDB_API_KEY: 'portfolio-demo',
    VITE_YOUTUBE_API_KEY: 'portfolio-demo',
    VITE_GEMINI_API_KEY: 'portfolio-demo',
    VITE_GEMINI_MODEL: 'gemini-3.1-flash-lite',
  });
  copyBuilt(path.join(source, 'dist'), path.join(outRoot, 'cinemovie'));
  console.log('[build-projects] CINEMovie built -> projects/cinemovie');
  return true;
}

fs.mkdirSync(outRoot, { recursive: true });

function safeBuild(name, fn) {
  try {
    return fn();
  } catch (err) {
    console.error(`[build-projects] ${name} failed:`, err.message || err);
    return false;
  }
}

const results = [
  safeBuild('FLIP', buildFlip),
  safeBuild('Dingading', buildDingading),
  safeBuild('CINEMovie', buildCinemovie),
];
if (!results.some(Boolean)) {
  console.warn('[build-projects] No project sources found. Keeping existing projects/ output if any.');
}
