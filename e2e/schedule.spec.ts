import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openGallery } from './fixtures';

const schedule = (page: Page) => page.locator('vd-schedule').first();
const last = (page: Page) => page.getByTestId('schedule-last');
const view = (page: Page, name: string) =>
  schedule(page).getByRole('button', { name, exact: true }).click();

/** Drags with the mouse from the centre of `from` by (dx, dy) pixels. */
async function drag(page: Page, from: Locator, dx: number, dy: number, offsetY?: number) {
  await from.scrollIntoViewIfNeeded();
  const box = (await from.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + (offsetY ?? box.height / 2);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 10 });
  return { x: x + dx, y: y + dy };
}

test.describe('schedule', () => {
  test('switches views, steps between periods and returns to today', async ({ page }) => {
    await openGallery(page, 'schedule');
    const title = schedule(page).locator('.vd-schedule__title');
    await expect(schedule(page).getByRole('button', { name: 'Week' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(title).toContainText('19');
    await view(page, 'Month');
    await expect(title).toHaveText(/жовтень 2026/i);
    await schedule(page).getByRole('button', { name: 'Next period' }).click();
    await expect(title).toHaveText(/листопад 2026/i);
    await schedule(page).getByRole('button', { name: 'Today' }).click();
    await expect(title).toHaveText(/жовтень 2026/i);
    await view(page, 'Agenda');
    await expect(schedule(page).locator('.vd-schedule__agenda-day').first()).toContainText(
      '21 жовтня',
    );
  });

  test('month: arrows move between days, PageDown changes month, a day opens the day view', async ({
    page,
  }) => {
    await openGallery(page, 'schedule');
    await view(page, 'Month');
    const today = schedule(page).locator('.vd-schedule__day[aria-current="date"]');
    await today.focus();
    await expect(today).toHaveAttribute('tabindex', '0');
    await page.keyboard.press('ArrowRight');
    await expect(
      schedule(page).locator('[data-date="2026-10-22"] .vd-schedule__day'),
    ).toBeFocused();
    await page.keyboard.press('PageDown');
    await expect(schedule(page).locator('.vd-schedule__title')).toHaveText(/листопад/i);
    await expect(
      schedule(page).locator('[data-date="2026-11-22"] .vd-schedule__day'),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(schedule(page).getByRole('button', { name: 'Day', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('activating an event and clicking empty time emit requests', async ({ page }) => {
    await openGallery(page, 'schedule');
    await schedule(page)
      .getByRole('button', { name: /^Ретро,/ })
      .click();
    await expect(last(page)).toHaveText('Відкрито: Ретро');
    const column = schedule(page).locator('.vd-schedule__column[data-date="2026-10-23"]');
    const box = (await column.boundingBox())!;
    const hour = box.height / 24;
    await column.scrollIntoViewIfNeeded();
    const b = (await column.boundingBox())!;
    await page.mouse.click(b.x + b.width / 2, b.y + hour * 15 + hour / 4);
    await expect(last(page)).toHaveText('Створено: 2026-10-23T15:00');
  });

  test('week: dragging moves an event in 30-minute steps; Escape cancels', async ({ page }) => {
    await openGallery(page, 'schedule');
    const lunch = schedule(page).getByRole('button', { name: /^Обід з командою,/ });
    const grid = schedule(page).locator('.vd-schedule__grid');
    const hour = (await grid.boundingBox())!.height / 24;

    await drag(page, lunch, 0, hour);
    await expect(schedule(page).locator('.vd-schedule__preview')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect(schedule(page).locator('.vd-schedule__preview')).toHaveCount(0);
    await expect(last(page)).toHaveText('Ще нічого не сталося');

    await drag(page, lunch, 0, hour);
    await page.mouse.up();
    await expect(last(page)).toHaveText('move: e4 → 2026-10-21T14:00 – 2026-10-21T15:00');
    await expect(schedule(page).getByRole('status')).toContainText('Обід з командою');
  });

  test('week: dragging the bottom edge resizes an event', async ({ page }) => {
    await openGallery(page, 'schedule');
    const retro = schedule(page).getByRole('button', { name: /^Ретро,/ });
    const hour = (await schedule(page).locator('.vd-schedule__grid').boundingBox())!.height / 24;
    const box = (await retro.boundingBox())!;
    await drag(page, retro, 0, hour / 2, box.height - 2);
    await page.mouse.up();
    await expect(last(page)).toHaveText('resize: e8 → 2026-10-24T11:00 – 2026-10-24T12:30');
  });

  test('month: dragging a chip moves the event to another day', async ({ page }) => {
    await openGallery(page, 'schedule');
    await view(page, 'Month');
    const chip = schedule(page).getByRole('button', { name: /^Квартальний звіт,/ });
    const target = schedule(page).locator('.vd-schedule__cell[data-date="2026-10-15"]');
    const from = (await chip.boundingBox())!;
    const to = (await target.boundingBox())!;
    await drag(page, chip, to.x + to.width / 2 - (from.x + from.width / 2), 0);
    await expect(target).toHaveAttribute('data-drop-target', '');
    await page.mouse.up();
    await expect(last(page)).toHaveText('move: e13 → 2026-10-15 – 2026-10-15');
  });

  test('read-only schedules never start a drag', async ({ page }) => {
    await openGallery(page, 'schedule');
    const agenda = page.locator('vd-schedule').nth(1);
    await expect(agenda.locator('.vd-schedule__agenda')).toBeVisible();
    await expect(agenda.locator('.vd-schedule__resize')).toHaveCount(0);
  });

  test('narrow month shows day dots instead of chips', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openGallery(page, 'schedule');
    await view(page, 'Month');
    await expect(schedule(page).locator('.vd-schedule__chips').first()).toBeHidden();
    await expect(
      schedule(page).locator('[data-date="2026-10-21"] .vd-schedule__dot'),
    ).toBeVisible();
  });

  for (const name of ['Month', 'Week', 'Day', 'Agenda']) {
    test(`axe: ${name} view`, async ({ page }) => {
      await openGallery(page, 'schedule');
      await view(page, name);
      const results = await new AxeBuilder({ page }).include('vd-schedule').analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
