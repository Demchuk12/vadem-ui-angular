import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('popover', () => {
  test('focus moves in on open and back to the trigger on Escape', async ({ page }) => {
    await openGallery(page, 'popover');
    const trigger = page.getByRole('button', { name: 'Поділитися' });
    await trigger.click();
    const panel = page.getByRole('dialog', { name: 'Поділитися проєктом' });
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel.getByRole('button', { name: 'Копіювати' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking outside closes it; the trigger toggles it', async ({ page }) => {
    await openGallery(page, 'popover');
    const trigger = page.getByRole('button', { name: /Фільтри/ });
    const panel = page.getByRole('dialog', { name: 'Фільтри статусу' });
    await trigger.click();
    await expect(panel).toBeVisible();
    await trigger.click();
    await expect(panel).toBeHidden();
    await trigger.click();
    await page.mouse.click(5, 300);
    await expect(panel).toBeHidden();
  });

  test('stays inside the viewport near an edge (flips)', async ({ page }) => {
    await openGallery(page, 'popover');
    await page.setViewportSize({ width: 700, height: 900 });
    await page.getByRole('button', { name: 'end', exact: true }).click();
    const panel = page.getByRole('dialog', { name: 'Popover end' });
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(700);
  });
});

test.describe('accordion', () => {
  test('exclusive group keeps one item open; the summary is keyboard operable', async ({
    page,
  }) => {
    await openGallery(page, 'accordion');
    const first = page.locator('details', { hasText: 'Як змінити тарифний план?' });
    const second = page.locator('details', { hasText: 'Чи можна платити в гривнях?' });
    await expect(first).toHaveAttribute('open', '');
    await second.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('open', '');
    await expect(first).not.toHaveAttribute('open');
  });

  test('two-way open follows native toggles', async ({ page }) => {
    await openGallery(page, 'accordion');
    await page.locator('summary', { hasText: 'Оплата' }).click();
    await expect(page.getByText('billing open: true')).toBeVisible();
  });
});

test.describe('breadcrumbs', () => {
  test('current page is marked and not a link', async ({ page }) => {
    await openGallery(page, 'breadcrumbs');
    const nav = page.getByRole('navigation', { name: 'Ланцюжок: налаштування проєкту' });
    await expect(nav.getByRole('link')).toHaveCount(2);
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Налаштування');
  });
});
