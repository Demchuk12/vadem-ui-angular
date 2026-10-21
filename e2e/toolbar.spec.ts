import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery, type Theme } from './fixtures';

async function openToolbar(page: Page, theme: Theme = 'dark') {
  await openGallery(page, 'toolbar', theme);
  await expect(page.getByRole('heading', { name: 'Toolbar', exact: true })).toBeVisible();
  await expect(page.getByRole('toolbar')).toHaveCount(7);
}

test('one Tab stop, wrapped arrows, Home/End and native action/toggle activation', async ({
  page,
}) => {
  await openToolbar(page);
  const toolbar = page.getByRole('toolbar', { name: 'Дії з документом', exact: true });
  const edit = toolbar.getByRole('button', { name: 'Редагувати', exact: true });
  const copy = toolbar.getByRole('button', { name: 'Копіювати', exact: true });
  const protect = toolbar.getByRole('button', { name: 'Захист документа', exact: true });
  await expect(toolbar.locator('[tabindex="0"]')).toHaveCount(1);
  await edit.focus();
  await edit.press('ArrowRight');
  await expect(copy).toBeFocused();
  await expect(
    page.locator('section[aria-labelledby="toolbar-document"]').getByRole('status'),
  ).toContainText('Остання дія: —');
  await copy.press('Enter');
  await expect(
    page.locator('section[aria-labelledby="toolbar-document"]').getByRole('status'),
  ).toContainText('Остання дія: Копіювання');
  await copy.press('End');
  await expect(protect).toBeFocused();
  await protect.press('Space');
  await expect(protect).toHaveAttribute('aria-pressed', 'false');
  await protect.press('ArrowRight');
  await expect(edit).toBeFocused();
  await edit.press('ArrowLeft');
  await expect(protect).toBeFocused();
  await protect.press('Home');
  await expect(edit).toBeFocused();
  await edit.press('ArrowRight');
  await copy.press('Tab');
  const outside = page.getByRole('button', {
    name: 'Перемкнути доступність копіювання',
    exact: true,
  });
  await expect(outside).toBeFocused();
  await outside.press('Shift+Tab');
  await expect(copy).toBeFocused();
});

test('focused disabled/loading/hidden/removed actions recover without stealing outside focus', async ({
  page,
}) => {
  await openToolbar(page);
  const toolbar = page.getByRole('toolbar', { name: 'Дії з документом', exact: true });
  const copy = toolbar.getByRole('button', { name: 'Копіювати', exact: true });
  const download = toolbar.getByRole('button', { name: 'Завантажити', exact: true });
  const clickWithoutMovingFocus = async (name: string) =>
    page
      .getByRole('button', { name, exact: true })
      .evaluate((el) => (el as HTMLButtonElement).click());
  await copy.focus();
  await clickWithoutMovingFocus('Перемкнути доступність копіювання');
  await expect(copy).toBeDisabled();
  await expect(download).toBeFocused();
  await clickWithoutMovingFocus('Перемкнути завантаження');
  const protect = toolbar.getByRole('button', { name: 'Захист документа', exact: true });
  await expect(protect).toBeFocused();
  await expect(download).toHaveAttribute('aria-busy', 'true');
  await protect.press('Home');
  await expect(toolbar.getByRole('button', { name: 'Редагувати', exact: true })).toBeFocused();
  await clickWithoutMovingFocus('Перемкнути доступність копіювання');
  await expect(copy).toBeEnabled();
  await copy.focus();
  await expect(copy).toBeFocused();
  await clickWithoutMovingFocus('Перемкнути кнопку копіювання');
  await expect(protect).toBeFocused();
  await clickWithoutMovingFocus('Перемкнути групу експорту');
  await expect(toolbar.getByRole('button', { name: 'Редагувати', exact: true })).toBeFocused();
  const outside = page.getByRole('button', { name: 'Перемкнути групу експорту', exact: true });
  await outside.click();
  await expect(outside).toBeFocused();
});

