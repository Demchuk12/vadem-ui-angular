import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { VdAvatar } from '@vadem/ui/avatar';
import { VdBadge } from '@vadem/ui/badge';
import { VdButton } from '@vadem/ui/button';
import { VdIcon, VdIconName } from '@vadem/ui/icon';
import { VdInput, VdInputGroup } from '@vadem/ui/input';
import { VdKbd } from '@vadem/ui/kbd';
import { VD_MENU } from '@vadem/ui/menu';
import { VD_NAVIGATION_LIST } from '@vadem/ui/navigation-list';
import { VdMeter } from '@vadem/ui/progress';
import { VD_SIDEBAR } from '@vadem/ui/sidebar';
import { VdTooltip } from '@vadem/ui/tooltip';
import { DemoPreferences } from '../shell/preferences';

interface FrameNavItem {
  label: string;
  icon: VdIconName;
  link: string;
  fragment?: string;
  count?: number;
  countLabel?: string;
}

/**
 * Shell of the "Vadem Cloud" demo app: Sidebar layout (rail on desktop, drawer on phones),
 * top bar and an outlet for its pages.
 * Built only from library components plus layout CSS, like a consumer app would be.
 */
@Component({
  selector: 'demo-app-frame',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    VD_SIDEBAR,
    VD_NAVIGATION_LIST,
    VD_MENU,
    VdAvatar,
    VdBadge,
    VdButton,
    VdIcon,
    VdInput,
    VdInputGroup,
    VdKbd,
    VdMeter,
    VdTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onShortcut($event)' },
  template: `
    <a class="demo-skip" href="#app-main">Перейти до вмісту</a>

    <vd-sidebar-layout
      class="frame"
      label="Навігація"
      closeLabel="Закрити навігацію"
      [(collapsed)]="collapsed"
    >
      <ng-template vdSidebar>
        <ng-container [ngTemplateOutlet]="brand" />
        <nav vdNavigationList label="Основна навігація">
          <ul role="list">
            @for (item of nav; track item.label) {
              <li>
                <!-- In-page section links never claim the current page. -->
                <a
                  vdNavigationLink
                  [routerLink]="item.link"
                  [fragment]="item.fragment"
                  routerLinkActive
                  [routerLinkActiveOptions]="{ exact: true }"
                  [ariaCurrentWhenActive]="item.fragment ? undefined : 'page'"
                >
                  <vd-icon slot="start" [name]="item.icon" />
                  <span>{{ item.label }}</span>
                  @if (item.count) {
                    <span vdBadge slot="end"
                      >{{ item.count
                      }}<span class="vd-visually-hidden"> {{ item.countLabel }}</span></span
                    >
                  }
                </a>
              </li>
            }
          </ul>
          <ul role="list" class="frame__secondary">
            <li>
              <a vdNavigationLink routerLink="/colors"
                ><vd-icon slot="start" name="arrow-left" /><span>Галерея компонентів</span></a
              >
            </li>
          </ul>
        </nav>
        <div class="frame__usage" data-rail="hidden">
          <div class="frame__usage-head">
            <span class="vd-eyebrow">План Team</span>
            <span class="vd-tabular frame__usage-value">72%</span>
          </div>
          <meter
            vdMeter
            size="sm"
            aria-label="Використано місячної квоти"
            min="0"
            max="100"
            low="70"
            high="90"
            optimum="0"
            value="72"
          ></meter>
          <p>Квота оновиться 1 листопада.</p>
        </div>
        <ng-container [ngTemplateOutlet]="account" />
      </ng-template>

      <div class="frame__body">
        <header class="frame__top">
          <button vdButton vdSidebarToggle variant="ghost" iconOnly aria-label="Навігація">
            <vd-icon name="panel-left" />
          </button>
          <span class="frame__top-brand"><ng-container [ngTemplateOutlet]="brand" /></span>

          <vd-input-group class="frame__search">
            <vd-icon name="search" slot="start" />
            <input
              #search
              vdInput
              type="search"
              size="sm"
              placeholder="Пошук проєктів і розгортань"
              aria-label="Пошук"
              aria-keyshortcuts="Control+K Meta+K"
            />
            <vd-kbd slot="end" class="frame__kbd" keys="Mod+K" />
          </vd-input-group>

          <div class="frame__top-actions">
            <button
              vdButton
              variant="ghost"
              iconOnly
              [vdTooltip]="themeLabel()"
              (click)="cycleTheme()"
            >
              <vd-icon [name]="themeIcon()" />
            </button>
            <button
              vdButton
              variant="ghost"
              iconOnly
              vdTooltip="Сповіщення (3 нових)"
              class="frame__bell"
            >
              <vd-icon name="bell" />
              <span class="frame__dot" aria-hidden="true"></span>
            </button>
            <button vdButton variant="primary" size="sm" class="frame__new">
              <vd-icon name="plus" slot="start" />Новий проєкт
            </button>
          </div>
        </header>

        <main id="app-main" class="frame__main" tabindex="-1">
          <router-outlet />
        </main>
      </div>
    </vd-sidebar-layout>

    <ng-template #brand>
      <a class="frame__brand" routerLink="/screens/dashboard">
        <img
          class="frame__mark demo-on-dark"
          src="brand/vadem-mark-dark.svg"
          alt=""
          width="25"
          height="24"
        />
        <img
          class="frame__mark demo-on-light"
          src="brand/vadem-mark-light.svg"
          alt=""
          width="25"
          height="24"
        />
        <span class="frame__brand-name" data-rail="hidden">Vadem Cloud</span>
      </a>
    </ng-template>

    <ng-template #account>
      <button
        class="frame__account"
        [vdMenuTrigger]="accountMenu"
        aria-label="Акаунт: Олена Коваленко"
      >
        <vd-avatar name="Олена Коваленко" decorative />
        <span class="frame__account-text" data-rail="hidden">
          <span class="frame__account-name">Олена Коваленко</span>
          <span class="frame__account-mail">olena@vadem.dev</span>
        </span>
        <vd-icon name="chevron-up" data-rail="hidden" />
      </button>
      <div vdMenu #accountMenu="vdMenu">
        <div vdMenuLabel>olena@vadem.dev</div>
        <a vdMenuItem routerLink="/screens/settings"><vd-icon name="user" />Профіль</a>
        <a vdMenuItem routerLink="/screens/settings"><vd-icon name="settings" />Налаштування</a>
        <a vdMenuItem routerLink="/colors"
          ><vd-icon name="layout-dashboard" />Галерея компонентів</a
        >
        <hr vdMenuSeparator />
        <a vdMenuItem routerLink="/screens/login"><vd-icon name="log-out" />Вийти</a>
      </div>
    </ng-template>
  `,
  styleUrl: './app-frame.css',
})
export class AppFrame {
  private readonly prefs = inject(DemoPreferences);

