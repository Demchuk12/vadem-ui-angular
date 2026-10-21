import { InjectionToken } from '@angular/core';
import type { VdOption } from './option';

/** What an option needs from the select, combobox, or multi-select that owns it. */
export interface VdListboxHost {
  isSelected(option: VdOption): boolean;
  isActive(option: VdOption): boolean;
  isVisible(option: VdOption): boolean;
  choose(option: VdOption): void;
  hover(option: VdOption): void;
  register(option: VdOption): () => void;
}

export const VD_LISTBOX = new InjectionToken<VdListboxHost>('VD_LISTBOX');
