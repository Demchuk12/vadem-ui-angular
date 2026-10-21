import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('tooltip', () => {
  test('icon buttons are labelled by their tooltip; text buttons described', async ({ page }) => {
    await openGallery(page, 'tooltip');
    await expect(page.getByRole('button', { name: 'Пошук (Ctrl + K)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Експорт' })).toHaveAccessibleDescription(
      /Експорт усіх рядків/,
    );
  });

  test('keyboard focus shows it immediately; Escape hides it and keeps focus', async ({ page }) => {
    await openGallery(page, 'tooltip');
    const btn = page.getByRole('button', { name: 'end' });
    await page.getByRole('button', { name: 'start' }).focus();
    await page.keyboard.press('Tab');
    const tip = page.getByRole('tooltip', { name: 'В кінці рядка' });
    await expect(tip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
    await expect(btn).toBeFocused();
  });

  test('hover shows after the delay and stays while hovering the tooltip', async ({ page }) => {
    await openGallery(page, 'tooltip');
    const btn = page.getByRole('button', { name: 'top', exact: true });
    await btn.hover();
    const tip = page.getByRole('tooltip', { name: 'Зверху' });
    await expect(tip).toBeHidden({ timeout: 300 });
    await expect(tip).toBeVisible();
    await tip.hover();
    await page.waitForTimeout(400);
    await expect(tip).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden();
  });

  test('sits above its trigger and flips when there is no room', async ({ page }) => {
    await openGallery(page, 'tooltip');
    const btn = page.getByRole('button', { name: 'top', exact: true });
    const tip = page.getByRole('tooltip', { name: 'Зверху' });
    const show = async () => {
      await page.mouse.move(0, 0);
      await btn.hover();
      await expect(tip).toBeVisible();
      return [(await tip.boundingBox())!, (await btn.boundingBox())!] as const;
    };

    await btn.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const [t, b] = await show();
    expect(t.y + t.height).toBeLessThanOrEqual(b.y);

    // Trigger at the very top of the viewport: no room above, so it flips below.
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden();
    // Make the page tall enough that the trigger can really reach the top edge.
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.blockSize = '200vh';
      document.body.append(spacer);
    });
    // The sticky header would cover the trigger and make Playwright re-scroll it.
    await page.addStyleTag({ content: '.demo-header { position: static !important; }' });
    await btn.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().top - 2));
    const [t2, b2] = await show();
    expect(t2.y).toBeGreaterThanOrEqual(b2.y + b2.height - 1);
  });

  test('works inside a modal dialog', async ({ page }) => {
    await openGallery(page, 'tooltip');
    await page.getByRole('button', { name: 'Тултип у діалозі' }).click();
    const help = page.getByRole('dialog').getByRole('button', { name: 'Довідка' });
    await help.hover();
    await expect(page.getByRole('tooltip', { name: 'Довідка' })).toBeVisible();
  });
});
