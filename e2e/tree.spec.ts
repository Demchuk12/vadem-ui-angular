import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery, type Theme } from './fixtures';

async function openTree(page: Page, theme: Theme = 'dark') {
  await openGallery(page, 'tree', theme);
  await expect(page.getByRole('heading', { name: 'Tree view', exact: true })).toBeVisible();
  await expect(page.locator('.vd-tree')).toHaveCount(6);
}

test('preorder arrows, branch keys, separate selection, single Tab stop and typeahead', async ({
  page,
}) => {
  await openTree(page);
  const tree = page.getByRole('tree', { name: 'Файли проєкту', exact: true });
  const node = (name: string) => tree.getByRole('treeitem', { name, exact: true });
  const button = node('Кнопка');
  await expect(button).toHaveAttribute('tabindex', '0');
  await button.focus();
  await button.press('ArrowDown');
  await expect(node('Поле введення')).toBeFocused();
  await expect(button).toHaveAttribute('aria-selected', 'true');
  await node('Поле введення').press('Enter');
  await expect(node('Поле введення')).toHaveAttribute('aria-selected', 'true');
  await node('Поле введення').press('ArrowLeft');
  await expect(node('Компоненти')).toBeFocused();
  await node('Компоненти').press('ArrowLeft');
  await expect(node('Компоненти')).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeHidden();
  await node('Компоненти').press('ArrowRight');
  await node('Компоненти').press('ArrowRight');
  await expect(button).toBeFocused();
  await button.press('End');
  await expect(node('README.md')).toBeFocused();
  await node('README.md').press('Home');
  await expect(node('Vadem UI')).toBeFocused();
  await node('Vadem UI').dispatchEvent('keydown', { key: 'т', bubbles: true });
  await expect(node('Теги')).toBeFocused();
  await node('Теги').press('Space');
  await expect(node('Теги')).toHaveAttribute('aria-selected', 'true');
  await expect(tree.locator('[tabindex="0"]')).toHaveCount(1);
  await node('Теги').press('Tab');
  const outside = page.getByRole('button', { name: 'Перемкнути гілку', exact: true });
  await expect(outside).toBeFocused();
  await outside.press('Shift+Tab');
  await expect(node('Теги')).toBeFocused();
});

