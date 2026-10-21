import { Page } from '@playwright/test';
import routes from '../tools/gallery-routes.json' with { type: 'json' };

export type Theme = 'dark' | 'light';

export const GALLERY_ROUTES: string[] = routes;

/** Opens a gallery route with demo preferences preset (theme, direction). */
export async function openGallery(page: Page, route: string, theme: Theme = 'dark', dir = 'ltr') {
  await page.addInitScript(
    ([t, d]) =>
      localStorage.setItem(
        'vadem-demo-prefs',
        JSON.stringify({ theme: t, hue: 285, density: 'default', dir: d }),
      ),
    [theme, dir],
  );
  await page.goto(`/${route}`, { waitUntil: 'networkidle' });
}
