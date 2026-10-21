import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

export type DemoTheme = 'dark' | 'light' | 'auto';
export type DemoDensity = 'compact' | 'default' | 'comfortable';
export type DemoDir = 'ltr' | 'rtl';

const STORAGE_KEY = 'vadem-demo-prefs';

interface Prefs {
  theme: DemoTheme;
  hue: number;
  density: DemoDensity;
  dir: DemoDir;
}

/** Gallery-wide view preferences, reflected on <html> so the whole page re-themes. */
@Injectable({ providedIn: 'root' })
export class DemoPreferences {
  private readonly doc = inject(DOCUMENT);
  private readonly storage = this.doc.defaultView?.localStorage;

  readonly theme = signal<DemoTheme>('dark');
  readonly hue = signal(285);
  readonly density = signal<DemoDensity>('default');
  readonly dir = signal<DemoDir>('ltr');

  constructor() {
    this.restore();
    effect(() => {
      const root = this.doc.documentElement;
      root.dataset['theme'] = this.theme();
      root.style.setProperty('--vd-hue-accent', String(this.hue()));
      if (this.density() === 'default') delete root.dataset['density'];
      else root.dataset['density'] = this.density();
      root.dir = this.dir();
      this.save();
    });
  }

  reset(): void {
    this.theme.set('dark');
    this.hue.set(285);
    this.density.set('default');
    this.dir.set('ltr');
  }

  private restore(): void {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Partial<Prefs>;
      if (p.theme) this.theme.set(p.theme);
      if (typeof p.hue === 'number') this.hue.set(p.hue);
      if (p.density) this.density.set(p.density);
      if (p.dir) this.dir.set(p.dir);
    } catch {
      /* storage unavailable: defaults are fine */
    }
  }

  private save(): void {
    try {
      const p: Prefs = {
        theme: this.theme(),
        hue: this.hue(),
        density: this.density(),
        dir: this.dir(),
      };
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }
}
