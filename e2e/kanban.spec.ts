import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { openGallery } from './fixtures';

const board = (page: Page) => page.locator('vd-kanban').first();
const IDS: Record<string, string> = {
  'Новий лід': 'lead',
  'Комерційна пропозиція': 'proposal',
  Переговори: 'negotiation',
  Виграно: 'won',
};
const column = (page: Page, title: string) =>
  board(page).locator(`section.vd-kanban__column[data-column-id="${IDS[title]}"]`);
const cardIn = (page: Page, columnTitle: string, text: string) =>
  column(page, columnTitle).locator('li.vd-kanban__card').filter({ hasText: text });

test.describe('kanban', () => {
  test('the Move menu moves a card to another column, announces it and keeps focus', async ({
    page,
  }) => {
    await openGallery(page, 'kanban');
    const trigger = board(page).getByRole('button', { name: 'Move Аудит безпеки' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await menu.getByRole('menuitem', { name: 'Переговори' }).click();
    await expect(cardIn(page, 'Переговори', 'Аудит безпеки')).toBeVisible();
    await expect(cardIn(page, 'Новий лід', 'Аудит безпеки')).toHaveCount(0);
    await expect(board(page).getByRole('button', { name: 'Move Аудит безпеки' })).toBeFocused();
    await expect(board(page).getByRole('status')).toContainText(
      'Аудит безпеки moved to Переговори. Position 1 of 1.',
    );
    await expect(page.getByTestId('kanban-last')).toContainText('(menu)');
  });

  test('Move up and down reorder inside a column; boundaries are disabled', async ({ page }) => {
    await openGallery(page, 'kanban');
    await board(page).getByRole('button', { name: 'Move Впровадження CRM' }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem', { name: 'Move up' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await menu.getByRole('menuitem', { name: 'Move down' }).click();
    const titles = column(page, 'Новий лід').locator('.demo-deal__title');
    await expect(titles.first()).toHaveText('Аудит безпеки');
    await expect(titles.nth(1)).toHaveText('Впровадження CRM');
  });

  test('a mouse drag moves a card between columns; Escape cancels', async ({ page }) => {
    await openGallery(page, 'kanban');
    const source = cardIn(page, 'Новий лід', 'Впровадження CRM').locator('.demo-deal__company');
    const target = column(page, 'Виграно').locator('li.vd-kanban__card').first();
    const from = (await source.boundingBox())!;
    const to = (await target.boundingBox())!;

    // Escape mid-drag: nothing changes.
    await page.mouse.move(from.x + 5, from.y + 5);
    await page.mouse.down();
    await page.mouse.move(to.x + 10, to.y + to.height - 2, { steps: 8 });
    await expect(board(page)).toHaveAttribute('data-state', 'dragging');
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect(cardIn(page, 'Новий лід', 'Впровадження CRM')).toBeVisible();
    await expect(board(page).getByRole('status')).toContainText('Move canceled');

    // Drop below the existing card of "Виграно".
    await page.mouse.move(from.x + 5, from.y + 5);
    await page.mouse.down();
    await page.mouse.move(to.x + 10, to.y + to.height - 2, { steps: 8 });
    await expect(target).toHaveAttribute('data-drop', 'after');
    await page.mouse.up();
    const won = column(page, 'Виграно').locator('.demo-deal__title');
    await expect(won).toHaveText(['Навчання команди', 'Впровадження CRM']);
    await expect(page.getByTestId('kanban-last')).toContainText('(pointer)');
  });

  test('locking disables every move and dragging', async ({ page }) => {
    await openGallery(page, 'kanban');
    await page.getByRole('switch', { name: 'Заблокувати переміщення' }).check();
    await expect(board(page)).toHaveAttribute('data-state', 'disabled');
    await expect(board(page).getByRole('button', { name: 'Move Аудит безпеки' })).toBeDisabled();
  });

  test('axe passes with a move menu open', async ({ page }) => {
    await openGallery(page, 'kanban');
    await board(page).getByRole('button', { name: 'Move Річна підтримка' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('vd-kanban').analyze();
    expect(results.violations).toEqual([]);
  });
});