  protected readonly nav: FrameNavItem[] = [
    { label: 'Огляд', icon: 'layout-dashboard', link: '/screens/dashboard' },
    {
      label: 'Проєкти',
      icon: 'folder',
      link: '/screens/dashboard',
      fragment: 'projects',
      count: 4,
      countLabel: 'проєкти',
    },
    { label: 'Розгортання', icon: 'rocket', link: '/screens/dashboard', fragment: 'deploys' },
    { label: 'Активність', icon: 'activity', link: '/screens/dashboard', fragment: 'activity' },
    { label: 'Налаштування', icon: 'settings', link: '/screens/settings' },
  ];

  private readonly themes = [
    { value: 'dark', label: 'Тема: темна', icon: 'moon' },
    { value: 'light', label: 'Тема: світла', icon: 'sun' },
    { value: 'auto', label: 'Тема: як у системі', icon: 'monitor' },
  ] as const;

  private readonly theme = computed(
    () => this.themes.find((t) => t.value === this.prefs.theme()) ?? this.themes[0],
  );
  protected readonly themeLabel = computed(() => this.theme().label);
  protected readonly themeIcon = computed(() => this.theme().icon);

  /** Rail state; a real app would persist it per user. */
  protected readonly collapsed = signal(false);

  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');

  protected onShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.search()?.nativeElement.focus();
    }
  }

  protected cycleTheme(): void {
    const i = this.themes.findIndex((t) => t.value === this.prefs.theme());
    this.prefs.theme.set(this.themes[(i + 1) % this.themes.length].value);
  }
}
