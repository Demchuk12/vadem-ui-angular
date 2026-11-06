import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VdBadge } from '@vadem/ui/badge';
import { VdButton } from '@vadem/ui/button';
import { VdIcon } from '@vadem/ui/icon';
import { VD_LEADERBOARD } from '@vadem/ui/leaderboard';

@Component({
  selector: 'demo-leaderboard',
  imports: [VD_LEADERBOARD, VdBadge, VdButton, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-leaderboard {
      max-inline-size: 32rem;
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Leaderboard</p>
      <h1>Leaderboard</h1>
      <p>
        Standings: rank, name and score, with room for a status and per-row actions. Sorting, ties
        and number formatting belong to your app.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="board-standings">
      <div class="demo-section__head">
        <h2 id="board-standings">Player view</h2>
        <p>Shared rank, the viewer's own row, a negative score, a disconnected player.</p>
      </div>
      <ol vdLeaderboard class="demo-leaderboard">
        <li vdLeaderboardRow [rank]="1" name="Оксана" score="2 400"></li>
        <li vdLeaderboardRow [rank]="1" name="Ігор" score="2 400" current></li>
        <li vdLeaderboardRow [rank]="3" name="Марія-Антонія Стефаник-Гордієнко" score="600"></li>
        <li vdLeaderboardRow [rank]="4" name="Тарас" score="−400" negative inactive>
          <span vdBadge>Офлайн</span>
        </li>
      </ol>
    </section>

    <section class="demo-section" aria-labelledby="board-host">
      <div class="demo-section__head">
        <h2 id="board-host">With actions</h2>
        <p>Controls go in the actions slot, for example correcting a score by hand.</p>
      </div>
      <ol vdLeaderboard class="demo-leaderboard">
        <li vdLeaderboardRow [rank]="1" name="Оксана" [score]="score().toString()">
          <button
            slot="actions"
            vdButton
            size="sm"
            iconOnly
            aria-label="Додати 100 очок: Оксана"
            (click)="score.set(score() + 100)"
          >
            <vd-icon name="plus" />
          </button>
        </li>
      </ol>
    </section>

    <section class="demo-section" aria-labelledby="board-rtl" dir="rtl">
      <div class="demo-section__head">
        <h2 id="board-rtl">RTL</h2>
      </div>
      <ol vdLeaderboard class="demo-leaderboard">
        <li vdLeaderboardRow [rank]="1" name="سلمى" score="1 200"></li>
        <li vdLeaderboardRow [rank]="2" name="Ігор" score="−200" negative></li>
      </ol>
    </section>
  `,
})
export default class LeaderboardPage {
  protected readonly score = signal(1200);
}
