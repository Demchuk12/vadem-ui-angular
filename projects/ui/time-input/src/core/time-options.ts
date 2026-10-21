/** Minute-resolution choices matching the native time input's periodic range and step base. */
export function timeOptions(min: string, max: string, step: string, initial: string): string[] {
  const seconds = (value: string): number | undefined => {
    if (!/^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(value)) return undefined;
    const [h, m, s = 0] = value.split(':').map(Number);
    return h < 24 && m < 60 && s < 60 ? h * 3600 + m * 60 + s : undefined;
  };
  const low = seconds(min),
    high = seconds(max),
    base = low ?? seconds(initial) ?? 0;
  const increment = step === 'any' ? 0 : Number(step) > 0 ? Number(step) : 60;
  const result: string[] = [];
  for (let minute = 0; minute < 1440; minute++) {
    const value = minute * 60;
    const inRange =
      low !== undefined && high !== undefined && low > high
        ? value >= low || value <= high
        : (low === undefined || value >= low) && (high === undefined || value <= high);
    const quotient = increment ? (value - base) / increment : 0;
    if (inRange && Math.abs(quotient - Math.round(quotient)) < 1e-7)
      result.push(
        `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`,
      );
  }
  return result;
}