test('chevron toggles without selection, disabled discovery and sibling expansion', async ({
  page,
}) => {
  await openTree(page);
  const tree = page.getByRole('tree', { name: 'Закриті гілки', exact: true });
  const design = tree.getByRole('treeitem', { name: 'Дизайн', exact: true });
  await design.locator(':scope > .vd-tree-item__row > .vd-tree-item__toggle').click();
  await expect(design).toHaveAttribute('aria-expanded', 'true');
  await expect(design).toHaveAttribute('aria-selected', 'false');
  await design.press('*');
  await expect(tree.getByRole('treeitem', { name: 'Розробка', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  const locked = tree.getByRole('treeitem', { name: 'Захищена гілка', exact: true });
  await design.press('End');
  await expect(locked).toBeFocused();
  await locked.press('ArrowRight');
  await locked.press('Enter');
  await expect(locked).toHaveAttribute('aria-expanded', 'false');
  await expect(locked).not.toHaveAttribute('aria-selected');
  await expect(
    tree.getByRole('treeitem', { name: 'Внутрішні документи', exact: true }),
  ).toHaveCount(0);
});

test('external collapse and item removal recover focus; updates outside preserve focus', async ({
  page,
}) => {
  await openTree(page);
  const tree = page.getByRole('tree', { name: 'Файли проєкту', exact: true });
  const leaf = tree.getByRole('treeitem', { name: 'Дерево навігації', exact: true });
  await leaf.focus();
  // DOM click invokes the consumer update while keyboard focus remains on the removed item.
  await page
    .getByRole('button', { name: 'Перемкнути елемент', exact: true })
    .evaluate((el) => (el as HTMLButtonElement).click());
  await expect(tree.getByRole('treeitem', { name: 'Кнопка', exact: true })).toBeFocused();
  await page
    .getByRole('button', { name: 'Перемкнути гілку', exact: true })
    .evaluate((el) => (el as HTMLButtonElement).click());
  await expect(tree.getByRole('treeitem', { name: 'Компоненти', exact: true })).toBeFocused();
  const outside = page.getByRole('button', { name: 'Перемкнути гілку', exact: true });
  await outside.click();
  await expect(outside).toBeFocused();
});

test('RTL mirrors branch keys, names exclude descendants and selection remains explicit', async ({
  page,
}) => {
  await openTree(page);
  const tree = page.getByRole('tree', { name: 'ملفات المشروع', exact: true });
  const root = tree.getByRole('treeitem', { name: 'المشروع', exact: true });
  const design = tree.getByRole('treeitem', { name: 'التصميم', exact: true });
  await root.focus();
  await root.press('ArrowLeft');
  await expect(design).toBeFocused();
  await design.press('ArrowLeft');
  await expect(design).toHaveAttribute('aria-expanded', 'true');
  await design.press('ArrowLeft');
  const guide = tree.getByRole('treeitem', { name: 'دليل المستخدم', exact: true });
  await expect(guide).toBeFocused();
  await expect(guide).not.toHaveAttribute('aria-expanded');
  await guide.press('Space');
  await expect(guide).toHaveAttribute('aria-selected', 'true');
  await guide.press('ArrowRight');
  await expect(design).toBeFocused();
  await design.press('ArrowRight');
  await expect(design).toHaveAttribute('aria-expanded', 'false');
});

for (const dir of ['ltr', 'rtl']) {
  test(`long labels at 320px with enlarged text (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openTree(page);
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
        await page.locator('.vd-tree').evaluateAll((trees) =>
          trees.every((tree) => {
            const box = tree.getBoundingClientRect();
            return [...tree.querySelectorAll('.vd-tree-item__row')]
              .filter((row) => row.getBoundingClientRect().height)
              .every((row) => {
                const rect = row.getBoundingClientRect();
                return (
                  row.scrollWidth <= row.clientWidth + 1 &&
                  rect.left >= box.left - 1 &&
                  rect.right <= box.right + 1
                );
              });
          }),
        ),
      ).toBe(true);
    }
  });
}

test('disabled container, forced colors focus/selection and reduced motion', async ({ page }) => {
  await openTree(page);
  const disabled = page.getByRole('tree', { name: 'Недоступна структура', exact: true });
  await expect(disabled).toHaveAttribute('tabindex', '0');
  await expect(disabled.locator('[tabindex="0"]')).toHaveCount(0);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const node = page.getByRole('treeitem', { name: 'Кнопка', exact: true });
  await node.focus();
  await node.press('Space');
  const row = node.locator(':scope > .vd-tree-item__row');
  expect(await row.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(
    await row.evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((duration) => parseFloat(duration) === 0),
    ),
  ).toBe(true);
});

for (const theme of ['dark', 'light'] as const) {
  test(`tree axe including disabled nodes (${theme})`, async ({ page }) => {
    await openTree(page, theme);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
}

test('row click selects only its own item; IME and modified keys remain untouched', async ({
  page,
}) => {
  await openTree(page);
  const tree = page.getByRole('tree', { name: 'Файли проєкту', exact: true });
  const item = tree.getByRole('treeitem', { name: 'Дерево навігації', exact: true });
  await item.locator(':scope > .vd-tree-item__row').click();
  await expect(item).toBeFocused();
  await expect(item).toHaveAttribute('aria-selected', 'true');
  await expect(tree.getByRole('treeitem', { name: 'Компоненти', exact: true })).toHaveAttribute(
    'aria-selected',
    'false',
  );
  const results = await item.evaluate((el) =>
    [
      { key: 'Enter', isComposing: true },
      { key: 'ArrowLeft', ctrlKey: true },
      { key: 'ArrowRight', metaKey: true },
    ].map((init) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true })),
    ),
  );
  expect(results).toEqual([true, true, true]);
  await expect(item).toBeFocused();
});
