import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VdBreadcrumbs } from '@vadem/ui/breadcrumbs';
import { VdIcon } from '@vadem/ui/icon';

@Component({
  selector: 'demo-breadcrumbs',
  imports: [VdBreadcrumbs, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Breadcrumbs</p>
      <h1>Breadcrumbs</h1>
      <p>
        Where this page sits and how to go up. A navigation landmark with an ordered list; the
        current page is marked, not linked. Separators are drawn in CSS and mirror in RTL.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="basic">
      <div class="demo-section__head">
        <p class="vd-eyebrow">nav[vdBreadcrumbs] · aria-current="page"</p>
        <h2 id="basic">Basic</h2>
      </div>
      <div class="demo-panel demo-stack">
        <nav vdBreadcrumbs label="Ланцюжок: налаштування проєкту">
          <ol>
            <li><a href="#basic">Проєкти</a></li>
            <li><a href="#basic">Платформа оплат</a></li>
            <li><span aria-current="page">Налаштування</span></li>
          </ol>
        </nav>
        <nav vdBreadcrumbs label="Ланцюжок: з іконкою">
          <ol>
            <li>
              <a href="#basic" class="demo-home"><vd-icon name="layout-dashboard" />Огляд</a>
            </li>
            <li><a href="#basic">Розгортання</a></li>
            <li><span aria-current="page">dpl_8f2a</span></li>
          </ol>
        </nav>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">long names · narrow · RTL</p>
        <h2 id="content">Real content</h2>
        <p>Long names truncate (the current page keeps more room); narrow widths wrap.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <nav vdBreadcrumbs label="Ланцюжок: довгі назви">
            <ol>
              <li>
                <a href="#content" title="Робочий простір компанії «Ромашка Лабс»"
                  >Робочий простір компанії «Ромашка Лабс»</a
                >
              </li>
              <li><a href="#content">Аналітика</a></li>
              <li>
                <span aria-current="page" title="Когортний аналіз утримання за третій квартал"
                  >Когортний аналіз утримання за третій квартал</span
                >
              </li>
            </ol>
          </nav>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <nav vdBreadcrumbs label="مسار التنقل">
            <ol>
              <li><a href="#content">المشاريع</a></li>
              <li><a href="#content">الدفع</a></li>
              <li><span aria-current="page">الإعدادات</span></li>
            </ol>
          </nav>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-stack {
      display: grid;
      gap: var(--vd-space-5);
    }
    .demo-home {
      display: inline-flex;
      align-items: center;
      gap: var(--vd-space-1-5);
    }
  `,
})
export default class BreadcrumbsPage {}
