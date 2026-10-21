import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

const MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';

test.describe('on macOS', () => {
  test.use({ userAgent: MAC_UA });

  test('auto platform shows symbols with spoken names', async ({ page }) => {
    await openGallery(page, 'kbd');
    const auto = page.locator('.demo-section__head vd-kbd .vd-kbd');
    await expect(auto).toHaveAttribute('data-platform', 'apple');
    await expect(auto.locator('[aria-hidden="true"]').first()).toHaveText('⌘');
    await expect(auto.locator('.vd-visually-hidden').first()).toHaveText('Command');
    await expect(auto.locator('.vd-kbd__plus')).toBeHidden();
  });

  test('app frame search advertises the shortcut and Cmd+K focuses it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openGallery(page, 'screens/dashboard');
    const search = page.getByRole('searchbox', { name: 'Пошук' });
    await expect(search).toHaveAttribute('aria-keyshortcuts', 'Control+K Meta+K');
    await expect(page.locator('.frame__search .vd-kbd > kbd [aria-hidden="true"]')).toHaveText('⌘');
    await page.keyboard.press('Meta+K');
    await expect(search).toBeFocused();
  });
});

test('other platforms show names with separators; sequences say "then"', async ({ page }) => {
  await openGallery(page, 'kbd');
  const auto = page.locator('.demo-section__head vd-kbd .vd-kbd');
  await expect(auto).toHaveAttribute('data-platform', 'other');
  await expect(auto.locator(':scope > kbd')).toHaveCount(2);
  await expect(auto.locator('.vd-kbd__plus')).toBeVisible();
  const sequence = page.locator('.demo-kbd-context vd-kbd[keys="G D"]');
  await expect(sequence.locator('.vd-kbd__then')).toContainText('потім');
  // Shortcuts keep left-to-right order inside RTL text.
  await expect(page.locator('[dir=rtl] .vd-kbd')).toHaveCSS('direction', 'ltr');
});

for (const theme of ['dark', 'light'] as const) {
  test(`axe (${theme})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openGallery(page, 'kbd', theme);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
}
