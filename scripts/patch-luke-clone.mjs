/**
 * Patches copied lukebaffait files: prism colors + Taegeon Park content
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const cssFiles = ['styles/index.css', 'styles/works.css', 'styles/info.css', 'styles/contact.css'];
const jsFiles = ['js/index.js', 'js/works.js'];

const prismRoot = `:root {
  --prism-accent: #a78bfa;
  --prism-hot: #22d3ee;
  --prism-pink: #ff6ec7;
  --prism-green: #4ade80;
  --prism-gradient: linear-gradient(135deg, #ff6ec7 0%, #7873f5 25%, #22d3ee 50%, #4ade80 75%, #fbbf24 100%);
  --prism-gradient-soft: linear-gradient(135deg, rgba(255,110,199,0.9), rgba(120,115,245,0.85), rgba(34,211,238,0.9));
}\n\n`;

const colorMap = [
  ['#ff1e00', 'var(--prism-hot)'],
  ['#ff3b14', 'var(--prism-pink)'],
  ['#FF1E00', 'var(--prism-hot)'],
  ['#FF3B14', 'var(--prism-pink)'],
];

for (const rel of cssFiles) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) continue;
  let css = fs.readFileSync(p, 'utf8');
  if (!css.startsWith(':root')) css = prismRoot + css;
  for (const [from, to] of colorMap) css = css.split(from).join(to);
  css = css.replace(
    /\.t-panel-red\s*\{[^}]*background:[^;]+;/,
    '.t-panel-red {\n  position: absolute;\n  inset: 0;\n  background: var(--prism-gradient-soft);\n  transform: translateY(100%);\n  will-change: transform;',
  );
  fs.writeFileSync(p, css);
}

for (const rel of jsFiles) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) continue;
  let js = fs.readFileSync(p, 'utf8');
  for (const [from, to] of colorMap) js = js.split(from).join(to);
  js = js.replace(
    /html \+= '<span style="color:#0a0a0a;background:var\(--prism-pink\)">' \+ esc\(ch\) \+ '<\/span>';/,
    "html += '<span style=\"color:#050508;background:var(--prism-gradient)\">' + esc(ch) + '</span>';",
  );
  fs.writeFileSync(p, js);
}

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html
  .replace(/Luke Baffait, Creative Developer/g, 'Taegeon Park, Creative Developer')
  .replace(/Luke Baffait/g, 'Taegeon Park')
  .replace(/lukebaffait@yahoo\.com/g, 'taegeonpark97@gmail.com')
  .replace(/https:\/\/github\.com\/SkyNigh1/g, 'https://github.com/Ponezzo')
  .replace(/#preloader-luke">uke/g, '#preloader-luke">aegeon')
  .replace(/#preloader-baffait"> Baffait/g, '#preloader-baffait"> Park')
  .replace(
    '<script defer src="js/core-renderer.js"></script>\n  <script defer src="js/hero-project.js"></script>',
    '<script defer src="js/vendor/three.min.js"></script>\n  <script defer src="js/prism-renderer.js"></script>',
  )
  .replace(
    'Basically, I make websites.',
    'Basically, I build product experiences.',
  );
fs.writeFileSync(path.join(root, 'index.html'), html);

console.log('Patched CSS/JS/HTML for prism theme');
