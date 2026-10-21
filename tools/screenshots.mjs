// Gallery screenshots for design review: every route in dark and light, plus grayscale and
// squint (blurred) variants.
// Usage: npm run screenshots -- [route...] [--rtl] [--hue=285] [--width=1440] [--no-variants]
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.env.DEMO_URL ?? 'http://localhost:4200';
const OUT = resolve(import.meta.dirname, '..', 'screenshots');
const ALL_ROUTES = JSON.parse(
  readFileSync(resolve(import.meta.dirname, 'gallery-routes.json'), 'utf8'),
);

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const width = Number(args.find((a) => a.startsWith('--width='))?.split('=')[1] ?? 1440);
const routes = args.filter((a) => !a.startsWith('--'));
const dir = flags.has('--rtl') ? 'rtl' : 'ltr';
const hue = Number(args.find((a) => a.startsWith('--hue='))?.split('=')[1] ?? 285);
const variants = flags.has('--no-variants') ? [] : ['gray', 'squint'];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

for (const theme of ['dark', 'light']) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await context.addInitScript(
    ([t, d, h]) =>
      localStorage.setItem(
        'vadem-demo-prefs',
        JSON.stringify({ theme: t, hue: h, density: 'default', dir: d }),
      ),
    [theme, dir, hue],
  );
  const page = await context.newPage();

  for (const route of routes.length ? routes : ALL_ROUTES) {
    await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const name = `${route.replaceAll('/', '-')}-${theme}${dir === 'rtl' ? '-rtl' : ''}${hue !== 285 ? '-h' + hue : ''}`;
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });

    for (const v of variants) {
      const filter = v === 'gray' ? 'grayscale(1)' : 'blur(4px)';
      const handle = await page.addStyleTag({ content: `html { filter: ${filter}; }` });
      await page.screenshot({ path: `${OUT}/${name}-${v}.png`, fullPage: true });
      await handle.evaluate((el) => el.remove());
    }
    console.log(`✓ ${name}`);
  }
  await context.close();
}

await browser.close();
