import { describe, expect, it } from 'vitest';
import { vdTreeAction, vdTreeFocusKey, vdTreeVisible, type VdTreeNode } from './tree';
const nodes: VdTreeNode[] = [
  { key: 'root', parent: null, expanded: true, disabled: false },
  { key: 'branch', parent: 'root', expanded: false, disabled: false },
  { key: 'child', parent: 'branch', expanded: false, disabled: false },
  { key: 'locked', parent: 'root', expanded: false, disabled: true },
  { key: 'last', parent: null, expanded: false, disabled: false },
];
describe('tree hierarchy and keys', () => {
  it('hides collapsed descendants without changing input or disabled discovery', () => {
    expect(vdTreeVisible(nodes).map((n) => n.key)).toEqual(['root', 'branch', 'locked', 'last']);
    expect(nodes[2].key).toBe('child');
    expect(
      vdTreeVisible(nodes.map((n) => (n.key === 'root' ? { ...n, expanded: false } : n))).map(
        (n) => n.key,
      ),
    ).toEqual(['root', 'last']);
  });
  it('rejects orphaned and cyclic ancestry rather than looping', () => {
    expect(
      vdTreeVisible([{ key: 'bad', parent: 'missing', expanded: true, disabled: false }]),
    ).toEqual([]);
    expect(
      vdTreeVisible([{ key: 'cycle', parent: 'cycle', expanded: true, disabled: false }]),
    ).toEqual([]);
  });
  it('recovers focus to visible ancestor, selection or first node', () => {
    expect(vdTreeFocusKey(nodes, 'child', 'last')).toBe('branch');
    expect(vdTreeFocusKey(nodes, 'removed', 'last')).toBe('last');
    expect(vdTreeFocusKey(nodes, null, 'child')).toBe('root');
    expect(vdTreeFocusKey([], 'missing', null)).toBeNull();
  });
  it('moves in preorder without wrapping or opening branches', () => {
    expect(vdTreeAction('ArrowDown', 'branch', nodes)).toEqual({ type: 'focus', key: 'locked' });
    expect(vdTreeAction('ArrowUp', 'root', nodes)).toEqual({ type: 'focus', key: 'root' });
    expect(vdTreeAction('End', 'root', nodes)).toEqual({ type: 'focus', key: 'last' });
    expect(vdTreeAction('Home', 'last', nodes)).toEqual({ type: 'focus', key: 'root' });
  });
  it('separates expansion from selection and mirrors branch keys for RTL', () => {
    expect(vdTreeAction('ArrowRight', 'branch', nodes)).toEqual({
      type: 'expand',
      key: 'branch',
      expanded: true,
    });
    expect(vdTreeAction('ArrowLeft', 'branch', nodes, true)).toEqual({
      type: 'expand',
      key: 'branch',
      expanded: true,
    });
    expect(vdTreeAction('ArrowRight', 'root', nodes)).toEqual({ type: 'focus', key: 'branch' });
    expect(vdTreeAction('ArrowLeft', 'root', nodes)).toEqual({
      type: 'expand',
      key: 'root',
      expanded: false,
    });
    expect(vdTreeAction('ArrowLeft', 'branch', nodes)).toEqual({ type: 'focus', key: 'root' });
    expect(vdTreeAction('Enter', 'branch', nodes)).toEqual({ type: 'select', key: 'branch' });
    expect(vdTreeAction(' ', 'locked', nodes)).toBeNull();
    expect(vdTreeAction('ArrowRight', 'last', nodes)).toBeNull();
  });
});
