import assert from 'node:assert/strict';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

export async function checkSelectLifecycle(page, screenshots, theme) {
  const section = page.getByTestId('select-lifecycle');
  const select = section.getByRole('combobox', { name: 'Місто доставки', exact: true });
  const combo = section.getByRole('combobox', { name: 'Пошук міста', exact: true });
  const selection = section.getByTestId('selection');
  // Programmatic updates must occur without the pointer light-dismissing the native popover.
  const mutate = (name) =>
    section.getByRole('button', { name, exact: true }).dispatchEvent('click');
  const active = async (control, label) => {
    await expect
      .poll(async () => {
        const id = await control.getAttribute('aria-activedescendant');
        if (!id) return null;
        const option = section.locator(`[id="${id}"]`);
        return (await option.count()) ? option.textContent() : null;
      })
      .toBe(label);
    const id = await control.getAttribute('aria-activedescendant');
    await expect(section.locator(`[id="${id}"]`)).not.toHaveAttribute('aria-disabled', 'true');
  };

  await select.focus();
  await select.press('ArrowDown');
  await select.press('ArrowDown');
  await active(select, 'Львів — команда підтримки клієнтів');
  await mutate('Прибрати Львів');
  await active(select, 'Київ — основний офіс');
  await expect(selection).toHaveText('kyiv / kyiv');
  await mutate('Вимкнути Київ');
  await active(select, 'Одеса — регіональне представництво');
  await select.press('Enter');
  await expect(selection).toHaveText('odesa / kyiv');
  await mutate('Відновити міста');

  await combo.fill('льв');
  await active(combo, 'Львів — команда підтримки клієнтів');
  await mutate('Скинути вибір');
  await expect(combo).toHaveValue('');
  await expect(section.locator('vd-combobox [role=option]:not([hidden])')).toHaveCount(3);
  await expect(combo).not.toHaveAttribute('aria-invalid', 'true');
  await expect(select).not.toHaveAttribute('aria-invalid', 'true');
  await mutate('Вимкнути поля');
  await expect(combo).toBeDisabled();
  await expect(select).toBeDisabled();
  await expect(section.locator(':popover-open')).toHaveCount(0);
  await expect(combo).toHaveAttribute('aria-expanded', 'false');
  await mutate('Увімкнути поля');
  await expect(combo).toBeEnabled();
  await expect(select).toBeEnabled();
  await expect(combo).toHaveAttribute('aria-expanded', 'false');
  await expect(section.locator('.vd-field__error')).toHaveCount(0);

  await select.focus();
  await select.press('ArrowDown');
  await mutate('Вимкнути поля');
  await expect(section.locator(':popover-open')).toHaveCount(0);
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await mutate('Увімкнути поля');
  await expect(select).toBeEnabled();
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await expect(section.locator('.vd-field__error')).toHaveCount(0);

  for (const control of [select, combo]) {
    await control.focus();
    await control.press('ArrowDown');
    await mutate('Очистити міста');
    await expect(control).not.toHaveAttribute('aria-activedescendant');
    await mutate('Відновити міста');
    await active(control, 'Київ — основний офіс');
    await control.press('Escape');
    await expect(control).toBeFocused();
  }

  await select.press('ArrowDown');
  await select.press('Enter');
  await mutate('Очистити міста');
  await expect(selection).toHaveText('kyiv /');
  await mutate('Відновити міста');
  await expect(select).toContainText('Київ — основний офіс');
  await mutate('Скинути вибір');
  await select.focus();
  await select.press('Tab');
  await expect(select).toHaveAttribute('aria-invalid', 'true');
  await expect(select).toHaveAccessibleDescription('Вкажіть місто доставки');
  await mutate('Скинути вибір');
  await expect(select).not.toHaveAttribute('aria-invalid', 'true');
  await expect(select).toHaveAccessibleDescription('Оберіть відділення');
  await mutate('Зняти обов’язковість');
  await expect(select).not.toHaveAttribute('aria-required');
  await expect(combo).not.toHaveAttribute('aria-required');
  await expect(section.locator('.vd-field__required')).toHaveCount(0);
  await mutate('Зробити обов’язковими');
  await expect(select).toHaveAttribute('aria-required', 'true');
  await expect(combo).toHaveAttribute('aria-required', 'true');

  await select.focus();
  await select.press('ArrowDown');
  const axe = await new AxeBuilder({ page })
    .include('[data-testid="select-lifecycle"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  assert.deepEqual(
    axe.violations.map((issue) => issue.id),
    [],
    `Open list axe (${theme})`,
  );
  await section.screenshot({ path: join(screenshots, `select-lifecycle-${theme}.png`) });
  await select.press('Escape');
  await section.evaluate((el) => el.setAttribute('dir', 'rtl'));
  await page.setViewportSize({ width: 390, height: 844 });
  await combo.fill('льв');
  await active(combo, 'Львів — команда підтримки клієнтів');
  await expect(combo).toBeFocused();
  assert(await section.evaluate((el) => el.scrollWidth <= el.clientWidth), 'RTL consumer overflow');
  await section.screenshot({ path: join(screenshots, `select-lifecycle-rtl-${theme}.png`) });
  await combo.press('Escape');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await select.focus();
  assert.equal(await select.evaluate((el) => getComputedStyle(el).outlineStyle), 'solid');
  await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'reduce' });
  await section.evaluate((el) => el.removeAttribute('dir'));
  await page.setViewportSize({ width: 1280, height: 720 });
  await mutate('Скинути вибір');
}
