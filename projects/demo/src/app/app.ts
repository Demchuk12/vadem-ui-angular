import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Injector,
  afterNextRender,
  inject,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { VD_VERSION } from '@vadem/ui';
import { VdIcon } from '@vadem/ui/icon';
import { VdToasterOutlet } from '@vadem/ui/toast';
import { filter, map } from 'rxjs';
import { NAV } from './app.routes';
import { DemoDensity, DemoPreferences, DemoTheme } from './shell/preferences';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, VdIcon, VdToasterOutlet],
  selector: 'demo-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly version = VD_VERSION;
  protected readonly prefs = inject(DemoPreferences);
  protected readonly nav = NAV;

  protected readonly themes: {
    value: DemoTheme;
    label: string;
    icon: 'moon' | 'sun' | 'monitor';
  }[] = [
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'light', label: 'Light', icon: 'sun' },
    { value: 'auto', label: 'System', icon: 'monitor' },
  ];

  protected readonly densities: DemoDensity[] = ['compact', 'default', 'comfortable'];

  private readonly router = inject(Router);
  private navResizeObserver?: ResizeObserver;

  /** Demo screens (`/screens/*`) are full apps: rendered without the gallery chrome. */
  protected readonly bare = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.startsWith('/screens/')),
    ),
    { initialValue: false },
  );

  constructor() {
    const doc = inject(DOCUMENT);
    const injector = inject(Injector);
    inject(DestroyRef).onDestroy(() => this.navResizeObserver?.disconnect());
    // Keep the current link visible inside either the sidebar or the phone strip.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() =>
        afterNextRender(
          () => {
            this.centerActiveLink(doc);
            this.observeNavSize(doc);
          },
          { injector },
        ),
      );
  }

  /** Recenter after a breakpoint or text-size change; disconnect when the gallery unmounts. */
  private observeNavSize(doc: Document): void {
    this.navResizeObserver?.disconnect();
    const nav = doc.querySelector<HTMLElement>('.demo-nav');
    const Observer = doc.defaultView?.ResizeObserver;
    if (!nav || !Observer) return;
    this.navResizeObserver = new Observer(() => this.centerActiveLink(doc));
    this.navResizeObserver.observe(nav);
    const link = nav.querySelector('a.is-active');
    if (link) this.navResizeObserver.observe(link);
  }

  /**
   * Scroll only the nav itself. `scrollIntoView` would also move the page when a route's
   * active link sits outside the sidebar's visible area.
   */
  private centerActiveLink(doc: Document): void {
    const nav = doc.querySelector<HTMLElement>('.demo-nav');
    const link = nav?.querySelector<HTMLElement>('a.is-active');
    if (!nav || !link) return;
    const navBox = nav.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollBy({
        left: linkBox.left + linkBox.width / 2 - (navBox.left + navBox.width / 2),
      });
    } else {
      // A sidebar can extend below the viewport while the header is still visible.
      const visibleTop = Math.max(0, navBox.top);
      const visibleBottom = Math.min(doc.documentElement.clientHeight, navBox.bottom);
      if (linkBox.top < visibleTop || linkBox.bottom > visibleBottom) {
        nav.scrollBy({
          top: linkBox.top + linkBox.height / 2 - (visibleTop + visibleBottom) / 2,
        });
      }
    }
  }

  protected onHue(event: Event): void {
    this.prefs.hue.set(Number((event.target as HTMLInputElement).value));
  }

  protected onDensity(event: Event): void {
    this.prefs.density.set((event.target as HTMLSelectElement).value as DemoDensity);
  }

  protected toggleDir(): void {
    this.prefs.dir.update((d) => (d === 'ltr' ? 'rtl' : 'ltr'));
  }
}
