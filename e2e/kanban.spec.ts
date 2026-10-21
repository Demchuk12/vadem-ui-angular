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

  test('a lifted copy follows the mouse and the card leaves a slot', async ({ page }) => {
    await openGallery(page, 'kanban');
    const card = cardIn(page, 'Новий лід', 'Аудит безпеки');
    await card.scrollIntoViewIfNeeded();
    const box = (await card.locator('.demo-deal__company').boundingBox())!;
    await page.mouse.move(box.x + 5, box.y + 5);
    await page.mouse.down();
    await page.mouse.move(box.x + 205, box.y + 45, { steps: 6 });
    const ghost = board(page).locator('.vd-kanban__ghost');
    await expect(ghost).toHaveCount(1);
    await expect(ghost).toHaveAttribute('aria-hidden', 'true');
    await expect(card).toHaveAttribute('data-dragging', '');
    const g = (await ghost.boundingBox())!;
    expect(Math.abs(g.x - (box.x + 200 - (box.x - (await card.boundingBox())!.x)))).toBeLessThan(
      40,
    );
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect(ghost).toHaveCount(0);
  });
});

test.describe('kanban on touch', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  async function touch(page: Page, type: string, x: number, y: number) {
    const cdp = sessions.get(page) ?? (await page.context().newCDPSession(page));
    sessions.set(page, cdp);
    await cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
    });
  }
  const sessions = new Map<Page, import('@playwright/test').CDPSession>();

  test('long press lifts a card and dragging with a finger moves it', async ({ page }) => {
    await openGallery(page, 'kanban');
    const source = cardIn(page, 'Новий лід', 'Аудит безпеки').locator('.demo-deal__company');
    await source.scrollIntoViewIfNeeded();
    const from = (await source.boundingBox())!;
    const x = from.x + 5,
      y = from.y + 5;
    await touch(page, 'touchStart', x, y);
    await page.waitForTimeout(600);
    await expect(board(page)).toHaveAttribute('data-state', 'dragging');
    const target = cardIn(page, 'Новий лід', 'Впровадження CRM');
    const to = (await target.boundingBox())!;
    for (let i = 1; i <= 6; i++) await touch(page, 'touchMove', x, y + ((to.y + 5 - y) * i) / 6);
    await touch(page, 'touchEnd', 0, 0);
    const titles = column(page, 'Новий лід').locator('.demo-deal__title');
    await expect(titles.first()).toHaveText('Аудит безпеки');
    await expect(page.getByTestId('kanban-last')).toContainText('(pointer)');
  });

  test('a quick swipe scrolls the board instead of dragging', async ({ page }) => {
    await openGallery(page, 'kanban');
    const scroller = board(page).locator('.vd-kanban__columns');
    const card = cardIn(page, 'Новий лід', 'Аудит безпеки').locator('.demo-deal__company');
    await card.scrollIntoViewIfNeeded();
    const b = (await card.boundingBox())!;
    await touch(page, 'touchStart', b.x + 150, b.y + 5);
    for (let i = 1; i <= 8; i++) await touch(page, 'touchMove', b.x + 150 - i * 20, b.y + 5);
    await touch(page, 'touchEnd', 0, 0);
    await expect(board(page)).toHaveAttribute('data-state', 'idle');
    await expect.poll(() => scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });
});
