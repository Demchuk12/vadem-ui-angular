import { computed, Directive, input, numberAttribute } from '@angular/core';
import { VdInput } from '@vadem/ui/input';

/** One native code field: editing, clipboard, autofill and value accessors remain native. */
@Directive({
  selector: 'input[vdOtpInput]',
  host: {
    class: 'vd-otp-input',
    type: 'text',
    inputmode: 'numeric',
    autocomplete: 'one-time-code',
    spellcheck: 'false',
    dir: 'ltr',
    '[attr.maxlength]': 'codeLength()',
    '[attr.pattern]': '"[0-9]{" + codeLength() + "}"',
    '[style.--vd-otp-input-length]': 'codeLength()',
  },
})
export class VdOtpInput extends VdInput {
  readonly length = input(6, { transform: numberAttribute });
  protected readonly codeLength = computed(() => {
    const length = this.length();
    return Number.isFinite(length) ? Math.min(12, Math.max(1, Math.trunc(length))) : 6;
  });
}
