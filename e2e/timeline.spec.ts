import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('timeline preserves ordered native history, timestamps and explicit status cues', async ({
  page,
}) => {
  await openGallery(page, 'timeline');
  const list = page.getByRole('list', { name: 'Історія публікації VA-24', exact: true });
  const events = list.getByRole('listitem');
  await expect(events).toHaveCount(5);
  await expect(list.getByRole('heading')).toHaveText([
    'Підготовлено випуск VA-24',
    'Додано український переклад',
    'Виявлено неповні дані про автора',
    'Публікацію призупинено',
    'Оновлення доступне всій команді',
  ]);
  await expect(list.locator('time').last()).toHaveAttribute(
    'datetime',
    '2026-10-08T09:24:00+03:00',
  );
  await expect(list.locator('.vd-timeline-item__status')).toHaveText([
    'Створено',
    'Оновлено',
    'Потребує уваги',
    'Помилка перевірки',
    'Опубліковано',
  ]);
  expect(
    await list
      .locator('.vd-timeline-item__marker')
      .evaluateAll((markers) => markers.every((el) => el.getAttribute('aria-hidden') === 'true')),
  ).toBe(true);
  expect(await list.evaluate((el) => el.tagName)).toBe('OL');
  expect(await list.locator(':scope > li').count()).toBe(5);
  await expect(
    list.locator('[tabindex], [aria-selected], [aria-current], [aria-live]'),
  ).toHaveCount(0);
});

test('projected action retains native keyboard behavior and focus', async ({ page }) => {
  await openGallery(page, 'timeline');
  const list = page.getByRole('list', { name: 'Історія публікації VA-24', exact: true });
  const action = list.getByRole('button', { name: 'Переглянути зміни', exact: true });
  const details = page.locator('#timeline-release-details');
  await action.focus();
  await action.press('Enter');
  await expect(action).toBeFocused();
  await expect(action).toHaveAttribute('aria-expanded', 'true');
  await expect(details).toBeVisible();
  await action.press('Space');
  await expect(action).toHaveAttribute('aria-expanded', 'false');
  await expect(details).not.toBeVisible();
  await action.press('Escape');
  await expect(action).toBeFocused();
  await expect(list.getByRole('listitem')).toHaveCount(5);
  await action.press('Tab');
  await expect(action).not.toBeFocused();
  expect(
    await list
      .getByRole('listitem')
      .evaluateAll((items) => items.every((el) => el !== document.activeElement)),
  ).toBe(true);
});

test('a single event has no trailing connector; empty/loading composition has no fake events', async ({
  page,
}) => {
  await openGallery(page, 'timeline');
  const single = page.getByRole('list', { name: 'Історія нового проєкту', exact: true });
  await expect(single.getByRole('listitem')).toHaveCount(1);
  expect(
    await single.getByRole('listitem').evaluate((el) => getComputedStyle(el, '::after').content),
  ).toBe('none');
  const history = page.getByRole('list', { name: 'Історія публікації VA-24', exact: true });
  expect(
    await history
      .getByRole('listitem')
      .first()
      .evaluate((el) => getComputedStyle(el, '::after').content),
  ).toBe('""');
  expect(
    await history
      .getByRole('listitem')
      .last()
      .evaluate((el) => getComputedStyle(el, '::after').content),
  ).toBe('none');
  await expect(page.getByRole('heading', { name: 'Подій ще немає', exact: true })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Завантажуємо історію…' })).toHaveText(
    'Завантажуємо історію…',
  );
  await expect(page.locator('[aria-busy=true]')).toHaveAttribute(
    'aria-label',
    'Завантаження історії',
  );
  await expect(page.locator('[aria-busy=true] [role=listitem], [aria-busy=true] li')).toHaveCount(
    0,
  );
});

for (const dir of ['ltr', 'rtl']) {
  test(`long content stays within 320px with enlarged text (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openGallery(page, 'timeline', 'dark', dir);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
    const list = page.getByRole('list', { name: 'Історія публікації VA-24', exact: true });
    for (const item of await list.getByRole('listitem').all()) {
      const box = await item.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    }
    const arabic = page.getByRole('list', { name: 'سجل تحديثات المشروع', exact: true });
    expect(
      await page
        .locator('.vd-timeline-item__content')
        .evaluateAll((nodes) => nodes.every((el) => el.scrollWidth <= el.clientWidth + 1)),
    ).toBe(true);
    expect(await arabic.evaluate((el) => getComputedStyle(el).direction)).toBe('rtl');
    await expect(arabic.getByRole('listitem')).toHaveCount(2);
  });
}

test('forced colors preserves visible status text and marker boundaries; reduced motion is static', async ({
  page,
}) => {
  await openGallery(page, 'timeline');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const list = page.getByRole('list', { name: 'Історія публікації VA-24', exact: true });
  await expect(list.getByText('Помилка перевірки', { exact: true })).toBeVisible();
  const marker = list.locator('.vd-timeline-item__marker').last();
  const style = await marker.evaluate((el) => {
    const s = getComputedStyle(el);
    return { border: s.borderInlineStartWidth, animation: s.animationName };
  });
  expect(parseFloat(style.border)).toBeGreaterThan(0);
  expect(style.animation).toBe('none');
  expect(
    await list
      .locator('.vd-timeline-item__dot')
      .evaluate(
        (el) =>
          getComputedStyle(el).backgroundColor !==
          getComputedStyle(el.parentElement!).backgroundColor,
      ),
  ).toBe(true);
  expect(
    await page
      .locator('.vd-skeleton')
      .first()
      .evaluate((el) => getComputedStyle(el, '::after').animationName),
  ).toBe('none');
});
