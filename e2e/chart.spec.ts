import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { openGallery } from './fixtures';

const chart = (page: Page, title: string) =>
  page
    .locator('vd-bar-chart, vd-line-chart')
    .filter({ has: page.getByText(title, { exact: true }) });

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('one tab stop per chart; arrows explore categories with a tooltip and spoken values', async ({
  page,
}) => {
  await openGallery(page, 'chart');
  const lines = chart(page, 'Час відповіді за регіонами');
  const hits = lines.locator('.vd-chart__hit');
  await expect(hits.first()).toHaveAttribute('tabindex', '0');
  await expect(lines.locator('.vd-chart__hit[tabindex="0"]')).toHaveCount(1);
  await hits.first().focus();
  await expect(lines.locator('.vd-chart__tooltip')).toBeVisible();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  const focused = lines.locator('.vd-chart__hit:focus');
  await expect(focused).toHaveAttribute(
    'aria-label',
    'Т5: Київ 160 мс, Варшава —, Франкфурт 225 мс',
  );
  await expect(lines.locator('.vd-chart__tooltip')).toContainText('225 мс');
  await page.keyboard.press('End');
  await expect(lines.locator('.vd-chart__hit:focus')).toHaveAttribute('data-index', '11');
  await page.keyboard.press('Tab');
  await expect(lines.locator('.vd-chart__tooltip')).toHaveCount(0);
});

test('hover shows the nearest category; leaving hides it', async ({ page }) => {
  await openGallery(page, 'chart');
  const bars = chart(page, 'Запити до API');
  const svg = (await bars.locator('svg').boundingBox())!;
  await page.mouse.move(svg.x + svg.width * 0.55, svg.y + svg.height / 2);
  await expect(bars.locator('.vd-chart__tooltip')).toContainText('Чт');
  await expect(bars.locator('.vd-chart__band')).toBeVisible();
  await page.mouse.move(svg.x + svg.width / 2, svg.y - 80);
  await expect(bars.locator('.vd-chart__tooltip')).toHaveCount(0);
});

test('the data table is the accessible twin of the chart', async ({ page }) => {
  await openGallery(page, 'chart');
  const stacked = chart(page, 'Витрати на хмару');
  const toggle = stacked.getByRole('button', { name: 'Data table' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  const table = stacked.getByRole('region', { name: 'Витрати на хмару' }).getByRole('table');
  await expect(table.getByRole('columnheader')).toHaveText([
    'Category',
    'Обчислення',
    'Сховище',
    'Трафік',
  ]);
  await expect(table.getByRole('row')).toHaveCount(5);
  await expect(stacked.locator('svg')).toBeHidden();
});

test('dashboard emphasises the peak day and keeps the chart keyboard reachable', async ({
  page,
}) => {
  await openGallery(page, 'screens/dashboard');
  const bars = page.locator('.dash-chart-card .vd-chart__bar');
  await expect(bars).toHaveCount(7);
  await expect(page.locator('.dash-chart-card .vd-chart__bar:not([data-muted])')).toHaveCount(1);
  await expect(page.locator('.dash-chart-card vd-bar-chart')).not.toHaveAttribute('title');
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl']) {
    test(`axe, narrow layout and RTL (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 900 });
      await openGallery(page, 'chart', theme, dir);
      const width = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(width.scroll).toBeLessThanOrEqual(width.client);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((v) => ({ id: v.id, n: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
    });
  }
}

const CHART_MOTION = /^vd-chart-(grow-block|grow-inline|draw|fade)$/;

/** Names of the chart animations the page has started so far. */
async function chartMotion(page: Page) {
  return page.evaluate(() => (window as unknown as { vdMotion: string[] }).vdMotion);
}

async function recordMotion(page: Page) {
  await page.addInitScript(() => {
    const log: string[] = [];
    Object.assign(window, { vdMotion: log });
    document.addEventListener('animationstart', (e) => {
      if (e.animationName.startsWith('vd-chart-')) log.push(e.animationName);
    });
  });
}

test('marks appear once: bars grow, lines draw, resizing stays instant', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordMotion(page);
  await openGallery(page, 'chart');
  await expect.poll(async () => (await chartMotion(page)).length).toBeGreaterThan(2);
  const names = await chartMotion(page);
  expect(names.every((name) => CHART_MOTION.test(name))).toBe(true);
  expect(new Set(names)).toContain('vd-chart-grow-block');
  expect(new Set(names)).toContain('vd-chart-draw');
  await page.waitForTimeout(600);
  const before = (await chartMotion(page)).length;
  await page.setViewportSize({ width: 800, height: 800 });
  await page.waitForTimeout(500);
  expect((await chartMotion(page)).length).toBe(before);
  // The dash is gone, so the finished line is solid.
  await expect(page.locator('.vd-chart__line').first()).toHaveCSS('stroke-dasharray', 'none');
});

test('bars grow from the zero line', async ({ page }) => {
  await openGallery(page, 'chart');
  const bars = chart(page, 'Запити до API');
  const gap = await bars.locator('.vd-chart__svg').evaluate((svg) => {
    const marks = svg.querySelector<SVGGElement>('.vd-chart__marks')!;
    const zero = parseFloat(marks.style.getPropertyValue('--vd-chart-zero'));
    const line = svg.querySelector<SVGLineElement>('.vd-chart__grid line[data-zero]')!;
    const horizontal = !!svg.closest('[data-orientation="horizontal"]');
    return Math.abs(zero - parseFloat(line.getAttribute(horizontal ? 'x1' : 'y1')!));
  });
  expect(gap).toBeLessThan(0.01);
});

test('reduced motion: nothing is animated', async ({ page }) => {
  await recordMotion(page);
  await openGallery(page, 'chart');
  await page.waitForTimeout(400);
  expect(await chartMotion(page)).toEqual([]);
});
