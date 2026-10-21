/* Framework-agnostic keyboard helpers (no Angular imports). */
export { vdListTarget, type VdListKeyOptions } from './list-keys';
export {
  vdIsActivationKey,
  vdRovingTarget,
  type VdDirection,
  type VdOrientation,
  type VdRovingOptions,
} from './roving-keys';
export { VdTypeahead, vdMatchesQuery, vdNormalize } from './typeahead';
