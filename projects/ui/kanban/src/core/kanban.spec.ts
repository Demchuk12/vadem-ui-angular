import {
  vdKanbanApplyMove,
  vdKanbanColumnAt,
  vdKanbanInsertIndex,
  vdKanbanMoveRequest,
  vdKanbanValid,
} from './kanban';

const card = (id: string) => ({ id, label: id.toUpperCase() });
const board = [
  { id: 'new', title: 'New', cards: [card('a'), card('b'), card('c')] },
  { id: 'won', title: 'Won', cards: [card('d')] },
  { id: 'lost', title: 'Lost', cards: [] },
];

describe('kanban core', () => {
  it('validates unique non-empty IDs across the board', () => {
    expect(vdKanbanValid(board)).toBe(true);
    expect(vdKanbanValid([...board, { id: 'x', title: 'X', cards: [card('a')] }])).toBe(false);
    expect(vdKanbanValid([{ id: ' ', title: '', cards: [] }])).toBe(false);
    expect(vdKanbanValid([board[0], board[0]])).toBe(false);
  });

  it('builds clamped move requests and rejects no-ops', () => {
    expect(vdKanbanMoveRequest(board, 'a', { columnId: 'new', index: 0 }, 'menu')).toBeNull();
    expect(vdKanbanMoveRequest(board, 'a', { columnId: 'new', index: 9 }, 'menu')).toEqual({
      cardId: 'a',
      fromColumnId: 'new',
      toColumnId: 'new',
      fromIndex: 0,
      toIndex: 2,
      method: 'menu',
    });
    expect(
      vdKanbanMoveRequest(board, 'b', { columnId: 'lost', index: 5 }, 'pointer')?.toIndex,
    ).toBe(0);
    expect(vdKanbanMoveRequest(board, 'zzz', { columnId: 'lost', index: 0 }, 'menu')).toBeNull();
    expect(vdKanbanMoveRequest(board, 'a', { columnId: 'nope', index: 0 }, 'menu')).toBeNull();
  });

  it('applies moves immutably and keeps untouched columns', () => {
    const next = vdKanbanApplyMove(board, { cardId: 'b', toColumnId: 'won', toIndex: 0 });
    expect(next[0].cards.map((c) => c.id)).toEqual(['a', 'c']);
    expect(next[1].cards.map((c) => c.id)).toEqual(['b', 'd']);
    expect(next[2]).toBe(board[2]);
    expect(board[0].cards).toHaveLength(3);
    const within = vdKanbanApplyMove(board, { cardId: 'a', toColumnId: 'new', toIndex: 2 });
    expect(within[0].cards.map((c) => c.id)).toEqual(['b', 'c', 'a']);
    expect(vdKanbanApplyMove(board, { cardId: 'zzz', toColumnId: 'won', toIndex: 0 })).toBe(board);
  });

  it('finds the insertion index and the column under the pointer', () => {
    const rects = [
      { top: 0, bottom: 40 },
      { top: 50, bottom: 90 },
    ];
    expect(vdKanbanInsertIndex(10, rects)).toBe(0);
    expect(vdKanbanInsertIndex(30, rects)).toBe(1);
    expect(vdKanbanInsertIndex(200, rects)).toBe(2);
    expect(vdKanbanInsertIndex(5, [])).toBe(0);
    const cols = [
      { left: 0, right: 100 },
      { left: 110, right: 210 },
    ];
    expect(vdKanbanColumnAt(150, cols)).toBe(1);
    expect(vdKanbanColumnAt(105, cols)).toBe(-1);
  });
});
