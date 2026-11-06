import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';

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
    <bdi class="vd-leaderboard__score" dir="ltr">{{ score() }}</bdi>
    <ng-content select="[slot=actions]" />
  `,
  host: {
    class: 'vd-leaderboard__row',
    '[attr.data-leader]': 'rank() === 1 ? "" : null',
    '[attr.data-negative]': 'negative() ? "" : null',
    '[attr.data-inactive]': 'inactive() ? "" : null',
    '[attr.aria-current]': 'current() ? "true" : null',
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
}

export const VD_LEADERBOARD = [VdLeaderboard, VdLeaderboardRow] as const;
