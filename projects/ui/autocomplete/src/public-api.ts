import { VdAutocomplete } from './autocomplete';
import { VdAutocompleteInput } from './autocomplete-input';
export { VdAutocomplete, VdAutocompleteInput };
export type { VdAutocompleteOption } from './core/autocomplete';
export const VD_AUTOCOMPLETE = [VdAutocomplete, VdAutocompleteInput] as const;
