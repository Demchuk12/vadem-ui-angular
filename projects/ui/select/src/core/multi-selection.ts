/** Immutable, unique selection values. Unknown values remain until the consumer removes them. */
export function vdUniqueSelection(values: readonly string[] | null): string[] {
  return [...new Set(values ?? [])];
}

export function vdToggleSelection(values: readonly string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...new Set([...values, value])];
}
