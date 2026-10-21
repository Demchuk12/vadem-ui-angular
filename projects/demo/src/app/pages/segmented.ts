import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdIcon } from '@vadem/ui/icon';
import { VdSegment, VdSegmented, VdSegmentedSize } from '@vadem/ui/segmented';

@Component({
  selector: 'demo-segmented',
  imports: [ReactiveFormsModule, VdIcon, VdSegment, VdSegmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Segmented</p>
      <h1>Segmented control</h1>
      <p>
        One choice among a few options that change a view or a filter. Native radios underneath:
        arrows move and select, Tab enters at the checked segment. For switching panels of content
        use Tabs.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="sizes">
      <div class="demo-section__head">
        <p class="vd-eyebrow">size · [(value)]</p>
        <h2 id="sizes">Sizes</h2>
      </div>
      <div class="demo-panel demo-stack">
        @for (size of sizes; track size) {
          <div class="demo-row">
            <vd-segmented [size]="size" [attr.aria-label]="'Період, ' + size" [(value)]="period">
              <vd-segment value="day">День</vd-segment>
              <vd-segment value="week">Тиждень</vd-segment>
              <vd-segment value="month">Місяць</vd-segment>
              <vd-segment value="year">Рік</vd-segment>
            </vd-segmented>
            <span class="demo-token">{{ size }}</span>
          </div>
        }
        <p class="demo-token">value: {{ period() }}</p>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="icons">
      <div class="demo-section__head">
        <p class="vd-eyebrow">icons · icon-only · reactive forms</p>
        <h2 id="icons">With icons</h2>
        <p>Icon-only segments are named with <code>aria-label</code>.</p>
      </div>
      <div class="demo-panel demo-row">
        <vd-segmented aria-label="Тема" [formControl]="theme">
          <vd-segment value="light"><vd-icon name="sun" />Світла</vd-segment>
          <vd-segment value="dark"><vd-icon name="moon" />Темна</vd-segment>
          <vd-segment value="auto"><vd-icon name="monitor" />Системна</vd-segment>
        </vd-segmented>
        <vd-segmented aria-label="Тема (компактно)" size="sm" [formControl]="theme">
          <vd-segment value="light" aria-label="Світла"><vd-icon name="sun" /></vd-segment>
          <vd-segment value="dark" aria-label="Темна"><vd-icon name="moon" /></vd-segment>
          <vd-segment value="auto" aria-label="Системна"><vd-icon name="monitor" /></vd-segment>
        </vd-segmented>
        <span class="demo-token">form: {{ theme.value }}</span>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">disabled · empty · full width</p>
        <h2 id="states">States</h2>
      </div>
      <div class="demo-panel demo-stack">
        <vd-segmented aria-label="Тариф" value="team">
          <vd-segment value="free">Free</vd-segment>
          <vd-segment value="team">Team</vd-segment>
          <vd-segment value="business" disabled>Business</vd-segment>
        </vd-segmented>
        <vd-segmented aria-label="Регіон" disabled value="eu">
          <vd-segment value="eu">Європа</vd-segment>
          <vd-segment value="us">США</vd-segment>
        </vd-segmented>
        <vd-segmented aria-label="Без вибору">
          <vd-segment value="a">Нічого не вибрано</vd-segment>
          <vd-segment value="b">Поки що</vd-segment>
        </vd-segmented>
        <vd-segmented aria-label="Вигляд списку" value="table" class="demo-full">
          <vd-segment value="table">Таблиця</vd-segment>
          <vd-segment value="board">Дошка</vd-segment>
          <vd-segment value="calendar">Календар</vd-segment>
        </vd-segmented>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">realistic content</p>
        <h2 id="content">Long labels, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <vd-segmented aria-label="Частота звітів" value="weekly" class="demo-full">
            <vd-segment value="daily">Щоденно</vd-segment>
            <vd-segment value="weekly">Щотижнево</vd-segment>
            <vd-segment value="monthly">Щомісячно</vd-segment>
          </vd-segmented>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-segmented aria-label="الفترة" value="week">
            <vd-segment value="day">يوم</vd-segment>
            <vd-segment value="week">أسبوع</vd-segment>
            <vd-segment value="month">شهر</vd-segment>
          </vd-segmented>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-stack {
      display: grid;
      justify-items: start;
      gap: var(--vd-space-5);
    }
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-4);
    }
    .demo-full {
      inline-size: 100%;
    }
  `,
})
export default class SegmentedPage {
  protected readonly sizes: VdSegmentedSize[] = ['sm', 'md'];
  protected readonly period = signal<string | null>('week');
  protected readonly theme = new FormControl('dark');
}
