import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VD_SEARCH_INPUT } from './search-input';

@Component({
  imports: [ReactiveFormsModule, VD_SEARCH_INPUT],
  host: { '(keydown)': 'outerKeys = outerKeys + 1' },
  template: ` <vd-search-input>
    <input vdSearchInput type="search" aria-label="Пошук" [formControl]="query" />
    <span slot="end" class="hint">/</span>
  </vd-search-input>`,
})
class Host {
  readonly query = new FormControl('', { nonNullable: true });
  outerKeys = 0;
}

const escape = () =>
  new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });

describe('Search input', () => {
  it('shows clear only with a value; clearing updates the form and keeps focus', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input')!;
    expect(root.querySelector('.vd-search-input__clear')).toBeNull();
    expect(root.querySelector('.hint')).not.toBeNull();

    fixture.componentInstance.query.setValue('Львів');
    await fixture.whenStable();
    const clear = root.querySelector<HTMLButtonElement>('.vd-search-input__clear')!;
    expect(clear.getAttribute('aria-label')).toBe('Clear search');
    expect(clear.getAttribute('aria-controls')).toBe(input.id);
    expect(root.querySelector('.hint')).toBeNull();

    clear.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.query.value).toBe('');
    expect(document.activeElement).toBe(input);
    expect(root.querySelector('.vd-search-input__clear')).toBeNull();
  });

  it('Escape clears a filled field without bubbling, and bubbles when empty', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.query.setValue('Київ');
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;

    const first = escape();
    input.dispatchEvent(first);
    await fixture.whenStable();
    expect(first.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.query.value).toBe('');
    expect(fixture.componentInstance.outerKeys).toBe(0);

    const second = escape();
    input.dispatchEvent(second);
    expect(second.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.outerKeys).toBe(1);
  });

  it('never clears a read-only or disabled field', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.query.setValue('Звіт');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector('input')!.readOnly = true;
    fixture.componentInstance.query.disable();
    fixture.componentInstance.query.enable();
    await fixture.whenStable();
    expect(root.querySelector('.vd-search-input__clear')).toBeNull();
    root.querySelector('input')!.dispatchEvent(escape());
    expect(fixture.componentInstance.query.value).toBe('Звіт');
  });
});
