/**
 * Whether a file matches an `accept` attribute value, the way the file picker filters:
 * extensions (".pdf"), exact MIME types ("image/png") and wildcards ("image/*"), comma-separated.
 * An empty `accept` accepts everything. Dropped files bypass the picker, so they are checked here.
 */
export function vdAcceptsFile(file: { name: string; type: string }, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

export interface VdFileCheck {
  accept?: string;
  /** Bytes. */
  maxSize?: number;
  /** Keep at most this many accepted files (e.g. 1 when `multiple` is off). */
  maxFiles?: number;
}

export type VdFileRejection = 'type' | 'size' | 'count';

/** Splits files into accepted and rejected (with the reason), in their original order. */
export function vdCheckFiles<T extends { name: string; type: string; size: number }>(
  files: readonly T[],
  check: VdFileCheck,
): { accepted: T[]; rejected: { file: T; reason: VdFileRejection }[] } {
  const accepted: T[] = [];
  const rejected: { file: T; reason: VdFileRejection }[] = [];
  for (const file of files) {
    if (check.accept && !vdAcceptsFile(file, check.accept)) rejected.push({ file, reason: 'type' });
    else if (check.maxSize !== undefined && file.size > check.maxSize)
      rejected.push({ file, reason: 'size' });
    else if (check.maxFiles !== undefined && accepted.length >= check.maxFiles)
      rejected.push({ file, reason: 'count' });
    else accepted.push(file);
  }
  return { accepted, rejected };
}
