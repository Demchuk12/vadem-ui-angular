import {
  ChangeDetectionStrategy,
  Component,
  Pipe,
  ViewEncapsulation,
  computed,
  inject,
  input,
  type PipeTransform,
} from '@angular/core';
import { VD_LOCALE, vdTexts } from '@vadem/ui/locale';
import { vdFormatRelativeTime, vdRelativeTimeValid } from './core/relative-time';

@Pipe({ name: 'vdRelativeTime' })
export class VdRelativeTimePipe implements PipeTransform {
  private readonly texts = inject(VD_LOCALE);
  transform(
    value: number | null | undefined,
    now: number | null | undefined,
    locale = this.texts.code,
    justNowText = this.texts.relativeTime.justNowText,
    unknownText = this.texts.relativeTime.unknownText,
  ): string {
    return vdFormatRelativeTime(value, now, { locale, justNowText, unknownText });
  }
}

@Component({
  // Preserve native time semantics and allow composition with vdTimelineTime.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'time[vdRelativeTime]',
  template: `<bdi>{{ text() }}</bdi>`,
  host: {
    class: 'vd-relative-time',
    '[attr.datetime]': 'datetime()',
    '[attr.data-state]': 'valid() ? "valid" : "unknown"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VdRelativeTime {
  readonly vdRelativeTime = input<number | null>();
  readonly now = input.required<number>();
  readonly locale = input<string>();
  readonly justNowText = input<string>();
  readonly unknownText = input<string>();
  private readonly texts = inject(VD_LOCALE);
  private readonly t = vdTexts('relativeTime', {
    justNowText: this.justNowText,
    unknownText: this.unknownText,
  });
  protected readonly valid = computed(
    () => vdRelativeTimeValid(this.vdRelativeTime()) && vdRelativeTimeValid(this.now()),
  );
  protected readonly datetime = computed(() => {
    const value = this.vdRelativeTime();
    return vdRelativeTimeValid(value) ? new Date(value).toISOString() : null;
  });
  protected readonly text = computed(() =>
    vdFormatRelativeTime(this.vdRelativeTime(), this.now(), {
      locale: this.locale() ?? this.texts.code,
      ...this.t(),
    }),
  );
}
