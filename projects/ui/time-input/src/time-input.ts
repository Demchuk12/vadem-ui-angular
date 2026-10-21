import {
  ComponentRef,
  Directive,
  ElementRef,
  ViewContainerRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { VdInput } from '@vadem/ui/input';
import { VdTimePicker } from './time-picker';
import { vdTexts } from '@vadem/ui/locale';

/** Native editor and accessors with a themed, minute-resolution selection popover. */
@Directive({
  selector: 'input[type=time][vdTimeInput]',
  host: {
    class: 'vd-time-input',
    'aria-haspopup': 'dialog',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.aria-controls]': 'panelId()',
    '(click)': 'showPicker($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class VdTimeInput extends VdInput {
  readonly pickerLabel = input<string>();
  readonly hoursLabel = input<string>();
  readonly minutesLabel = input<string>();
  readonly emptyLabel = input<string>();
  /** Text inputs resolved against the active VD_LOCALE. */
  protected readonly t = vdTexts('timeInput', {
    pickerLabel: this.pickerLabel,
    hoursLabel: this.hoursLabel,
    minutesLabel: this.minutesLabel,
    emptyLabel: this.emptyLabel,
  });
  protected readonly open = signal(false);
  protected readonly panelId = signal<string | null>(null);
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly container = inject(ViewContainerRef);
  private picker?: ComponentRef<VdTimePicker>;

  constructor() {
    super();
    afterNextRender(() => {
      this.picker = this.container.createComponent(VdTimePicker);
      this.picker.changeDetectorRef.detectChanges();
      const panel = this.picker.instance.panel;
      const anchor = `--${panel.id}`;
      this.element.style.setProperty('anchor-name', anchor);
      panel.style.setProperty('position-anchor', anchor);
      panel.setAttribute('tabindex', '-1');
      this.panelId.set(panel.id);
      this.picker.instance.onState = (open) => this.open.set(open);
    });
  }
  protected showPicker(event: Event): void {
    if (this.element.disabled || this.element.readOnly || !this.picker) return;
    event.preventDefault();
    this.picker.instance.open(
      this.element,
      this.t().pickerLabel,
      this.t().emptyLabel,
      this.t().hoursLabel,
      this.t().minutesLabel,
    );
    this.picker.changeDetectorRef.detectChanges();
    this.picker.instance.show();
  }
  protected onKeydown(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'ArrowDown') this.showPicker(event);
  }
}
