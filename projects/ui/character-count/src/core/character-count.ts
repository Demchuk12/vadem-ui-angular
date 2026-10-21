/** UTF-16 units deliberately match native maxlength and Angular's maxLength validator. */
export function vdCharacterCount(value: string, maximum: number | null) {
  const limit =
    maximum !== null && Number.isFinite(maximum) && maximum >= 0 ? Math.floor(maximum) : null;
  const used = value.length;
  const remaining = limit === null ? null : limit - used;
  const state =
    remaining === null
      ? 'unlimited'
      : remaining < 0
        ? 'over'
        : remaining === 0
          ? 'limit'
          : 'within';
  return { used, limit, remaining, state } as const;
}
