import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VdSlider } from '@vadem/ui/slider';

@Component({
  selector: 'demo-slider',
  imports: [ReactiveFormsModule, VdButton, VdField, VdSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Slider</p>
      <h1>Slider</h1>
      <p>
        A native range input: arrows, PageUp/PageDown and Home/End work out of the box, forms bind
        to it directly. Show the value beside it.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="basic">
      <div class="demo-section__head">
        <p class="vd-eyebrow">input[type=range][vdSlider] · vd-field</p>
        <h2 id="basic">Basic</h2>
      </div>
      <div class="demo-panel demo-stack">
        <vd-field label="Прозорість фону" [hint]="opacity() + '%'">
          <input
            type="range"
            vdSlider
            min="0"
            max="100"
            [value]="opacity()"
            [attr.aria-valuetext]="opacity() + ' відсотків'"
            (input)="opacity.set($any($event.target).valueAsNumber)"
          />
        </vd-field>
        <div class="demo-preview" [style.--demo-alpha]="opacity() / 100"></div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="form">
      <div class="demo-section__head">
        <p class="vd-eyebrow">reactive forms · step · programmatic value</p>
        <h2 id="form">In a form</h2>
        <p>Buttons write the value through the form; the fill follows.</p>
      </div>
      <div class="demo-panel demo-stack">
        <vd-field label="Бюджет на місяць" [hint]="budgetText()">
          <input
            type="range"
            vdSlider
            min="0"
            max="50000"
            step="500"
            [formControl]="budget"
            [attr.aria-valuetext]="budgetText()"
          />
        </vd-field>
        <div class="demo-row">
          <button vdButton size="sm" (click)="budget.setValue(5000)">₴ 5 000</button>
          <button vdButton size="sm" (click)="budget.setValue(25000)">₴ 25 000</button>
          <button vdButton size="sm" (click)="budget.setValue(50000)">Максимум</button>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="states">
      <div class="demo-section__head">
        <p class="vd-eyebrow">invalid · disabled · RTL</p>
        <h2 id="states">States</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-panel">
          <vd-field label="Ліміт запитів" error="Більше, ніж дозволяє ваш план">
            <input type="range" vdSlider min="0" max="100" value="90" invalid />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Реплік у регіоні" hint="Змінює адміністратор">
            <input type="range" vdSlider min="1" max="5" value="2" disabled />
          </vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field label="مستوى الصوت">
            <input type="range" vdSlider min="0" max="100" value="30" />
          </vd-field>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-stack {
      display: grid;
      gap: var(--vd-space-5);
      max-inline-size: 32rem;
    }
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-2);
    }
    .demo-preview {
      block-size: var(--vd-space-16);
      border-radius: var(--vd-radius-lg);
      border: var(--vd-border-width) solid var(--vd-color-border);
      background: color-mix(
        in oklch,
        var(--vd-color-action) calc(var(--demo-alpha) * 100%),
        transparent
      );
    }
  `,
})
export default class SliderPage {
  protected readonly opacity = signal(60);
  protected readonly budget = new FormControl(12000, { nonNullable: true });
  private readonly money = new Intl.NumberFormat('uk-UA');
  private readonly budgetValue = signal(this.budget.value);
  protected readonly budgetText = computed(() => `₴ ${this.money.format(this.budgetValue())}`);

  constructor() {
    this.budget.valueChanges.subscribe((v) => this.budgetValue.set(v));
  }
}
