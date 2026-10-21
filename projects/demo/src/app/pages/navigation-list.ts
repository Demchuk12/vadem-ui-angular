import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { VdBadge } from '@vadem/ui/badge';
import { VdIcon, type VdIconName } from '@vadem/ui/icon';
import { VD_NAVIGATION_LIST } from '@vadem/ui/navigation-list';

@Component({
  selector: 'demo-navigation-list',
  imports: [VD_NAVIGATION_LIST, VdBadge, VdIcon, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Navigation list</p>
      <h1>Navigation list</h1>
      <p>
        Grouped destinations with native links. Current location comes from your application or
        router.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="workspace-title">
      <div class="demo-section__head">
        <h2 id="workspace-title">Workspace navigation</h2>
        <p>
          Choose a destination, open it in another tab, or use browser history. The examples stay
          within this gallery page.
        </p>
      </div>
      <div class="demo-navigation-layout">
        <div class="demo-panel">
          <nav vdNavigationList label="Робочий простір">
            <section aria-labelledby="navigation-work">
              <h3 vdNavigationLabel id="navigation-work">Робочі розділи</h3>
              <ul role="list">
                @for (item of items; track item.id) {
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
            <section aria-labelledby="navigation-tools">
              <h3 vdNavigationLabel id="navigation-tools">Ресурси</h3>
              <ul role="list">
                <li>
                  <a vdNavigationLink href="#navigation-guidance"
                    ><vd-icon name="info" slot="start" /><span>Поради щодо навігації</span></a
                  >
                </li>
                <li>
                  <a
                    vdNavigationLink
                    href="/navigation-list?section=help"
                    target="_blank"
                    rel="noopener"
                    ><vd-icon name="external-link" slot="start" /><span
                      >Довідка<span class="vd-visually-hidden"> (нова вкладка)</span></span
                    ></a
                  >
                </li>
              </ul>
            </section>
          </nav>
        </div>
        <div class="demo-panel demo-navigation-destination" aria-labelledby="destination-title">
          <h3 id="destination-title">{{ destination().title }}</h3>
          <p>{{ destination().description }}</p>
          <p class="demo-token" data-testid="navigation-route">Розділ: {{ section() }}</p>
          <p class="demo-navigation-note">
            Це демонстраційні розділи. Лічильники показують приклад даних робочого простору.
          </p>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="navigation-content">
      <div class="demo-section__head">
        <h2 id="navigation-content">Long labels, metadata and RTL</h2>
        <p>
          Labels wrap completely. At narrow widths, metadata moves below the text rather than
          squeezing it.
        </p>
      </div>
      <div class="demo-grid" style="--demo-min: min(20rem, 100%)">
        <div class="demo-panel">
          <nav vdNavigationList label="Документи команди">
            <ul role="list">
              <li>
                <a vdNavigationLink href="#navigation-guidance"
                  ><vd-icon name="file" slot="start" /><span
                    >Документи для погодження міжнародної співпраці української команди</span
                  ><span vdBadge slot="end"
                    >128<span class="vd-visually-hidden"> документів</span></span
                  ></a
                >
              </li>
              <li>
                <a vdNavigationLink href="#navigation-guidance"
                  ><span>Спільні матеріали для відповідальних учасників виробничої зміни</span
                  ><span vdBadge slot="end"
                    >24<span class="vd-visually-hidden"> матеріали</span></span
                  ></a
                >
              </li>
              <li>
                <a vdNavigationLink href="#navigation-guidance"
                  ><span><bdi>UA2026QUALITYASSURANCEPRODUCTIONDOCUMENTATION</bdi></span></a
                >
              </li>
            </ul>
          </nav>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <nav vdNavigationList label="مساحة عمل الفريق">
            <section aria-labelledby="navigation-arabic">
              <h3 vdNavigationLabel id="navigation-arabic">مساحة العمل</h3>
              <ul role="list">
                <li>
                  <a vdNavigationLink href="/navigation-list" aria-current="page"
                    ><vd-icon name="layout-dashboard" slot="start" /><span>نظرة عامة</span></a
                  >
                </li>
                <li>
                  <a vdNavigationLink href="#navigation-guidance"
                    ><vd-icon name="folder" slot="start" /><span
                      >المستندات المطلوبة للمراجعة والموافقة من فريق الجودة</span
                    ><span vdBadge slot="end"
                      >١٢<span class="vd-visually-hidden"> مستندًا</span></span
                    ></a
                  >
                </li>
                <li>
                  <a vdNavigationLink href="#navigation-guidance"
                    ><vd-icon name="users" slot="start" /><span>أعضاء الفريق</span
                    ><span vdBadge slot="end"
                      >٨<span class="vd-visually-hidden"> أعضاء</span></span
                    ></a
                  >
                </li>
              </ul>
            </section>
          </nav>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="navigation-simple">
      <div class="demo-section__head">
        <h2 id="navigation-simple">Simple links and empty groups</h2>
        <p>
          Icons and counts are optional. Destinations that are not available do not need a disabled
          link.
        </p>
      </div>
      <div class="demo-grid" style="--demo-min: min(20rem, 100%)">
        <div class="demo-panel">
          <nav vdNavigationList label="Матеріали бібліотеки">
            <ul role="list">
              <li>
                <a vdNavigationLink routerLink="/description-list"><span>Description list</span></a>
              </li>
              <li>
                <a vdNavigationLink routerLink="/autocomplete"><span>Autocomplete</span></a>
              </li>
            </ul>
          </nav>
        </div>
        <div class="demo-panel">
          <h3>Збережених розділів ще немає</h3>
          <p>Тут з’являться посилання на розділи, які ви додасте до обраного.</p>
        </div>
      </div>
    </section>
    <section class="demo-section demo-panel" aria-labelledby="navigation-guidance">
      <h2 id="navigation-guidance" tabindex="-1">Поради щодо навігації</h2>
      <p>
        Tab переходить між посиланнями, Enter відкриває вибраний розділ. Поточний розділ має
        кольорову позначку на початку рядка та виразніший текст.
      </p>
    </section>
  `,
  styles: `
    .demo-navigation-layout {
      display: grid;
      grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
      gap: var(--vd-space-6);
      align-items: start;
    }
    .demo-navigation-destination {
      display: grid;
      gap: var(--vd-space-4);
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }
    .demo-navigation-note {
      font-size: var(--vd-text-sm);
      color: var(--vd-color-text-muted);
    }
    h3 {
      font-size: var(--vd-text-base);
    }
    .vd-navigation-label {
      font-size: var(--vd-navigation-list-label-size);
    }
    @media (width < 60rem) {
      .demo-navigation-layout {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export default class NavigationListPage {
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap);
  protected readonly section = computed(() => this.params()?.get('section') ?? 'overview');
  protected readonly destination = computed(
    () =>
      ({
        overview: {
          title: 'Огляд робочого простору',
          description: 'Проєкти, учасники й документи команди в одному місці.',
        },
        projects: {
          title: 'Проєкти команди',
          description: 'Чотири активні проєкти готові до перегляду.',
        },
        people: {
          title: 'Учасники',
          description: 'Учасники виробництва, контролю якості та підтримки.',
        },
        archive: {
          title: 'Архів документів',
          description: 'Архів поки порожній. Завершені документи з’являться тут після перенесення.',
        },
        help: {
          title: 'Довідка',
          description: 'Поради щодо роботи з розділами та швидкої навігації.',
        },
      })[this.section()] ?? {
        title: 'Розділ не знайдено',
        description: 'Оберіть доступний розділ у навігації.',
      },
  );
  protected readonly items: readonly {
    id: string;
    label: string;
    icon: VdIconName;
    count?: number;
    countLabel?: string;
  }[] = [
    { id: 'overview', label: 'Огляд', icon: 'layout-dashboard' },
    { id: 'projects', label: 'Проєкти', icon: 'folder', count: 4, countLabel: 'активні проєкти' },
    { id: 'people', label: 'Учасники', icon: 'users', count: 12, countLabel: 'учасників' },
    { id: 'archive', label: 'Архів', icon: 'file', count: 0, countLabel: 'документів' },
  ];
}
