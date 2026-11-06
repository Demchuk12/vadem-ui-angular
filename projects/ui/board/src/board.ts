import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { vdTexts } from '@vadem/ui/locale';

export type VdBoardCellState = 'open' | 'active' | 'played';

/**
 * One tile of a board. On `<button>` it is a choice; on `<div>` a read-only view of the same tile.
 * Spec: specs/board.md
 */
@Component({
  // Attribute selector keeps the native element and its semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[vdBoardCell], div[vdBoardCell]',
  template: `
    <span class="vd-board-cell__value"><ng-content /></span>
    @if (state() === 'played') {
      <span class="vd-visually-hidden">{{ t().playedLabel }}</span>
    }
  `,
  host: {
    class: 'vd-board-cell',
    '[attr.data-state]': 'state()',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.disabled]': 'isButton && state() === "played" ? "" : null',
    '[attr.aria-current]': 'state() === "active" ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdBoardCell {
  readonly state = input<VdBoardCellState>('open');
  /** Spoken in place of the hidden value of a played tile. */
  readonly playedLabel = input<string>();

  protected readonly t = vdTexts('board', { playedLabel: this.playedLabel });
  protected readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
}

/** A titled column of tiles; titles of all columns share one row. Spec: specs/board.md */
@Component({
  selector: 'vd-board-column',
  template: `
    <div class="vd-board-column__heading" aria-hidden="true">{{ heading() }}</div>
    <ng-content />
  `,
  host: {
    class: 'vd-board-column',
    role: 'group',
    '[attr.aria-label]': 'heading()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdBoardColumn {
  readonly heading = input.required<string>();
}

/**
 * A grid of titled columns of tiles. Below 40rem of its own width each column becomes a row, so
 * it fits a phone without scrolling sideways. Spec: specs/board.md
 */
@Component({
  selector: 'vd-board',
  template: `<div class="vd-board__grid"><ng-content /></div>`,
  host: {
    class: 'vd-board',
    role: 'group',
    '[attr.aria-label]': 'label()',
    '[style.--vd-board-columns]': 'columnCount()',
    '[style.--vd-board-rows]': 'rows()',
    '[style.--vd-board-column-span]': 'rows() + 1',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdBoard {
  readonly label = input.required<string>();
  /** Tiles per column. */
  readonly rows = input(5);

  private readonly columns = contentChildren(forwardRef(() => VdBoardColumn));
  protected readonly columnCount = computed(() => Math.max(this.columns().length, 1));
}

export const VD_BOARD = [VdBoard, VdBoardColumn, VdBoardCell] as const;
