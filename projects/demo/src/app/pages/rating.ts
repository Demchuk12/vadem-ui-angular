import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, min, max, required } from '@angular/forms/signals';
import { VdRating } from '@vadem/ui/rating';
import { VdField } from '@vadem/ui/field';
import { VdButton } from '@vadem/ui/button';

@Component({
  selector: 'demo-rating',
  imports: [VdRating, VdField, VdButton, ReactiveFormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-rating-stack {
      display: grid;
      gap: var(--vd-space-4);
      min-inline-size: 0;
    }
    .demo-rating-stack .demo-panel {
      padding-inline: min(var(--vd-space-6), 5%);
    }
    .demo-rating-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-3);
    }
    .demo-rating-score {
      font-family: var(--vd-font-mono);
      font-variant-numeric: tabular-nums;
      color: var(--vd-color-text-muted);
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Rating</p>
      <h1>Rating</h1>
      <p>A small choice with a clear meaning. Give your experience one to five stars.</p>
    </header>
    <section class="demo-section" aria-labelledby="rating-review-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Feedback</p>
        <h2 id="rating-review-title">How did the conversation go?</h2>
        <p>Choose a star, or use the arrow keys. Your review is saved only when you confirm.</p>
      </div>
      <form class="demo-panel demo-rating-stack" (submit)="save($event)">
        <vd-field hint="1 — не сподобалося, 5 — чудово" error="Оберіть оцінку від 1 до 5">
          <vd-rating
            label="Оцініть консультацію"
            [starLabel]="starLabel"
            [formControl]="review"
            (valueChange)="saved.set(false)"
            required
          />
        </vd-field>
        <p class="demo-rating-score" data-testid="rating-value">
          {{ review.value ? review.value + ' / 5' : 'Ще без оцінки' }}
        </p>
        <div class="demo-row demo-rating-actions">
          <button vdButton type="submit">Зберегти оцінку</button>
          <button
            vdButton
            type="button"
            variant="secondary"
            (click)="review.disabled ? review.enable() : review.disable()"
          >
            Перемкнути доступність
          </button>
          <button vdButton type="button" variant="ghost" (click)="review.reset(); saved.set(false)">
            Скинути оцінку
          </button>
        </div>
        <p role="status" data-testid="rating-status" class="demo-token">
          {{ saved() ? 'Демонстраційну оцінку збережено' : 'Оберіть оцінку й підтвердьте її' }}
        </p>
      </form>
    </section>
    <section class="demo-section" aria-labelledby="rating-states-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Sizes and states</p>
        <h2 id="rating-states-title">The same scale in every context</h2>
      </div>
      <div class="demo-grid demo-rating-stack" style="--demo-min: 20rem">
        @for (size of sizes; track size; let i = $index) {
          <div class="demo-panel">
            <vd-field [hint]="size.toUpperCase() + ' · Оцінка ' + (i * 2 + 1) + ' / 5'">
              <vd-rating
                [label]="'Розмір ' + size.toUpperCase()"
                [size]="size"
                [value]="i * 2 + 1"
                [starLabel]="starLabel"
              />
            </vd-field>
          </div>
        }
        <div class="demo-panel">
          <vd-field hint="4 / 5 · Можна переглянути, редагування вимкнено">
            <vd-rating label="Опублікований відгук" [value]="4" readonly [starLabel]="starLabel" />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field hint="2 / 5 · Оцінювання тимчасово недоступне">
            <vd-rating label="Недоступна оцінка" [value]="2" disabled [starLabel]="starLabel" />
          </vd-field>
        </div>
        <div class="demo-panel">
          <vd-field error="Додайте оцінку перед публікацією відгуку">
            <vd-rating label="Оцінка потрібна" invalid required [starLabel]="starLabel" />
          </vd-field>
        </div>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="rating-signal-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Signal Forms</p>
        <h2 id="rating-signal-title">Keep feedback with the form</h2>
      </div>
      <div class="demo-panel demo-rating-stack">
        <vd-field hint="Оберіть від 1 до 5 зірок" error="Оберіть оцінку перед продовженням">
          <vd-rating
            label="Оцініть доставку"
            [formField]="deliveryForm.rating"
            [starLabel]="starLabel"
          />
        </vd-field>
        <p class="demo-rating-score" data-testid="rating-signal-value">
          {{ delivery().rating }} / 5
        </p>
        <button vdButton type="button" variant="secondary" (click)="delivery.set({ rating: 4 })">
          Установити 4 зірки
        </button>
      </div>
    </section>
    <section class="demo-section" aria-labelledby="rating-content-title">
      <div class="demo-section__head">
        <p class="vd-eyebrow">Real content</p>
        <h2 id="rating-content-title">Every experience deserves a readable label</h2>
      </div>
      <div class="demo-grid demo-rating-stack" style="--demo-min: 22rem">
        <div class="demo-panel">
          <vd-field hint="І, ї, є, ґ. Оцінка враховує всю взаємодію з командою.">
            <vd-rating
              label="Наскільки зручно було отримати відповіді на всі запитання українською мовою?"
              [starLabel]="starLabel"
            />
          </vd-field>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <vd-field hint="٤ من ٥ · اختر التقييم المناسب">
            <vd-rating
              label="كيف كانت تجربتك مع الفريق؟"
              [value]="4"
              [starLabel]="arabicStarLabel"
            />
          </vd-field>
        </div>
      </div>
    </section>
  `,
})
export default class RatingPage {
  readonly sizes = ['sm', 'md', 'lg'] as const;
  readonly review = new FormControl(0, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(1), Validators.max(5)],
  });
  readonly saved = signal(false);
  readonly delivery = signal({ rating: 0 });
  readonly deliveryForm = form(this.delivery, (p) => {
    required(p.rating);
    min(p.rating, 1);
    max(p.rating, 5);
  });
  readonly starLabel = (value: number) => `${value} з 5 зірок`;
  readonly arabicStarLabel = (value: number) => `${value} من 5 نجوم`;
  save(event: Event): void {
    event.preventDefault();
    this.review.markAsTouched();
    this.saved.set(this.review.enabled && this.review.valid);
  }
}
