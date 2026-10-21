import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { VdColorPicker } from '@vadem/ui/color-picker';
import { VdField } from '@vadem/ui/field';
import { VdButton } from '@vadem/ui/button';

@Component({
  selector: 'demo-color-picker',
  imports: [VdColorPicker, VdField, VdButton, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-color-stack {
      display: grid;
      gap: var(--vd-space-4);
      min-inline-size: 0;
    }
    .demo-color-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Color picker</p>
      <h1>Color picker</h1>
      <p>A named palette for quick choices. A HEX field for the exact shade.</p>
    </header>
    <section class="demo-section" aria-labelledby="color-main-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Project identity</p>
        <h2 id="color-main-title">Give your workspace a color</h2>
        <p>Choose a swatch or enter a HEX value. Confirm to save your choice.</p>
      </div>
      <form class="demo-panel demo-color-stack" (submit)="save($event)">
        <vd-field
          label="Колір робочого простору"
          hint="Оберіть із палітри або введіть HEX"
          error="Оберіть колір перед збереженням"
        >
          <vd-color-picker
            [formControl]="color"
            [swatches]="palette"
            placeholder="Оберіть колір"
            pickerLabel="Колір робочого простору"
            hexLabel="Колір HEX"
            paletteLabel="Палітра кольорів"
            applyLabel="Обрати колір"
            errorLabel="Введіть HEX, наприклад #6D4BD3"
            (valueChange)="saved.set(false)"
          />
        </vd-field>
        <p data-testid="color-value">{{ color.value || 'Колір ще не обрано' }}</p>
        <div class="demo-row demo-color-actions">
          <button vdButton type="submit">Зберегти колір</button
          ><button
            vdButton
            type="button"
            variant="secondary"
            (click)="color.disabled ? color.enable() : color.disable()"
          >
            Перемкнути доступність</button
          ><button vdButton type="button" variant="ghost" (click)="color.reset(); saved.set(false)">
            Скинути колір
          </button>
        </div>
        <p role="status" data-testid="color-status">
          {{ saved() ? 'Демонстраційний колір збережено' : 'Оберіть колір і підтвердьте його' }}
        </p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="color-states-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Sizes and states</p>
        <h2 id="color-states-title">Small choices, consistent controls</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 20rem">
        @for (size of sizes; track size) {
          <div class="demo-panel">
            <vd-field [label]="'Розмір ' + size"
              ><vd-color-picker [size]="size" value="#6D4BD3" [swatches]="palette"
            /></vd-field>
          </div>
        }
        <div class="demo-panel">
          <vd-field label="Опублікований колір"
            ><vd-color-picker value="#23856D" readonly
          /></vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Недоступний колір"
            ><vd-color-picker value="#D36C44" disabled
          /></vd-field>
        </div>
        <div class="demo-panel">
          <vd-field label="Колір потрібен" error="Оберіть колір"
            ><vd-color-picker invalid required
          /></vd-field>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="color-signal-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signal Forms</p>
        <h2 id="color-signal-title">An exact shade without a palette</h2>
      </div>
      <div class="demo-panel demo-color-stack">
        <vd-field label="Колір категорії" error="Укажіть колір"
          ><vd-color-picker
            [formField]="categoryForm.color"
            pickerLabel="Колір категорії"
            hexLabel="Колір HEX"
            applyLabel="Обрати колір"
        /></vd-field>
        <p data-testid="color-signal-value">{{ category().color }}</p>
        <button
          vdButton
          type="button"
          variant="secondary"
          (click)="category.set({ color: '#23856D' })"
        >
          Установити зелений
        </button>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="color-content-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Real content</p>
        <h2 id="color-content-title">Readable in every language</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 22rem">
        <div class="demo-panel">
          <vd-field
            label="Колір категорії українськомовних матеріалів для співпраці з командою"
            hint="І, ї, є, ґ — назви залишаються читабельними"
            ><vd-color-picker [swatches]="palette" placeholder="Оберіть колір категорії"
          /></vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field label="لون مساحة العمل"
            ><vd-color-picker
              value="#6D4BD3"
              [swatches]="arabicPalette"
              pickerLabel="اختر اللون"
              hexLabel="لون HEX"
              paletteLabel="لوحة الألوان"
              applyLabel="تطبيق اللون"
              errorLabel="أدخل لون HEX صالحًا"
          /></vd-field>
        </div>
      </div>
    </section>
  `,
})
export default class ColorPickerPage {
  readonly sizes = ['sm', 'md', 'lg'] as const;
  readonly palette = [
    { value: '#6D4BD3', label: 'Фіолетовий' },
    { value: '#336FCC', label: 'Синій' },
    { value: '#23856D', label: 'Зелений' },
    { value: '#D36C44', label: 'Теракотовий' },
    { value: '#BA4575', label: 'Малиновий' },
    { value: '#C99B32', label: 'Золотистий' },
    { value: '#FFFFFF', label: 'Білий' },
    { value: '#20202A', label: 'Графітовий' },
  ];
  readonly arabicPalette = this.palette.map((swatch, i) => ({
    ...swatch,
    label: ['بنفسجي', 'أزرق', 'أخضر', 'برتقالي', 'وردي', 'ذهبي', 'أبيض', 'رمادي'][i],
  }));
  readonly color = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/)],
  });
  readonly saved = signal(false);
  readonly category = signal({ color: '' });
  readonly categoryForm = form(this.category, (p) => required(p.color));
  save(event: Event): void {
    event.preventDefault();
    this.color.markAsTouched();
    this.saved.set(this.color.enabled && this.color.valid);
  }
}
