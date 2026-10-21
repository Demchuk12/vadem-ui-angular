import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  isDevMode,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { VdBadge } from '@vadem/ui/badge';
import { VdButton } from '@vadem/ui/button';
import { VdCard } from '@vadem/ui/card';
import { VdChoice } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdSegment, VdSegmented } from '@vadem/ui/segmented';
import { VdSlider } from '@vadem/ui/slider';
import { VdSwitch } from '@vadem/ui/switch';
import { CATALOG, COPY, type Lang } from './copy';
import { highlight } from './highlight';

const DEFAULT_HUE = 285;

const TEMPLATE_SAMPLE = `<button vdButton variant="primary"
        [loading]="saving()">
  Deploy
</button>

<label vdChoice>
  <input type="checkbox" vdSwitch
         [(ngModel)]="previews" />
  Preview deployments
</label>`;

/** What the directives above render while saving() is true. */
const DOM_SAMPLE = `<button class="vd-button" type="button"
        data-variant="primary" data-size="md"
        data-loading aria-busy="true"
        aria-disabled="true">
  Deploy
</button>

<label class="vd-choice">
  <input type="checkbox" class="vd-switch"
         role="switch" />
  Preview deployments
</label>`;

@Component({
  selector: 'site-landing',
  imports: [
    RouterLink,
    VdBadge,
    VdButton,
    VdCard,
    VdChoice,
    VdIcon,
    VdSegmented,
    VdSegment,
    VdSlider,
    VdSwitch,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export default class Landing {
  /** From route data. */
  readonly lang = input<Lang>('en');

  protected readonly t = computed(() => COPY[this.lang()]);
  protected readonly otherLang = computed<Lang>(() => (this.lang() === 'en' ? 'uk' : 'en'));
  protected readonly otherLangLink = computed(() => (this.lang() === 'en' ? '/uk' : '/'));
  protected readonly groups = computed(() =>
    (Object.keys(CATALOG) as (keyof typeof CATALOG)[]).map((key) => ({
      key,
      title: this.t().catalog.groups[key],
      items: CATALOG[key],
    })),
  );
  protected readonly componentCount = Object.values(CATALOG).flat().length;
  protected readonly galleryUrl = isDevMode()
    ? 'http://localhost:4200/'
    : new URL('gallery/', inject(DOCUMENT).baseURI).href;
  protected readonly templateLines = highlight(TEMPLATE_SAMPLE);
  protected readonly domLines = highlight(DOM_SAMPLE);

  protected readonly hue = signal(DEFAULT_HUE);
  protected readonly theme = signal<'dark' | 'light'>('dark');
  protected readonly region = signal<string | null>('eu');
  protected readonly previews = signal(true);

  constructor() {
    const doc = inject(DOCUMENT);
    const title = inject(Title);
    effect(() => {
      const root = doc.documentElement;
      root.lang = this.lang();
      root.dataset['theme'] = this.theme();
      root.style.setProperty('--vd-hue-accent', String(this.hue()));
      title.setTitle(this.t().htmlTitle);
    });
  }

  protected setHue(event: Event): void {
    this.hue.set(Number((event.target as HTMLInputElement).value));
  }

  protected toggleTheme(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  protected galleryLink(route: string): string {
    return new URL(route, this.galleryUrl).href;
  }
}
