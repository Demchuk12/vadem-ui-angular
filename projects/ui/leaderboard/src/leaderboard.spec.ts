import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_LEADERBOARD, type VdLeaderboardChange } from './leaderboard';

@Component({
  imports: [VD_LEADERBOARD],
  template: `
    <ol vdLeaderboard>
      <li vdLeaderboardRow [rank]="rank()" name="Оксана" score="1 200" [current]="current()">
        <span class="meta">офлайн</span>
        <button slot="actions" type="button">+</button>
      </li>
      <li vdLeaderboardRow [rank]="2" name="Ігор" score="−400" negative inactive></li>
    </ol>
  `,
})
class Host {
  readonly rank = signal(1);
  readonly current = signal(false);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const [first, second] = Array.from(root.querySelectorAll('li'));
  return { fixture, host: fixture.componentInstance, root, first: first!, second: second! };
}

describe('Leaderboard', () => {
  it('keeps list semantics when the markers are hidden', async () => {
    const { root } = await setup();
    expect(root.querySelector('ol')?.getAttribute('role')).toBe('list');
  });

  it('renders rank, name and score, with projected meta and actions in their places', async () => {
    const { first } = await setup();
    expect(first.querySelector('.vd-leaderboard__rank')?.textContent).toBe('1');
    expect(first.querySelector('.vd-leaderboard__name')?.textContent).toBe('Оксана');
    expect(first.querySelector('.vd-leaderboard__score')?.textContent).toBe('1 200');
    expect(first.querySelector('.vd-leaderboard__main .meta')).not.toBeNull();
    expect(first.querySelector(':scope > button')).not.toBeNull();
  });

  it('marks shared first place as leader, whatever the position', async () => {
    const { first, second } = await setup();
    expect(first.hasAttribute('data-leader')).toBe(true);
    expect(second.hasAttribute('data-leader')).toBe(false);
  });

  it('reflects negative, inactive and current', async () => {
    const { fixture, host, first, second } = await setup();
    expect(second.hasAttribute('data-negative')).toBe(true);
    expect(second.hasAttribute('data-inactive')).toBe(true);
    expect(first.getAttribute('aria-current')).toBeNull();
    host.current.set(true);
    await fixture.whenStable();
    expect(first.getAttribute('aria-current')).toBe('true');
  });

  it('shows each change once, in its tone, and clears it', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(ChangeHost);
      fixture.detectChanges();
      const row = (fixture.nativeElement as HTMLElement).querySelector('li')!;
      expect(row.querySelector('.vd-leaderboard__change')).toBeNull();

      fixture.componentInstance.change.set({ label: '+600', tone: 'gain' });
      fixture.detectChanges();
      const label = row.querySelector('.vd-leaderboard__change')!;
      expect(label.textContent?.trim()).toBe('+600');
      expect(label.getAttribute('aria-hidden')).toBe('true');
      expect(row.getAttribute('data-change')).toBe('gain');

      // An equal change is still a new one.
      fixture.componentInstance.change.set({ label: '+600', tone: 'gain' });
      fixture.detectChanges();
      expect(row.querySelector('.vd-leaderboard__change')).not.toBe(label);

      vi.advanceTimersByTime(1600);
      fixture.detectChanges();
      expect(row.querySelector('.vd-leaderboard__change')).toBeNull();
      expect(row.hasAttribute('data-change')).toBe(false);

      fixture.componentInstance.change.set({ label: '−400', tone: 'loss' });
      fixture.detectChanges();
      expect(row.getAttribute('data-change')).toBe('loss');
    } finally {
      vi.useRealTimers();
    }
  });
});

@Component({
  imports: [VD_LEADERBOARD],
  template: `
    <ol vdLeaderboard>
      <li vdLeaderboardRow [rank]="1" name="Оксана" score="1 200" [change]="change()"></li>
    </ol>
  `,
})
class ChangeHost {
  readonly change = signal<VdLeaderboardChange | null>(null);
}
