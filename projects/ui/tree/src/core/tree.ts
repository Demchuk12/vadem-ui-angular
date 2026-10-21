export interface VdTreeNode {
  key: string;
  parent: string | null;
  expanded: boolean;
  disabled: boolean;
}

/** Preorder visibility from a mounted hierarchy; collapsed ancestors hide descendants. */
export function vdTreeVisible(nodes: readonly VdTreeNode[]): VdTreeNode[] {
  const byKey = new Map(nodes.map((node) => [node.key, node]));
  return nodes.filter((node) => {
    let parent = node.parent;
    const seen = new Set([node.key]);
    while (parent !== null) {
      if (seen.has(parent)) return false;
      seen.add(parent);
      const ancestor = byKey.get(parent);
      if (!ancestor || !ancestor.expanded) return false;
      parent = ancestor.parent;
    }
    return true;
  });
}

/** Prefer the current node or its closest visible ancestor, then selection or first node. */
export function vdTreeFocusKey(
  nodes: readonly VdTreeNode[],
  current: string | null,
  selected: string | null,
): string | null {
  const visible = vdTreeVisible(nodes);
  const keys = new Set(visible.map((node) => node.key));
  const seen = new Set<string>();
  let key = current;
  while (key !== null && !seen.has(key)) {
    if (keys.has(key)) return key;
    seen.add(key);
    key = nodes.find((node) => node.key === key)?.parent ?? null;
  }
  return selected !== null && keys.has(selected) ? selected : (visible[0]?.key ?? null);
}

export type VdTreeAction =
  | { type: 'focus'; key: string }
  | { type: 'expand'; key: string; expanded: boolean }
  | { type: 'select'; key: string };

/** RTL mirrors branch keys; disabled nodes are focusable but cannot be activated. */
export function vdTreeAction(
  key: string,
  current: string,
  nodes: readonly VdTreeNode[],
  rtl = false,
): VdTreeAction | null {
  const visible = vdTreeVisible(nodes);
  const index = visible.findIndex((node) => node.key === current);
  const node = visible[index];
  if (!node) return null;
  const focus = (target: VdTreeNode | undefined): VdTreeAction | null =>
    target ? { type: 'focus', key: target.key } : null;
  if (key === 'Home') return focus(visible[0]);
  if (key === 'End') return focus(visible.at(-1));
  if (key === 'ArrowDown') return focus(visible[Math.min(index + 1, visible.length - 1)]);
  if (key === 'ArrowUp') return focus(visible[Math.max(index - 1, 0)]);
  if (key === 'Enter' || key === ' ')
    return node.disabled ? null : { type: 'select', key: current };
  const child = nodes.find((item) => item.parent === current);
  if (key === (rtl ? 'ArrowLeft' : 'ArrowRight')) {
    if (!child) return null;
    if (node.expanded) return focus(visible.find((item) => item.parent === current));
    return node.disabled ? null : { type: 'expand', key: current, expanded: true };
  }
  if (key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
    if (child && node.expanded)
      return node.disabled ? null : { type: 'expand', key: current, expanded: false };
    return focus(visible.find((item) => item.key === node.parent));
  }
  return null;
}
