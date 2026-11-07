import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  input,
  signal,
} from '@angular/core';

/** A score change to show once, e.g. `{ label: '+600', tone: 'gain' }`. */
export interface VdLeaderboardChange {
  /** Formatted by the application, sign included. */
  readonly label: string;
  readonly tone: 'gain' | 'loss';
}

/** How long a change stays on screen; matches the animation in leaderboard.css. */
const CHANGE_MS = 1600;

/** Ordered standings. Sorting and shared ranks belong to the application. Spec: specs/leaderboard.md */
@Directive({
  selector: 'ol[vdLeaderboard]',
  // `list-style: none` removes the list role in Safari; the explicit role restores it.
  host: { class: 'vd-leaderboard', role: 'list' },
})
export class VdLeaderboard {}

/**
 * One line of the standings. `score` arrives formatted by the application (Intl).
 * Spec: specs/leaderboard.md
 */
@Component({
  // Attribute selector keeps the native element and its semantics.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[vdLeaderboardRow]',
  template: `
    <span class="vd-leaderboard__rank">{{ rank() }}</span>
    <span class="vd-leaderboard__main">
      <bdi class="vd-leaderboard__name">{{ name() }}</bdi>
      <ng-content />
    </span>
    <span class="vd-leaderboard__scorebox">
      <bdi class="vd-leaderboard__score" dir="ltr">{{ score() }}</bdi>
      @for (shown of shownChange(); track shown.id) {
        <bdi
          class="vd-leaderboard__change"
          dir="ltr"
          [attr.data-tone]="shown.tone"
          aria-hidden="true"
        >
          {{ shown.label }}
        </bdi>
      }
    </span>
    <ng-content select="[slot=actions]" />
  `,
  host: {
    class: 'vd-leaderboard__row',
    '[attr.data-leader]': 'rank() === 1 ? "" : null',
    '[attr.data-negative]': 'negative() ? "" : null',
    '[attr.data-inactive]': 'inactive() ? "" : null',
    '[attr.aria-current]': 'current() ? "true" : null',
    '[attr.data-change]': 'shownChange()[0]?.tone ?? null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdLeaderboardRow {
  /** Equal scores may share a rank, so it is not derived from the position. */
  readonly rank = input.required<number>();
  readonly name = input.required<string>();
  /** Formatted score, e.g. "1 200" or "−400". */
  readonly score = input.required<string>();
  /** Below zero; a cue in addition to the minus sign in `score`. */
  readonly negative = input(false, { transform: booleanAttribute });
  /** The row of the person looking at the board. */
  readonly current = input(false, { transform: booleanAttribute });
  /** Dims the row, e.g. for a disconnected player. Say why in projected content. */
  readonly inactive = input(false, { transform: booleanAttribute });
  /**
   * Each new object shows once: the label rises from the score and the row flashes in its tone.
   * Pass a new object for every change, even an equal one. Decorative: announce it in the app.
   */
  readonly change = input<VdLeaderboardChange | null>(null);

  private changes = 0;
  protected readonly shownChange = signal<(VdLeaderboardChange & { id: number })[]>([]);

  constructor() {
    effect((onCleanup) => {
      const change = this.change();
      if (!change) return;
      this.shownChange.set([{ ...change, id: ++this.changes }]);
      const timer = setTimeout(() => this.shownChange.set([]), CHANGE_MS);
      onCleanup(() => clearTimeout(timer));
    });
  }
}

export const VD_LEADERBOARD = [VdLeaderboard, VdLeaderboardRow] as const;
