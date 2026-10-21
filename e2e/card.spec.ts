import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('card', () => {
  test('stretched link: one tab stop to the title link, inner button reachable next', async ({
    page,
  }) => {
    await openGallery(page, 'card');
    const link = page.getByRole('link', { name: 'Платформа оплат' });
    await link.focus();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'Копіювати посилання на Платформа оплат' }),
    ).toBeFocused();
  });

  test('clicking the card body follows the stretched link', async ({ page }) => {
    await openGallery(page, 'card');
    const text = page.locator('.demo-cards .vd-card').first().getByText('Платежі, рахунки');
    await text.scrollIntoViewIfNeeded();
    const box = (await text.boundingBox())!;
    // The stretched link overlays the body text by design; click where the text is.
    await page.mouse.click(box.x + 10, box.y + box.height / 2);
    await expect(page).toHaveURL(/#interactive$/);
  });

  test('inner button stays above the stretched link', async ({ page }) => {
    await openGallery(page, 'card');
    const btn = page.getByRole('button', { name: 'Копіювати посилання на Аналітика' });
    // Playwright fails the click if another element (the link overlay) intercepts it.
    await btn.click({ trial: true });
  });

  test('pointer moves set glow coordinates on interactive cards', async ({ page }) => {
    await openGallery(page, 'card');
    const card = page.locator('.demo-cards .vd-card').nth(1);
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + 40, box.y + 30);
    await expect(card).toHaveCSS('--vd-x', /^4\dpx$/);
  });

  test('loading card is busy and its skeletons are hidden from AT', async ({ page }) => {
    await openGallery(page, 'card');
    const busy = page.locator('[aria-busy=true]');
    await expect(busy).toHaveCount(1);
    await expect(busy.locator('.vd-skeleton').first()).toHaveAttribute('aria-hidden', 'true');
    await page.getByRole('button', { name: 'Показати дані' }).click();
    await expect(page.getByText('1 284')).toBeVisible();
  });
});
