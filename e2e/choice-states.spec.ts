import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

const PAGES = [
  { route: 'choice', controls: ['.vd-checkbox', '.vd-switch'] },
  { route: 'radio', controls: ['.vd-radio'] },
] as const;

test.describe('choice controls: robustness', () => {
  for (const route of ['choice', 'radio']) {
    test(`${route}: no horizontal overflow at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await openGallery(page, route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  for (const { route, controls } of PAGES) {
    test(`${route}: a long Ukrainian label wraps and keeps the control size`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await openGallery(page, route);
      const sizes = await page.evaluate(
        (selectors) => {
          return selectors.map((sel) => {
            const input = document.querySelector<HTMLElement>(sel);
            const label = input?.closest('label');
            if (!input || !label)
              return { sel, found: false, before: 0, after: 0, overflow: false };
            const before = input.getBoundingClientRect().width;
            label.append(
              ' Я підтверджую, що ознайомився з усіма положеннями політики конфіденційності та умовами використання сервісу',
            );
            return {
              sel,
              found: true,
              before,
              after: input.getBoundingClientRect().width,
              overflow:
                label.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5,
            };
          });
        },
        [...controls],
      );
      for (const r of sizes) {
        expect(r.found, r.sel).toBe(true);
        expect(r.after, r.sel).toBeCloseTo(r.before, 1);
        expect(r.overflow, `${r.sel} overflows`).toBe(false);
      }
    });

    test(`${route}: forced colors keep checked state distinguishable`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      await openGallery(page, route);
      const results = await page.evaluate(
        (selectors) => {
          const style = (el: Element | null) =>
            el
              ? {
                  bg: getComputedStyle(el).backgroundColor,
                  border: getComputedStyle(el).borderTopColor,
                }
              : null;
          return selectors.map((sel) => ({
            sel,
            on: style(document.querySelector(`${sel}:checked:not(:disabled)`)),
            off: style(
              document.querySelector(`${sel}:not(:checked):not(:disabled):not(:indeterminate)`),
            ),
          }));
        },
        [...controls],
      );
      for (const r of results) {
        expect(r.on, `${r.sel} checked exists`).not.toBeNull();
        expect(r.off, `${r.sel} unchecked exists`).not.toBeNull();
        expect(JSON.stringify(r.on), r.sel).not.toBe(JSON.stringify(r.off));
      }
    });

    test(`${route}: reduced motion removes control transitions`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, route);
      const durations = await page.evaluate(
        (selectors) => {
          const ms = (v: string) =>
            v
              .split(',')
              .map((d) => (d.trim().endsWith('ms') ? parseFloat(d) : parseFloat(d) * 1000));
          return selectors.map((sel) => {
            const el = document.querySelector(sel)!;
            return {
              sel,
              max: Math.max(
                ...ms(getComputedStyle(el).transitionDuration),
                ...ms(getComputedStyle(el, '::before').transitionDuration),
              ),
            };
          });
        },
        [...controls],
      );
      for (const d of durations) expect(d.max, d.sel).toBeLessThanOrEqual(1);
    });
  }

  test('forced colors: keyboard focus draws an outline', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await openGallery(page, 'choice');
    const box = page.getByRole('checkbox', { name: 'Не вибрано' });
    await box.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const outline = await box.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
    expect(outline.style).not.toBe('none');
    expect(outline.width).toBeGreaterThan(0);
  });

  test('disabled controls mute the label and block interaction', async ({ page }) => {
    await openGallery(page, 'choice');
    const box = page.getByRole('checkbox', { name: 'Недоступно', exact: true });
    await expect(box).toBeDisabled();
    const muted = await box.evaluate((el) => {
      const label = el.closest('label')!;
      const cs = getComputedStyle(label);
      return { color: cs.color, cursor: cs.cursor };
    });
    expect(muted.cursor).toBe('not-allowed');
    await box.click({ force: true });
    await expect(box).not.toBeChecked();
  });

  test('a disabled fieldset disables its choices and mutes labels', async ({ page }) => {
    await openGallery(page, 'choice');
    await page.evaluate(() => {
      const host = document.createElement('fieldset');
      host.disabled = true;
      host.id = 'probe';
      host.innerHTML =
        '<label class="vd-choice"><input type="checkbox" class="vd-checkbox" />Probe</label>';
      document.body.append(host);
    });
    const input = page.locator('#probe input');
    await expect(input).toBeDisabled();
    const cursor = await input.evaluate((el) => getComputedStyle(el.closest('label')!).cursor);
    expect(cursor).toBe('not-allowed');
  });

  test('light theme: disabled and checked states keep a visible boundary', async ({ page }) => {
    await openGallery(page, 'choice', 'light');
    const box = page.getByRole('checkbox', { name: 'Недоступно', exact: true });
    const border = await box.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(border).not.toBe('rgba(0, 0, 0, 0)');
  });
});
