import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_KANBAN, VdKanbanColumn, VdKanbanMove } from '@vadem/ui/kanban';

@Component({
  imports: [VD_KANBAN],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vd-kanban [columns]="columns()" (cardMove)="moves.push($event)" />`,
})
class Host {
  readonly columns = signal<readonly VdKanbanColumn[]>([
    { id: 'todo', title: 'To do', cards: [{ id: 'a', label: 'Alpha' }] },
    { id: 'done', title: 'Done', cards: [] },
  ]);
  readonly moves: VdKanbanMove[] = [];
}

describe('VdKanban', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it('renders named columns, counts, cards and an empty state', () => {
    const { root } = setup();
    const columns = root.querySelectorAll('section.vd-kanban__column');
    expect(columns).toHaveLength(2);
    const title = columns[0].querySelector('.vd-kanban__title')!;
    expect(columns[0].getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.textContent).toContain('1 card');
    expect(root.querySelector('[data-card-id="a"]')?.textContent).toContain('Alpha');
    expect(columns[1].querySelector('.vd-kanban__empty')?.textContent).toContain('No cards');
    expect(root.querySelector('.vd-kanban__move')?.getAttribute('aria-label')).toBe('Move Alpha');
  });

  it('emits a move request from the menu without changing the columns itself', () => {
    const { fixture, root } = setup();
    const item = Array.from(root.querySelectorAll<HTMLButtonElement>('.vd-menu__item')).find((b) =>
      b.textContent?.includes('Done'),
    )!;
    item.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.moves).toEqual([
      {
        cardId: 'a',
        fromColumnId: 'todo',
        toColumnId: 'done',
        fromIndex: 0,
        toIndex: 0,
        method: 'menu',
      },
    ]);
    expect(root.querySelector('section[data-column-id="todo"] [data-card-id="a"]')).not.toBeNull();
  });

  it('shows the invalid state for duplicate IDs', () => {
    const { fixture, root } = setup();
    fixture.componentInstance.columns.set([
      { id: 'x', title: 'X', cards: [{ id: 'a', label: 'A' }] },
      { id: 'y', title: 'Y', cards: [{ id: 'a', label: 'A' }] },
    ]);
    fixture.detectChanges();
    expect(root.querySelector('vd-kanban')?.getAttribute('data-state')).toBe('invalid');
    expect(root.querySelector('.vd-kanban__card')).toBeNull();
  });
});
