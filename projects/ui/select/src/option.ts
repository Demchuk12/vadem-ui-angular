import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { vdUniqueId } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VD_LISTBOX } from './listbox-host';

/** One option of select, combobox, or multi-select. Specs: select.md, multi-select.md. */
@Component({
  selector: 'vd-option',
  imports: [VdIcon],
  template: `
    <span class="vd-option__label"><ng-content /></span>
    <vd-icon name="check" class="vd-option__check" />
  `,
  host: {
    class: 'vd-option',
    role: 'option',
    '[id]': 'id',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.data-active]': 'active() ? "" : null',
    '[hidden]': '!visible()',
    '(click)': 'host.choose(this)',
    '(pointermove)': 'host.hover(this)',
    // Keep focus on the combobox element while clicking options.
    '(mousedown)': '$event.preventDefault()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdOption implements OnInit {
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Text for the trigger, typeahead and filtering. Defaults to the option's text content. */
  readonly label = input<string>();

  protected readonly host = inject(VD_LISTBOX);
  readonly el: HTMLElement = inject(ElementRef).nativeElement;
  readonly id = vdUniqueId('vd-option');
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selected = computed(() => this.host.isSelected(this));
  protected readonly active = computed(() => this.host.isActive(this));
  protected readonly visible = computed(() => this.host.isVisible(this));

  textLabel(): string {
    return this.label() ?? this.el.querySelector('.vd-option__label')?.textContent?.trim() ?? '';
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(this.host.register(this));
  }
}
