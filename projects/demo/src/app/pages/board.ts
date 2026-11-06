import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VD_BOARD, type VdBoardCellState } from '@vadem/ui/board';

const CATEGORIES = ['Історія', 'Кіно', 'Географія', 'Наука й технології', 'Музика', 'Мови'];
const VALUES = [200, 400, 600, 800, 1000];

@Component({
  selector: 'demo-board',
  imports: [VD_BOARD],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-board-narrow {
      max-inline-size: 22rem;
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Board</p>
      <h1>Board</h1>
      <p>
        Titled columns of value tiles. Played tiles keep their place, so the board never shifts.
        Below 40rem of its own width every column becomes a row.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="board-live">
      <div class="demo-section__head">
        <h2 id="board-live">Choosing</h2>
        <p>Buttons: pick a tile to make it active, pick another to finish the previous one.</p>
      </div>
      <vd-board label="Раунд 1">
        @for (category of categories; track category) {
          <vd-board-column [heading]="category">
            @for (value of values; track value) {
              <button
                vdBoardCell
                [state]="stateOf(category, value)"
                (click)="pick(category, value)"
              >
                {{ value }}
              </button>
            }
          </vd-board-column>
        }
      </vd-board>
    </section>

    <section class="demo-section" aria-labelledby="board-watch">
      <div class="demo-section__head">
        <h2 id="board-watch">Watching, narrow</h2>
        <p>The same tiles on div elements: nothing to press. Width follows the container.</p>
      </div>
      <div class="demo-board-narrow">
        <vd-board label="Раунд 2" [rows]="3">
          <vd-board-column heading="Наука й технології">
            <div vdBoardCell state="played">400</div>
            <div vdBoardCell state="active">800</div>
            <div vdBoardCell>1200</div>
          </vd-board-column>
          <vd-board-column heading="Кіно">
            <div vdBoardCell>400</div>
            <div vdBoardCell state="played">800</div>
            <div vdBoardCell>1200</div>
          </vd-board-column>
        </vd-board>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="board-rtl" dir="rtl">
      <div class="demo-section__head">
        <h2 id="board-rtl">RTL</h2>
      </div>
      <vd-board label="جولة" [rows]="2">
        <vd-board-column heading="تاريخ">
          <button vdBoardCell>200</button>
          <button vdBoardCell state="played">400</button>
        </vd-board-column>
        <vd-board-column heading="موسيقى">
          <button vdBoardCell state="active">200</button>
          <button vdBoardCell>400</button>
        </vd-board-column>
      </vd-board>
    </section>
  `,
})
export default class BoardPage {
  protected readonly categories = CATEGORIES;
  protected readonly values = VALUES;
  private readonly active = signal<string | null>(null);
  private readonly played = signal<ReadonlySet<string>>(new Set(['Кіно:200', 'Мови:600']));

  protected stateOf(category: string, value: number): VdBoardCellState {
    const key = `${category}:${value}`;
    if (this.active() === key) return 'active';
    return this.played().has(key) ? 'played' : 'open';
  }

  protected pick(category: string, value: number): void {
    const previous = this.active();
    if (previous) this.played.update((set) => new Set(set).add(previous));
    this.active.set(`${category}:${value}`);
  }
}
