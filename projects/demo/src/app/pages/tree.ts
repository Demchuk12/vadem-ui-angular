import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VD_TREE } from '@vadem/ui/tree';
import { VdButton } from '@vadem/ui/button';

@Component({
  selector: 'demo-tree',
  imports: [VD_TREE, VdButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Tree view</p>
      <h1>Tree view</h1>
      <p>
        Explore a hierarchy without losing your place. Arrows move focus; Enter or Space chooses an
        item. Opening a branch preserves selection.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="tree-projects">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Single selection · independent focus</p>
        <h2 id="tree-projects">Project explorer</h2>
        <p>Use the chevron to reveal a branch. Type a label to jump to a visible item.</p>
      </div>
      <div class="demo-panel">
        <ul vdTree label="Файли проєкту" [(value)]="selected" [disabled]="disabled()">
          <li vdTreeItem value="project" label="Vadem UI" [(expanded)]="projectOpen">
            <ul vdTreeGroup>
              <li vdTreeItem value="components" label="Компоненти" [(expanded)]="componentsOpen">
                <ul vdTreeGroup>
                  <li vdTreeItem value="button" label="Кнопка"></li>
                  <li vdTreeItem value="field" label="Поле введення"></li>
                  <li vdTreeItem value="tags" label="Теги"></li>
                  @if (showTree()) {
                    <li vdTreeItem value="tree" label="Дерево навігації"></li>
                  }
                </ul>
              </li>
              <li vdTreeItem value="docs" label="Документація" [expanded]="true">
                <ul vdTreeGroup>
                  <li vdTreeItem value="guide" label="Інструкція користувача"></li>
                  <li vdTreeItem value="a11y" label="Доступність: і, ї, є, ґ"></li>
                </ul>
              </li>
              <li vdTreeItem value="archive" label="Архів (недоступний)" disabled></li>
            </ul>
          </li>
          <li vdTreeItem value="readme" label="README.md"></li>
        </ul>
        <p class="demo-token">Selected: {{ selected() ?? '—' }}</p>
        <div class="demo-row">
          <button vdButton variant="secondary" (click)="componentsOpen.set(!componentsOpen())">
            Перемкнути гілку
          </button>
          <button vdButton variant="ghost" (click)="showTree.set(!showTree())">
            Перемкнути елемент
          </button>
          <button vdButton variant="ghost" (click)="disabled.set(!disabled())">
            Перемкнути доступність
          </button>
          <button vdButton variant="ghost" (click)="selected.set(null)">Очистити вибір</button>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="tree-states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Collapsed · disabled · empty</p>
        <h2 id="tree-states">Every state has a place</h2>
      </div>
      <div class="demo-grid demo-tree-states" style="--demo-min: 18rem">
        <div class="demo-panel">
          <h3 id="collapsed-label">Закриті гілки</h3>
          <ul vdTree label="Закриті гілки">
            <li vdTreeItem value="design" label="Дизайн">
              <ul vdTreeGroup>
                <li vdTreeItem value="tokens" label="Токени"></li>
              </ul>
            </li>
            <li vdTreeItem value="engineering" label="Розробка">
              <ul vdTreeGroup>
                <li vdTreeItem value="source" label="Вихідний код"></li>
              </ul>
            </li>
            <li vdTreeItem value="locked" label="Захищена гілка" disabled>
              <ul vdTreeGroup>
                <li vdTreeItem value="secret" label="Внутрішні документи"></li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="demo-panel">
          <h3>Лише перегляд структури</h3>
          <ul vdTree label="Недоступна структура" disabled value="saved">
            <li vdTreeItem value="saved" label="Збережені матеріали" [expanded]="true">
              <ul vdTreeGroup>
                <li vdTreeItem value="draft" label="Чернетки"></li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="demo-panel">
          <h3>Новий проєкт</h3>
          <ul vdTree label="Порожній проєкт"></ul>
          <p>Тут з’являться папки та документи вашого проєкту.</p>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="tree-content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Real content · RTL</p>
        <h2 id="tree-content">Long labels keep their meaning</h2>
        <p>Nested rows wrap fully; indentation follows the reading direction.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 24rem">
        <div class="demo-panel">
          <ul vdTree label="Напрями роботи">
            <li
              vdTreeItem
              value="team"
              label="Напрями роботи української команди з покращення доступності інтерфейсів"
              [expanded]="true"
            >
              <ul vdTreeGroup>
                <li
                  vdTreeItem
                  value="keyboard"
                  label="Перевірка доступності для користувачів клавіатури"
                  [expanded]="true"
                >
                  <ul vdTreeGroup>
                    <li
                      vdTreeItem
                      value="identifier"
                      label="ДужеДовгийНерозділенийІдентифікаторДляПеревіркиПеренесенняТексту"
                    ></li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <ul vdTree label="ملفات المشروع">
            <li vdTreeItem value="arabic-project" label="المشروع" [expanded]="true">
              <ul vdTreeGroup>
                <li vdTreeItem value="arabic-design" label="التصميم">
                  <ul vdTreeGroup>
                    <li vdTreeItem value="arabic-guide" label="دليل المستخدم"></li>
                  </ul>
                </li>
                <li vdTreeItem value="arabic-docs" label="الوثائق"></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-tree-states h3 {
      font-size: var(--vd-text-lg);
      margin-block-end: var(--vd-space-3);
    }
  `,
})
export default class TreePage {
  protected readonly selected = signal<string | null>('button');
  protected readonly projectOpen = signal(true);
  protected readonly componentsOpen = signal(true);
  protected readonly showTree = signal(true);
  protected readonly disabled = signal(false);
}
