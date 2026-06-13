import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const homePath = path.join(root, 'content/home.json');
const tokensPath = path.join(root, 'design/tokens.json');
const home = JSON.parse(fs.readFileSync(homePath, 'utf8'));

function setByPath(obj, dotPath, value) {
  const keys = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const idx = Number(k);
    if (!Number.isNaN(idx) && String(idx) === k) {
      if (!Array.isArray(cur)) throw new Error(`Expected array at ${keys.slice(0, i).join('.')}`);
      cur = cur[idx];
    } else {
      cur[k] = cur[k] ?? {};
      cur = cur[k];
    }
  }
  const last = keys[keys.length - 1];
  const lastIdx = Number(last);
  if (!Number.isNaN(lastIdx) && String(lastIdx) === last) {
    cur[lastIdx] = value;
  } else {
    cur[last] = value;
  }
}

function syncTokensColors(colors) {
  if (!fs.existsSync(tokensPath)) return;
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  tokens.color.bg = colors.prismBg ?? tokens.color.bg;
  tokens.color.text = colors.textPrimary ?? tokens.color.text;
  tokens.color.accent = colors.prismCyan ?? tokens.color.accent;
  tokens.color.accentHot = colors.prismCyan ?? tokens.color.accentHot;
  tokens.color.accentPink = colors.prismMagenta ?? tokens.color.accentPink;
  tokens.color.accentYellow = colors.prismYellow ?? tokens.color.accentYellow;
  tokens.gradient.prism = `linear-gradient(135deg, ${colors.prismMagenta} 0%, ${colors.prismCyan} 45%, ${colors.prismYellow} 100%)`;
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2) + '\n');
}

function buildPrismRootCss(colors) {
  return `:root {
  --prism-cyan: ${colors.prismCyan};
  --prism-magenta: ${colors.prismMagenta};
  --prism-yellow: ${colors.prismYellow};
  --prism-bg: ${colors.prismBg};
  --prism-text-primary: ${colors.textPrimary};
  --prism-text-muted: ${colors.textMuted};
}
`;
}

const jsOut = `/* AUTO-GENERATED from content/home.json */
window.__HOME__ = ${JSON.stringify(home, null, 2)};
`;

fs.writeFileSync(path.join(root, 'styles/home-colors.css'), buildPrismRootCss(home.colors));
fs.writeFileSync(path.join(root, 'js/home-generated.js'), jsOut);

syncTokensColors(home.colors);

console.log('Generated styles/home-colors.css');
console.log('Generated js/home-generated.js');
console.log('Synced design/tokens.json colors from home.json');

export { setByPath, homePath };
