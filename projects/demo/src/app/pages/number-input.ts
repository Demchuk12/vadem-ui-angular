import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, min, max } from '@angular/forms/signals';
import { VdButton } from '@vadem/ui/button';
import { VdField } from '@vadem/ui/field';
import { VD_NUMBER_INPUT } from '@vadem/ui/number-input';

@Component({
  selector: 'demo-number-input',
  imports: [VD_NUMBER_INPUT, VdField, VdButton, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Number input</p>
      <h1>Number input</h1>
      <p>
        Native numeric entry with precise steps and bounds. Type a value, use arrow keys, or
        activate the −/+ buttons. Forms keep their native value accessor.
      </p>
    </header>
    <section class="demo-section" aria-labelledby="quantity-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">reactive forms</p>
        <h2 id="quantity-title">Quantity with limits</h2>
        <p>
          An empty field stays empty; a button starts from the native step base. Typed values are
          validated without silently changing them.
        </p>
      </div>
      <form class="demo-panel demo-number-grid" (submit)="$event.preventDefault()">
        <vd-field
          label="Кількість учасників"
          hint="Від 0 до 10 учасників"
          error="Вкажіть ціле число від 0 до 10"
        >
          <vd-number-input decreaseLabel="Зменшити кількість" increaseLabel="Збільшити кількість">
            <input
              vdNumberInput
              type="number"
              min="0"
              max="10"
              step="1"
              [formControl]="quantity"
              required
            />
          </vd-number-input>
        </vd-field>
        <div class="demo-number-actions">
          <p class="demo-token" data-testid="quantity-value">
            Value: {{ quantity.value === null ? 'null (empty)' : quantity.value }}
          </p>
          <button vdButton variant="secondary" type="button" (click)="quantity.setValue(10)">
            Установити 10
          </button>
          <button vdButton variant="ghost" type="button" (click)="quantity.reset()">
            Очистити
          </button>
        </div>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="precision-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">step · min · max</p>
        <h2 id="precision-title">Precision and dynamic bounds</h2>
      </div>
      <div class="demo-panel demo-number-grid">
        <vd-field label="Вага зразка, кг" hint="Крок 0.1, від 0 до 2">
          <vd-number-input decreaseLabel="Зменшити вагу" increaseLabel="Збільшити вагу"
            ><input vdNumberInput type="number" min="0" max="2" step="0.1" value="0.2"
          /></vd-number-input>
        </vd-field>
        <vd-field label="Місця на зустрічі" [hint]="'Максимум: ' + capacity()">
          <vd-number-input decreaseLabel="Прибрати місце" increaseLabel="Додати місце"
            ><input vdNumberInput type="number" min="1" [max]="capacity()" value="3"
          /></vd-number-input>
        </vd-field>
        <button
          vdButton
          variant="secondary"
          type="button"
          (click)="capacity.set(capacity() === 3 ? 8 : 3)"
        >
          Змінити ліміт
        </button>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="sizes-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">size</p>
        <h2 id="sizes-title">Three sizes</h2>
      </div>
      <div class="demo-panel demo-number-grid">
        @for (size of sizes; track size) {
          <vd-field [label]="'Розмір ' + size"
            ><vd-number-input decreaseLabel="Зменшити значення" increaseLabel="Збільшити значення"
              ><input vdNumberInput type="number" [size]="size" value="24" /></vd-number-input
          ></vd-field>
        }
      </div>
    </section>
    <section class="demo-section" aria-labelledby="states-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">states</p>
        <h2 id="states-title">Editing and availability</h2>
        <p>
          At a bound, an action keeps focus and exposes aria-disabled. Disabled and read-only fields
          lock both buttons. With step="any", enter any decimal directly.
        </p>
      </div>
      <div class="demo-panel demo-number-grid">
        <vd-field label="Недоступне"
          ><vd-number-input
            ><input vdNumberInput type="number" value="12" disabled /></vd-number-input
        ></vd-field>
        <vd-field label="Лише читання"
          ><vd-number-input
            ><input vdNumberInput type="number" value="48" readonly /></vd-number-input
        ></vd-field>
        <vd-field label="Поза межами" error="Значення має бути від 0 до 10"
          ><vd-number-input decreaseLabel="Зменшити число" increaseLabel="Збільшити число"
            ><input
              vdNumberInput
              type="number"
              min="0"
              max="10"
              value="15"
              invalid /></vd-number-input
        ></vd-field>
        <vd-field label="Довільний десятковий дріб" hint="Без фіксованого кроку"
          ><vd-number-input
            ><input vdNumberInput type="number" step="any" value="1.2345" /></vd-number-input
        ></vd-field>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="signals-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">signal forms</p>
        <h2 id="signals-title">Native form integration</h2>
      </div>
      <div class="demo-panel demo-number-grid">
        <vd-field label="Дні відпустки" hint="Від 0 до 30 днів" error="Вкажіть число від 0 до 30"
          ><vd-number-input decreaseLabel="Прибрати день" increaseLabel="Додати день"
            ><input
              vdNumberInput
              type="number"
              step="1"
              [formField]="leave.days" /></vd-number-input
        ></vd-field>
        <div class="demo-number-actions">
          <p class="demo-token" data-testid="signal-value">Days: {{ leaveModel().days }}</p>
          <button vdButton variant="secondary" (click)="leaveModel.set({ days: 30 })">
            Установити 30 днів
          </button>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="content-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">real content · rtl</p>
        <h2 id="content-title">Readable in context</h2>
      </div>
      <div class="demo-panel demo-number-grid">
        <vd-field
          label="Кількість додаткових місць для учасників щомісячної зустрічі української команди"
          hint="Зміни застосовуються до наступної зустрічі, поточний склад учасників зберігається."
          ><vd-number-input
            decreaseLabel="Зменшити додаткові місця"
            increaseLabel="Збільшити додаткові місця"
            ><input vdNumberInput type="number" min="0" value="125" /></vd-number-input
        ></vd-field>
        <div dir="rtl" lang="ar">
          <vd-field label="عدد المشاركين" hint="من صفر إلى عشرة"
            ><vd-number-input decreaseLabel="تقليل العدد" increaseLabel="زيادة العدد"
              ><input vdNumberInput type="number" min="0" max="10" value="4" /></vd-number-input
          ></vd-field>
        </div>
      </div>
    </section>
  `,
  styles: `
    .demo-number-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
      gap: var(--vd-space-6);
      align-items: start;
    }
    .demo-number-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
      align-items: center;
    }
    .demo-number-actions p {
      flex-basis: 100%;
    }
  `,
})
export default class NumberInputPage {
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly quantity = new FormControl<number | null>(2, [
    Validators.required,
    Validators.min(0),
    Validators.max(10),
  ]);
  protected readonly capacity = signal(3);
  protected readonly leaveModel = signal({ days: 5 });
  protected readonly leave = form(this.leaveModel, (p) => {
    min(p.days, 0);
    max(p.days, 30);
  });
}
