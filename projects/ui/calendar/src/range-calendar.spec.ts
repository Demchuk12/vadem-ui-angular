import { TestBed } from '@angular/core/testing';
import { VdCalendar } from './calendar';

describe('Calendar selection modes', () => {
  it('keeps default single selection and emits every explicit activation', async () => {
    const fixture = TestBed.createComponent(VdCalendar);
    fixture.componentRef.setInput('value', '2026-10-08');
    fixture.detectChanges();
    await fixture.whenStable();
    const selected: string[] = [];
    fixture.componentInstance.dateSelected.subscribe((date) => selected.push(date));
    const cell = fixture.nativeElement.querySelector('[data-date="2026-10-08"]') as HTMLElement;
    cell.click();
    cell.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('2026-10-08');
    expect(selected).toEqual(['2026-10-08', '2026-10-08']);
    expect(fixture.nativeElement.querySelector('table').hasAttribute('aria-multiselectable')).toBe(
      false,
    );
  });
  it('reflects the entire interval while keeping range activation separate from single value', async () => {
    const fixture = TestBed.createComponent(VdCalendar);
    fixture.componentRef.setInput('selectionMode', 'range');
    fixture.componentRef.setInput('rangeStart', '2026-10-08');
    fixture.componentRef.setInput('rangeEnd', '2026-10-10');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[aria-selected="true"]').length).toBe(3);
    expect(fixture.nativeElement.querySelector('table').getAttribute('aria-multiselectable')).toBe(
      'true',
    );
    (fixture.nativeElement.querySelector('[data-date="2026-10-10"]') as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBeNull();
  });
});
