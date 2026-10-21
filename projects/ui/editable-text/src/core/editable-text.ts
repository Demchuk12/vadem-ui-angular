/** Native maxlength counts UTF-16 units; malformed limits add no constraint. */
export function vdEditableTextLimit(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
}

export function vdEditableTextIssue(
  value: string,
  required: boolean,
  limit: number | null,
): 'required' | 'tooLong' | null {
  if (required && !value.trim()) return 'required';
  if (limit !== null && value.length > limit) return 'tooLong';
  return null;
}
