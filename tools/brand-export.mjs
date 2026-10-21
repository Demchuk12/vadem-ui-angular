// Raster exports of the logo (brand/logo/README.md): square avatars, social preview, favicon.ico.
// Renders the SVG sources in Chromium (Playwright), so no image tooling is needed.
// Usage: npm run brand:export   -> brand/logo/export/
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const logo = resolve(root, 'brand/logo');
const out = resolve(logo, 'export');
mkdirSync(out, { recursive: true });

const BG = '#0F1115'; // favicon / dark brand background
const svg = (name) => readFileSync(resolve(logo, name), 'utf8');
const font = (file) => pathToFileURL(resolve(root, 'src/fonts', file)).href;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function render(name, width, height, body, transparent = false) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: 'JetBrains Mono'; src: url('${font('jetbrains-mono/jetbrains-mono-latin.woff2')}') format('woff2'); font-weight: 100 800; }
    html, body { margin: 0; width: ${width}px; height: ${height}px; background: ${transparent ? 'transparent' : BG}; }
    body { display: grid; place-items: center; }
    svg { display: block; }
  </style></head><body>${body}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ omitBackground: transparent, type: 'png' });
  if (name) writeFileSync(resolve(out, name), png);
  console.log(`✓ ${name ?? 'frame'} ${width}x${height}`);
  return png;
}

const sized = (source, width) => source.replace(/width="\d+" height="\d+"/, `width="${width}"`);

// Square avatars (npm, GitHub): dark mark centered; clear space well over one block.
for (const size of [512, 1024]) {
  await render(
    `vadem-avatar-${size}.png`,
    size,
    size,
    sized(svg('vadem-mark-dark.svg'), Math.round(size * 0.5)),
  );
}

// Social preview 1200x630: lockup + one mono line.
await render(
  'vadem-social-1200x630.png',
  1200,
  630,
  `<div style="display:grid;justify-items:center;gap:40px">
     ${sized(svg('vadem-logo-dark.svg'), 560)}
     <p style="margin:0;font:500 26px/1 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#A1A1B0">
       Angular UI library
     </p>
   </div>`,
);

// favicon.ico: 16/32/48 PNG frames from favicon.svg (it has its own background).
const frames = [];
for (const size of [16, 32, 48]) {
  frames.push({ size, png: await render(null, size, size, sized(svg('favicon.svg'), size), true) });
}
writeFileSync(resolve(out, 'favicon.ico'), ico(frames));
console.log('✓ favicon.ico 16/32/48');

await browser.close();

/** ICO container with PNG-compressed entries (supported by every current browser and OS). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2); // palette
    header.writeUInt8(0, entry + 3); // reserved
    header.writeUInt16LE(1, entry + 4); // color planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.png)]);
}
