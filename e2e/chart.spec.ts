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
