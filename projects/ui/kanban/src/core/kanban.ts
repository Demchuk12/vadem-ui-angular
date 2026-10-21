/** Framework-agnostic board logic: validation, drop targets and immutable moves. */

export interface VdKanbanCardData {
  readonly id: string;
  /** Plain text used in announcements and the move menu's accessible name. */
  readonly label: string;
}

export interface VdKanbanColumn<T extends VdKanbanCardData = VdKanbanCardData> {
  readonly id: string;
  readonly title: string;
  readonly cards: readonly T[];
}

/** A requested move. `toIndex` is the card's index in the target column after the move. */
export interface VdKanbanMove {
  readonly cardId: string;
  readonly fromColumnId: string;
  readonly toColumnId: string;
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly method: 'menu' | 'pointer';
}

export interface VdKanbanPosition {
  readonly columnId: string;
  readonly index: number;
}

/** Column and card IDs must be non-empty and unique across the whole board. */
export function vdKanbanValid(columns: readonly VdKanbanColumn[]): boolean {
  const columnIds = new Set<string>();
  const cardIds = new Set<string>();
  for (const column of columns) {
    if (!isId(column.id) || columnIds.has(column.id)) return false;
    columnIds.add(column.id);
    for (const card of column.cards) {
      if (!isId(card.id) || cardIds.has(card.id)) return false;
      cardIds.add(card.id);
    }
  }
  return true;
}

export function vdKanbanFind(
  columns: readonly VdKanbanColumn[],
  cardId: string,
): VdKanbanPosition | null {
  for (const column of columns) {
    const index = column.cards.findIndex((card) => card.id === cardId);
    if (index >= 0) return { columnId: column.id, index };
  }
  return null;
}

/**
 * Builds a move request, or null when it changes nothing or is out of range.
 * `toIndex` is clamped to the target column (after removing the card from its source).
 */
export function vdKanbanMoveRequest(
  columns: readonly VdKanbanColumn[],
  cardId: string,
  to: VdKanbanPosition,
  method: VdKanbanMove['method'],
): VdKanbanMove | null {
  const from = vdKanbanFind(columns, cardId);
  const target = columns.find((column) => column.id === to.columnId);
  if (!from || !target || !Number.isInteger(to.index)) return null;
  const size = target.cards.length - (target.id === from.columnId ? 1 : 0);
  const index = Math.max(0, Math.min(to.index, size));
  if (target.id === from.columnId && index === from.index) return null;
  return {
    cardId,
    fromColumnId: from.columnId,
    toColumnId: target.id,
    fromIndex: from.index,
    toIndex: index,
    method,
  };
}

/**
 * Applies a move immutably: untouched columns keep their identity. Returns the same array when
 * the move no longer matches the board (stale request), so callers can detect a no-op.
 */
export function vdKanbanApplyMove<T extends VdKanbanCardData, C extends VdKanbanColumn<T>>(
  columns: readonly C[],
  move: Pick<VdKanbanMove, 'cardId' | 'toColumnId' | 'toIndex'>,
): readonly C[] {
  const from = vdKanbanFind(columns, move.cardId);
  if (!from || !columns.some((column) => column.id === move.toColumnId)) return columns;
  const card = columns.find((column) => column.id === from.columnId)!.cards[from.index];
  return columns.map((column) => {
    if (column.id !== from.columnId && column.id !== move.toColumnId) return column;
    const cards = column.cards.filter((c) => c.id !== move.cardId);
    if (column.id === move.toColumnId) {
      cards.splice(Math.max(0, Math.min(move.toIndex, cards.length)), 0, card);
    }
    return { ...column, cards };
  });
}

/**
 * Insertion index for a pointer at `y` among the other cards of a column (the dragged card's own
 * rectangle excluded): the number of cards whose vertical middle lies above the pointer.
 */
export function vdKanbanInsertIndex(
  y: number,
  cards: readonly { top: number; bottom: number }[],
): number {
  if (!Number.isFinite(y)) return 0;
  let index = 0;
  for (const rect of cards) if (y > (rect.top + rect.bottom) / 2) index++;
  return index;
}

/** The column under a horizontal pointer position, or -1 outside every column. */
export function vdKanbanColumnAt(
  x: number,
  columns: readonly { left: number; right: number }[],
): number {
  if (!Number.isFinite(x)) return -1;
  return columns.findIndex((rect) => x >= rect.left && x <= rect.right);
}

function isId(id: unknown): id is string {
  return typeof id === 'string' && id.trim().length > 0;
}
