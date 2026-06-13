/**
 * Fix subpage paths for GitHub Pages
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const pages = [
  { file: 'works/index.html', css: '../styles/works.css', js: 'works.js' },
];

const scriptBlock = (jsFile) => `  <script defer src="../js/i18n.js"></script>
  <script type="module" src="../js/prism-renderer.mjs"></script>
  <script defer src="../js/vendor/gsap.min.js"></script>
  <script defer src="../js/${jsFile}"></script>`;

for (const page of pages) {
  const p = path.join(root, page.file);
  let html = fs.readFileSync(p, 'utf8');
  html = html.replace(/<base href="[^"]*">\s*/g, '');
  html = html.replace(/href="index\.html"/g, 'href="../"');
  html = html.replace(/href="styles\/[^"]+"/g, `href="${page.css}"`);
  html = html.replace(/href="assets\//g, 'href="../assets/');
  html = html.replace(/src="assets\//g, 'src="../assets/');
  html = html.replace(/taegeonpark97@gmail.com/g, 'taegeonpark97@gmail.com');
  html = html.replace(/https:\/\/github\.com\/SkyNigh1/g, 'https://github.com/Ponezzo');
  html = html.replace(
    /<script defer src="js\/i18n\.js"><\/script>[\s\S]*?<script defer src="js\/[^"]+\.js"><\/script>/,
    scriptBlock(page.js),
  );
  if (page.file === 'works/index.html') {
    html = html.replace(
      /<script defer src="js\/vendor\/ScrollTrigger[^"]*"><\/script>\s*/g,
      '',
    );
  }
  fs.writeFileSync(p, html);
}

console.log('Fixed subpage paths');
