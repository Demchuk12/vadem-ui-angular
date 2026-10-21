import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { VdBadge } from '@vadem/ui/badge';
import { VdButton } from '@vadem/ui/button';
import { VdIcon, type VdIconName } from '@vadem/ui/icon';
import { VD_NAVIGATION_LIST } from '@vadem/ui/navigation-list';
import { VD_SIDEBAR } from '@vadem/ui/sidebar';

interface DemoSection {
  id: string;
  label: string;
  icon: VdIconName;
  count?: number;
  countLabel?: string;
}

@Component({
  selector: 'demo-sidebar',
  imports: [
    VD_SIDEBAR,
    VD_NAVIGATION_LIST,
    VdBadge,
    VdButton,
    VdIcon,
    RouterLink,
    RouterLinkActive,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Sidebar</p>
      <h1>Sidebar</h1>
      <p>
        Application shell with a docked side panel that collapses to an icon rail. Below 64rem the
        same content opens as a drawer.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="sidebar-shell">
      <div class="demo-section__head">
        <h2 id="sidebar-shell">Workspace shell</h2>
        <p>
          Collapse the rail with the toggle in the top bar. Narrow the window to switch to the
          drawer. Rail state:
          <span class="demo-token" data-testid="sidebar-state">{{
            collapsed() ? 'collapsed' : 'expanded'
          }}</span>
        </p>
      </div>
      <div class="demo-sidebar-frame">
        <vd-sidebar-layout
          label="Навігація"
          closeLabel="Закрити навігацію"
          [(collapsed)]="collapsed"
        >
          <ng-template vdSidebar>
            <p class="demo-sidebar-brand">
              <vd-icon name="rocket" /><span data-rail="hidden">Vadem Cloud</span>
            </p>
            <nav vdNavigationList label="Робочий простір">
              <section aria-labelledby="sidebar-work">
                <h3 vdNavigationLabel id="sidebar-work">Робочі розділи</h3>
                <ul role="list">
                  @for (item of sections; track item.id) {
                    <li>
                      <a
                        vdNavigationLink
                        [routerLink]="[]"
                        [queryParams]="item.id === 'overview' ? {} : { section: item.id }"
                        routerLinkActive
                        [routerLinkActiveOptions]="{ exact: true }"
                        ariaCurrentWhenActive="page"
                      >
                        <vd-icon slot="start" [name]="item.icon" />
                        <span>{{ item.label }}</span>
                        @if (item.count !== undefined) {
                          <span vdBadge slot="end"
                            >{{ item.count
                            }}<span class="vd-visually-hidden"> {{ item.countLabel }}</span></span
                          >
                        }
                      </a>
                    </li>
                  }
                </ul>
              </section>
              <section aria-labelledby="sidebar-account">
                <h3 vdNavigationLabel id="sidebar-account">Обліковий запис</h3>
                <ul role="list">
                  <li>
                    <a
                      vdNavigationLink
                      [routerLink]="[]"
                      [queryParams]="{ section: 'settings' }"
                      routerLinkActive
                      ariaCurrentWhenActive="page"
                      ><vd-icon slot="start" name="settings" /><span>Налаштування</span></a
                    >
                  </li>
                </ul>
              </section>
            </nav>
            <p class="demo-sidebar-footer" data-rail="hidden">План Team · 72% квоти</p>
          </ng-template>

          <header class="demo-sidebar-top">
            <button vdButton vdSidebarToggle variant="ghost" iconOnly aria-label="Навігація">
              <vd-icon name="panel-left" />
            </button>
            <span class="demo-sidebar-crumb">{{ title() }}</span>
          </header>
          <main class="demo-sidebar-main" aria-labelledby="sidebar-page-title">
            <h3 id="sidebar-page-title">{{ title() }}</h3>
            <p>Вміст сторінки займає решту ширини; у режимі rail він отримує більше місця.</p>
          </main>
        </vd-sidebar-layout>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="sidebar-rtl">
      <div class="demo-section__head">
        <h2 id="sidebar-rtl">RTL, collapsed</h2>
        <p>The panel docks on the inline-start edge, which is the right side in RTL.</p>
      </div>
      <div class="demo-sidebar-frame" dir="rtl" lang="ar">
        <vd-sidebar-layout label="التنقل" closeLabel="إغلاق" [collapsed]="true">
          <ng-template vdSidebar>
            <nav vdNavigationList label="مساحة العمل">
              <ul role="list">
                <li>
                  <a vdNavigationLink href="#sidebar-rtl" aria-current="page"
                    ><vd-icon slot="start" name="layout-dashboard" /><span>نظرة عامة</span></a
                  >
                </li>
                <li>
                  <a vdNavigationLink href="#sidebar-rtl"
                    ><vd-icon slot="start" name="folder" /><span>المشاريع</span></a
                  >
                </li>
                <li>
                  <a vdNavigationLink href="#sidebar-rtl"
                    ><vd-icon slot="start" name="users" /><span>أعضاء الفريق</span></a
                  >
                </li>
              </ul>
            </nav>
          </ng-template>
          <header class="demo-sidebar-top">
            <button vdButton vdSidebarToggle variant="ghost" iconOnly aria-label="التنقل">
              <vd-icon name="panel-left" />
            </button>
          </header>
          <div class="demo-sidebar-main"><p>محتوى الصفحة</p></div>
        </vd-sidebar-layout>
      </div>
    </section>
  `,
  styles: `
    .demo-sidebar-frame vd-sidebar-layout {
      --vd-sidebar-block-size: 28rem;
    }
    .demo-sidebar-frame {
      overflow: hidden;
      border: var(--vd-border-width) solid var(--vd-color-border);
      border-radius: var(--vd-radius-lg);
    }
    .demo-sidebar-brand {
      display: flex;
      align-items: center;
      gap: var(--vd-space-2);
      margin: 0;
      padding: var(--vd-space-2) var(--vd-space-3);
      font-weight: var(--vd-weight-bold);
    }
    .demo-sidebar-footer {
      margin-block: auto 0;
      padding-inline: var(--vd-space-3);
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-xs);
    }
    .demo-sidebar-top {
      display: flex;
      align-items: center;
      gap: var(--vd-space-2);
      padding: var(--vd-space-2) var(--vd-space-4);
      border-block-end: var(--vd-border-width) solid var(--vd-color-border);
    }
    .demo-sidebar-crumb {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-sidebar-main {
      padding: var(--vd-space-6);
    }
    .demo-sidebar-main h3 {
      margin-block-end: var(--vd-space-2);
      font-size: var(--vd-text-xl);
    }
  `,
})
export default class SidebarPage {
  protected readonly collapsed = signal(false);
  protected readonly sections: DemoSection[] = [
    { id: 'overview', label: 'Огляд', icon: 'layout-dashboard' },
    { id: 'projects', label: 'Проєкти', icon: 'folder', count: 4, countLabel: 'активних проєкти' },
    { id: 'people', label: 'Учасники', icon: 'users', count: 12, countLabel: 'учасників' },
    { id: 'files', label: 'Документи', icon: 'file' },
  ];
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap);
  protected readonly title = computed(() => {
    const id = this.params()?.get('section') ?? 'overview';
    if (id === 'settings') return 'Налаштування';
    return this.sections.find((s) => s.id === id)?.label ?? 'Огляд';
  });
}
