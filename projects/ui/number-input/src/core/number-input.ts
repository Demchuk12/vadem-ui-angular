/** Probe native decimal alignment/bounds without mutating the real form field. */
export function vdNumberStepValue(input: HTMLInputElement, direction: -1 | 1): string | null {
  if (input.type !== 'number' || input.disabled || input.readOnly || input.validity.badInput)
    return null;
  const probe = input.cloneNode() as HTMLInputElement;
  probe.value = input.value;
  try {
    if (direction === 1) probe.stepUp();
    else probe.stepDown();
  } catch {
    // Native stepping is unavailable for step="any".
    return null;
  }
  if (probe.value === input.value || !Number.isFinite(probe.valueAsNumber)) return null;
  if (
    Number.isFinite(input.valueAsNumber) &&
    (probe.valueAsNumber - input.valueAsNumber) * direction <= 0
  )
    return null;
  return probe.value;
}
