import { expect, test } from '@playwright/test';
import { GALLERY_ROUTES, openGallery } from './fixtures';

/** Routes whose pages are token/typography showcases, not components. */
const SKIP = new Set(['colors', 'typography', 'space', 'elevation', 'motion', 'icons', 'locale']);
const ROUTES = GALLERY_ROUTES.filter((r) => !SKIP.has(r));

test.describe('every component page', () => {
  for (const route of ROUTES) {
    test(`${route}: no page-level horizontal overflow at 320px (LTR and RTL)`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      for (const dir of ['ltr', 'rtl']) {
        await openGallery(page, route, 'dark', dir);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${route} ${dir}`).toBeLessThanOrEqual(0);
      }
    });

    test(`${route}: reduced motion leaves no running transitions or animations`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, route);
      const offenders = await page.evaluate(() => {
        const ms = (v: string) =>
          v.split(',').map((d) => (d.trim().endsWith('ms') ? parseFloat(d) : parseFloat(d) * 1000));
        const bad: string[] = [];
        for (const el of Array.from(document.querySelectorAll<HTMLElement>('main *, body > * *'))) {
          for (const pseudo of [null, '::before', '::after']) {
            const cs = getComputedStyle(el, pseudo);
            const t = Math.max(...ms(cs.transitionDuration));
            const a = cs.animationName !== 'none' ? Math.max(...ms(cs.animationDuration)) : 0;
            const iter = cs.animationIterationCount;
            if (t > 1 || a > 1 || (cs.animationName !== 'none' && iter === 'infinite' && a > 1)) {
              bad.push(
                `${el.tagName.toLowerCase()}.${el.className.toString().slice(0, 40)}${pseudo ?? ''}`,
              );
              if (bad.length > 5) return bad;
            }
          }
        }
        return bad;
      });
      expect(offenders, route).toEqual([]);
    });

    test(`${route}: forced colors keep a visible focus indicator on every tab stop`, async ({
      page,
    }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      await openGallery(page, route);
      const bad: string[] = [];
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const focusable = el.matches(':focus-visible');
          // Composite widgets draw the ring on a wrapper (:focus-within / :has(:focus-visible)).
          let node: HTMLElement | null = el;
          let visible = false;
          const drawn = (n: Element) => {
            const cs = getComputedStyle(n);
            return (
              (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
              (n instanceof SVGElement && cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0)
            );
          };
          // The ring may sit on the element, a wrapper (:focus-within) or its first-level row.
          for (let d = 0; node && d < 4 && !visible; d++, node = node.parentElement) {
            visible = drawn(node);
          }
          visible = visible || Array.from(el.children).some(drawn);
          return {
            focusable,
            visible,
            tag: el.tagName.toLowerCase(),
            cls: el.className.toString().slice(0, 40),
          };
        });
        if (info && info.focusable && !info.visible) bad.push(`${info.tag}.${info.cls}`);
      }
      expect(bad, route).toEqual([]);
    });
  }
});
