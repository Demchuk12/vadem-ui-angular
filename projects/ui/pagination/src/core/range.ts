export type VdPageItem = number | 'ellipsis';

/**
 * Page items to render: first/last `boundaries` pages, `siblings` around the current page,
 * and 'ellipsis' for gaps. The length stays constant while paging (no jumping layout), and an
 * ellipsis never hides a single page (that page is shown instead).
 *
 * vdPageRange(6, 12) -> [1, 'ellipsis', 5, 6, 7, 'ellipsis', 12]
 */
export function vdPageRange(
  page: number,
  count: number,
  siblings = 1,
  boundaries = 1,
): VdPageItem[] {
  if (count <= 0) return [];
  const current = Math.min(Math.max(1, page), count);
  // boundaries on both sides + siblings + current + 2 ellipsis slots
  const slots = boundaries * 2 + siblings * 2 + 3;
  if (count <= slots) return range(1, count);

  const start = Math.max(
    Math.min(current - siblings, count - boundaries - siblings * 2 - 1),
    boundaries + 2,
  );
  const end = Math.min(
    Math.max(current + siblings, boundaries + siblings * 2 + 2),
    count - boundaries - 1,
  );

  return [
    ...range(1, boundaries),
    start > boundaries + 2 ? 'ellipsis' : boundaries + 1,
    ...range(start, end),
    end < count - boundaries - 1 ? 'ellipsis' : count - boundaries,
    ...range(count - boundaries + 1, count),
  ];
}

function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
}
