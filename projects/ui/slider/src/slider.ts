import { Directive, ElementRef, afterEveryRender, inject } from '@angular/core';
import { VdFieldControlBase } from '@vadem/ui/field';

/** Filled share of a range input in percent (0-100), from its min/max/value. */
export function vdSliderFill(value: number, min: number, max: number): number {
  if (!(max > min) || Number.isNaN(value)) return 0;
  return ((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100;
}

/**
 * Styles a native `<input type="range">`. Value, keyboard (arrows, PageUp/Down, Home/End),
 * forms and labelling stay native; the directive only keeps the filled part of the track in
 * sync (`--vd-slider-fill`) for engines without a native progress pseudo-element.
 * Spec: specs/slider.md
 */
@Directive({
  selector: 'input[type=range][vdSlider]',
  host: {
    class: 'vd-slider',
    '(input)': 'sync()',
  },
})
export class VdSlider extends VdFieldControlBase {
  private readonly el: HTMLInputElement = inject(ElementRef).nativeElement;

  constructor() {
    super();
    // Forms write `value` as a property (no event): re-read after every render.
    afterEveryRender(() => this.sync());
  }

  protected sync(): void {
    const { valueAsNumber, min, max } = this.el;
    const fill = vdSliderFill(valueAsNumber, Number(min || 0), Number(max || 100));
    this.el.style.setProperty('--vd-slider-fill', `${fill}%`);
  }
}
