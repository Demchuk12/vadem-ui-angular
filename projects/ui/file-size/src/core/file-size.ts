export type VdFileSizeSystem = 'decimal' | 'binary';
export interface VdFileSizeOptions {
  readonly locale?: string;
  readonly system?: VdFileSizeSystem;
  readonly maximumFractionDigits?: number;
  readonly unknownText?: string;
}
const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'];
const BINARY = ['', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

/** Formats byte counts only; display strings are never parsed back into values. */
export function vdFormatFileSize(
  bytes: number | null | undefined,
  options: VdFileSizeOptions = {},
): string {
  if (typeof bytes !== 'number' || !Number.isSafeInteger(bytes) || bytes < 0)
    return options.unknownText ?? 'Unknown size';
  const requested = options.maximumFractionDigits ?? 1;
  const digits = Number.isInteger(requested) && requested >= 0 && requested <= 3 ? requested : 1;
  const base = options.system === 'binary' ? 1024 : 1000;
  let index = 0;
  while (index < UNITS.length - 1 && bytes >= base ** (index + 1)) index++;
  if (index < UNITS.length - 1 && Number((bytes / base ** index).toFixed(digits)) >= base) index++;
  const value = bytes / base ** index;
  const numberOptions: Intl.NumberFormatOptions = { maximumFractionDigits: digits };
  const binary = options.system === 'binary' && index > 0;
  if (!binary)
    Object.assign(numberOptions, { style: 'unit', unit: UNITS[index], unitDisplay: 'short' });
  let formatter: Intl.NumberFormat;
  try {
    formatter = new Intl.NumberFormat(options.locale ?? 'en', numberOptions);
  } catch {
    formatter = new Intl.NumberFormat('en', numberOptions);
  }
  return binary ? `${formatter.format(value)}\u00a0${BINARY[index]}` : formatter.format(value);
}