test('vertical axis skips disabled, separator mirrors axis and native click retains names', async ({
  page,
}) => {
  await openToolbar(page);
  const toolbar = page.getByRole('toolbar', { name: 'Інструменти перегляду', exact: true });
  await expect(toolbar).toHaveAttribute('aria-orientation', 'vertical');
  await expect(toolbar.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  const overview = toolbar.getByRole('button', { name: 'Огляд', exact: true });
  const history = toolbar.getByRole('button', { name: 'Історія', exact: true });
  await overview.focus();
  await overview.press('ArrowDown');
  await expect(history).toBeFocused();
  await history.press('ArrowUp');
  await expect(overview).toBeFocused();
  await overview.press('ArrowUp');
  await expect(toolbar.getByRole('button', { name: 'Експорт', exact: true })).toBeFocused();
  const quick = page.getByRole('toolbar', { name: 'Швидкі дії', exact: true });
  await quick.getByRole('button', { name: 'Пошук', exact: true }).click();
  await expect(
    page.locator('section[aria-labelledby="toolbar-orientation"]').getByRole('status').first(),
  ).toContainText('Пошук');
});

test('RTL navigates in reading order, cross-axis/IME/modified keys remain untouched', async ({
  page,
}) => {
  await openToolbar(page);
  const toolbar = page.getByRole('toolbar', { name: 'إجراءات المستند', exact: true });
  const edit = toolbar.getByRole('button', { name: 'تحرير', exact: true });
  const copy = toolbar.getByRole('button', { name: 'نسخ', exact: true });
  await edit.focus();
  await edit.press('ArrowLeft');
  await expect(copy).toBeFocused();
  await copy.press('ArrowRight');
  await expect(edit).toBeFocused();
  const results = await edit.evaluate((el) =>
    [
      { key: 'ArrowDown' },
      { key: 'ArrowLeft', isComposing: true },
      { key: 'ArrowLeft', ctrlKey: true },
      { key: 'Home', metaKey: true },
      { key: 'End', shiftKey: true },
    ].map((init) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true })),
    ),
  );
  expect(results).toEqual([true, true, true, true, true]);
  await expect(edit).toBeFocused();
  await edit.press('Enter');
  await expect(page.getByRole('status').last()).toContainText('تحرير');
});

for (const dir of ['ltr', 'rtl']) {
  test(`320px and enlarged Ukrainian/RTL labels (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openToolbar(page);
    await page.evaluate((dir) => {
      document.documentElement.dir = dir;
      document.documentElement.style.fontSize = '200%';
    }, dir);
    for (const theme of ['dark', 'light']) {
      await page.evaluate(
        (theme) => document.documentElement.setAttribute('data-theme', theme),
        theme,
      );
      expect(
        await page.locator('.vd-toolbar').evaluateAll((toolbars) =>
          toolbars.every((el) => {
            const box = el.getBoundingClientRect();
            return (
              el.scrollWidth <= el.clientWidth + 1 &&
              [...el.querySelectorAll('button')]
                .filter((button) => button.getBoundingClientRect().height)
                .every((button) => {
                  const r = button.getBoundingClientRect();
                  return (
                    button.scrollWidth <= button.clientWidth + 1 &&
                    r.left >= box.left - 1 &&
                    r.right <= box.right + 1
                  );
                })
            );
          }),
        ),
      ).toBe(true);
    }
  });
}

test('unavailable and empty panels have no Tab stop; forced colors and reduced motion', async ({
  page,
}) => {
  await openToolbar(page);
  await expect(
    page.getByRole('toolbar', { name: 'Недоступні дії', exact: true }).locator('[tabindex="0"]'),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole('toolbar', { name: 'Дії нового документа', exact: true })
      .locator('[tabindex="0"]'),
  ).toHaveCount(0);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const protect = page
    .getByRole('toolbar', { name: 'Дії з документом', exact: true })
    .getByRole('button', { name: 'Захист документа', exact: true });
  await protect.focus();
  await protect.press('ArrowLeft');
  await protect.focus();
  expect(await protect.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(
    await protect.evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((v) => parseFloat(v) === 0),
    ),
  ).toBe(true);
});

for (const theme of ['dark', 'light'] as const) {
  test(`toolbar axe (${theme})`, async ({ page }) => {
    await openToolbar(page, theme);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
}
