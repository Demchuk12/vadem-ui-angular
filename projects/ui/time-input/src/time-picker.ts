import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  computed,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { VdIcon } from '@vadem/ui/icon';
import { VdPopover } from '@vadem/ui/popover';
import { timeOptions } from './core/time-options';

/** Internal view; the input remains the sole form control and value owner. */
@Component({
  selector: 'vd-time-picker',
  imports: [VdPopover, VdIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      vdPopover
      class="vd-time-picker"
      [attr.aria-label]="label()"
      (toggle)="toggled($event)"
      (focusout)="leave($event)"
    >
      <div class="vd-time-picker__heading">{{ label() }}</div>
      @if (options().length) {
        <div class="vd-time-picker__columns">
          @for (column of ['hours', 'minutes']; track column) {
            <div class="vd-time-picker__column">
              <div class="vd-time-picker__column-label">
                {{ column === 'hours' ? hoursLabel() : minutesLabel() }}
              </div>
              <div
                class="vd-time-picker__list"
                role="listbox"
                [attr.data-column]="column"
                [attr.aria-label]="column === 'hours' ? hoursLabel() : minutesLabel()"
              >
                @for (part of parts(column); track part; let i = $index) {
                  <div
                    class="vd-time-picker__option"
                    role="option"
                    [attr.aria-selected]="part === (column === 'hours' ? hour() : minute())"
                    [attr.tabindex]="i === activeIndex(column) ? 0 : -1"
                    (keydown)="navigate($event, column)"
                    (focus)="setActive(column, i)"
                    (click)="pick(part, column)"
                  >
                    <span>{{ part }}</span
                    ><vd-icon class="vd-time-picker__mark" name="check" />
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <p class="vd-time-picker__empty" role="status">{{ emptyLabel() }}</p>
      }
    </div>
  `,
})
export class VdTimePicker {
  readonly label = signal('Choose time');
  readonly emptyLabel = signal('No available times');
  readonly options = signal<string[]>([]);
  readonly selected = signal('');
  readonly hoursLabel = signal('Hours');
  readonly minutesLabel = signal('Minutes');
  readonly hour = signal('');
  readonly minute = signal('');
  readonly activeHour = signal(0);
  readonly activeMinute = signal(0);
  readonly hours = computed(() => [...new Set(this.options().map((time) => time.slice(0, 2)))]);
  readonly minutes = computed(() =>
    this.options()
      .filter((time) => time.startsWith(this.hour() + ':'))
      .map((time) => time.slice(3)),
  );
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private target?: HTMLInputElement;
  onState?: (open: boolean) => void;
  get panel(): HTMLElement {
    return this.host.querySelector('.vd-time-picker')!;
  }

  open(
    target: HTMLInputElement,
    label: string,
    emptyLabel: string,
    hoursLabel: string,
    minutesLabel: string,
  ): void {
    this.target = target;
    this.label.set(label);
    this.hoursLabel.set(hoursLabel);
    this.minutesLabel.set(minutesLabel);
    this.emptyLabel.set(emptyLabel);
    this.options.set(
      timeOptions(target.min, target.max, target.step, target.getAttribute('value') ?? ''),
    );
    this.selected.set(target.value);
    const initial = this.options().includes(target.value)
      ? target.value
      : (this.options()[0] ?? '');
    this.hour.set(initial.slice(0, 2));
    this.minute.set(initial.slice(3));
    this.activeHour.set(Math.max(0, this.hours().indexOf(this.hour())));
    this.activeMinute.set(Math.max(0, this.minutes().indexOf(this.minute())));
  }
  show(): void {
    if (!this.target || this.panel.matches(':popover-open')) return;
    this.panel.showPopover({ source: this.target } as ShowPopoverOptions);
    this.focusActive('hours');
  }
  toggled(event: Event): void {
    this.onState?.((event as ToggleEvent).newState === 'open');
  }
  leave(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (
      next &&
      next !== this.target &&
      !this.panel.contains(next) &&
      this.panel.matches(':popover-open')
    )
      this.panel.hidePopover();
  }
  choose(time: string): void {
    const target = this.target;
    // Recheck live properties and constraints in case the form changed while open.
    if (
      !target ||
      target.disabled ||
      target.readOnly ||
      !timeOptions(
        target.min,
        target.max,
        target.step,
        target.getAttribute('value') ?? '',
      ).includes(time)
    )
      return;
    target.value = time;
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
    this.panel.hidePopover();
    target.focus();
  }
  parts(column: string): string[] {
    return column === 'hours' ? this.hours() : this.minutes();
  }
  activeIndex(column: string): number {
    return column === 'hours' ? this.activeHour() : this.activeMinute();
  }
  setActive(column: string, index: number): void {
    (column === 'hours' ? this.activeHour : this.activeMinute).set(index);
  }
  pick(part: string, column: string): void {
    if (column === 'minutes') {
      this.choose(`${this.hour()}:${part}`);
      return;
    }
    this.hour.set(part);
    if (!this.minutes().includes(this.minute())) this.minute.set(this.minutes()[0] ?? '');
    this.activeMinute.set(Math.max(0, this.minutes().indexOf(this.minute())));
    this.changeDetector.detectChanges();
    this.focusActive('minutes');
  }
  navigate(event: KeyboardEvent, column: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.pick(this.parts(column)[this.activeIndex(column)], column);
      return;
    }
    const size = this.parts(column).length;
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = Math.min(size - 1, this.activeIndex(column) + 1);
        break;
      case 'ArrowUp':
        next = Math.max(0, this.activeIndex(column) - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = size - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setActive(column, next);
    this.focusActive(column);
  }
  private focusActive(column: string): void {
    const option = this.panel.querySelectorAll<HTMLElement>(
      `[data-column=${column}] [role=option]`,
    )[this.activeIndex(column)];
    if (option) {
      option.focus({ preventScroll: true });
      option.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    } else this.panel.focus();
  }
}
