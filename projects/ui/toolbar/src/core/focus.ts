/** Keep remembered focus, otherwise recover at the former position, then before it. */
export function vdToolbarEntry(
  unavailable: readonly boolean[],
  current: number,
  former = 0,
): number | null {
  if (current >= 0 && current < unavailable.length && !unavailable[current]) return current;
  const start = Math.max(0, Math.min(former, unavailable.length - 1));
  for (let i = start; i < unavailable.length; i++) if (!unavailable[i]) return i;
  for (let i = start - 1; i >= 0; i--) if (!unavailable[i]) return i;
  return null;
}
