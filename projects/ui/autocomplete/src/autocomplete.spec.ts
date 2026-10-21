import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VD_AUTOCOMPLETE, VdAutocomplete } from './public-api';
import type { VdAutocompleteOption } from './core/autocomplete';

@Component({
  imports: [VD_AUTOCOMPLETE, VdField, ReactiveFormsModule],
  template: `<form>
    <vd-field label="Address" hint="Your text is allowed">
      <input
        [vdAutocomplete]="panel"
        [formControl]="text"
        [readOnly]="readonly()"
        (queryChange)="queries.push($event)"
      />
      <vd-autocomplete
        #panel
        [options]="options()"
        [highlightQuery]="highlight()"
        [loading]="loading()"
        [errorText]="error()"
        (optionSelected)="selected.push($event.id)"
      />
    </vd-field>
  </form>`,
})
class Host {
  readonly text = new FormControl('', { nonNullable: true });
  readonly options = signal<readonly VdAutocompleteOption[]>([
    { id: 'a', label: 'Київ' },
    { id: 'b', label: 'Київ' },
    { id: 'disabled', label: 'Closed', disabled: true },
  ]);
  readonly highlight = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly readonly = signal(false);
  queries: string[] = [];
  selected: string[] = [];
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const input = root.querySelector('input')!;
  const panel = fixture.debugElement.query(By.directive(VdAutocomplete))
    .componentInstance as VdAutocomplete;
  const type = (value: string) => {
    input.value = value;
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
  };
  return { fixture, root, input, panel, host: fixture.componentInstance, type };
}

describe('Autocomplete native forms', () => {
  it('opts into highlighted labels without changing accessible names and restores plain DOM', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('vd-text-highlight')).toBeNull();
    expect(root.querySelector('.vd-autocomplete__label')!.textContent).toBe('Київ');
    fixture.componentInstance.highlight.set('КИ');
    await fixture.whenStable();
    expect([...root.querySelectorAll('mark')].map((mark) => mark.textContent)).toEqual([
      'Ки',
      'Ки',
    ]);
    expect(root.querySelector('[role=option]')!.getAttribute('aria-label')).toBe('Київ');
    fixture.componentInstance.highlight.set('cl');
    await fixture.whenStable();
    expect(root.querySelector('[aria-disabled=true] mark')!.textContent).toBe('Cl');
    fixture.componentInstance.highlight.set('');
    await fixture.whenStable();
    expect(root.querySelector('vd-text-highlight')).toBeNull();
    expect(root.querySelector('.vd-autocomplete__label')!.textContent).toBe('Київ');
  });

  it('preserves free text on close and updates native forms once on explicit selection without querying', async () => {
    const { fixture, input, panel, host, type, root } = await setup();
    type('  Власна адреса  ');
    await fixture.whenStable();
    panel.close();
    expect(host.text.value).toBe('  Власна адреса  ');
    expect(host.queries).toEqual(['  Власна адреса  ']);
    panel.open();
    const inputEvent = vi.fn();
    const change = vi.fn();
    input.addEventListener('input', inputEvent);
    input.addEventListener('change', change);
    panel.choose('b');
    await fixture.whenStable();
    expect(host.text.value).toBe('Київ');
    expect(host.selected).toEqual(['b']);
    expect(host.queries).toHaveLength(1);
    expect(inputEvent).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);
    expect(root.querySelector('label')?.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(root.querySelector('.vd-field__hint')?.id);
    expect(host.text.dirty).toBe(true);
  });
  it('suppresses stale choices during loading/errors and clears removed active references', async () => {
    const { fixture, panel, input, host, root } = await setup();
    panel.navigate('ArrowDown');
    await fixture.whenStable();
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
    host.options.set([{ id: 'b', label: 'Київ' }]);
    await fixture.whenStable();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    panel.navigate('ArrowDown');
    host.loading.set(true);
    await fixture.whenStable();
    panel.choose('b');
    expect(host.selected).toEqual([]);
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    host.loading.set(false);
    host.error.set('Unavailable');
    await fixture.whenStable();
    expect(root.querySelector('.vd-autocomplete__message')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Unavailable');
    panel.choose('b');
    expect(host.selected).toEqual([]);
  });
  it('does not reopen on late results and closes for external writes, reset, readonly and disabled', async () => {
    const { fixture, panel, host, root } = await setup();
    panel.open();
    panel.close();
    host.options.set([{ id: 'late', label: 'Late' }]);
    await fixture.whenStable();
    expect(panel.expanded()).toBe(false);
    panel.open();
    host.text.setValue('External');
    await fixture.whenStable();
    expect(panel.expanded()).toBe(false);
    panel.open();
    host.text.reset();
    await fixture.whenStable();
    expect(panel.expanded()).toBe(false);
    panel.open();
    host.text.reset(); // An equal-value reset must still dismiss the popup.
    await fixture.whenStable();
    expect(panel.expanded()).toBe(false);
    panel.open();
    root.querySelector('form')!.reset();
    await fixture.whenStable();
    expect(panel.expanded()).toBe(false);
    panel.open();
    host.readonly.set(true);
    await fixture.whenStable();
    expect(panel.expanded()).toBe(false);
    panel.open();
    expect(panel.expanded()).toBe(false);
    host.readonly.set(false);
    await fixture.whenStable();
    panel.open();
    host.text.disable();
    await fixture.whenStable();
    expect(panel.expanded()).toBe(false);
    panel.choose('late');
    expect(host.selected).toEqual([]);
  });
  it('buffers query notifications across composition and leaves composing Enter untouched', async () => {
    const { fixture, input, host, panel, type } = await setup();
    input.dispatchEvent(new CompositionEvent('compositionstart'));
    type('Ки');
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      isComposing: true,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(false);
    expect(host.queries).toEqual([]);
    input.dispatchEvent(new CompositionEvent('compositionend'));
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await fixture.whenStable();
    expect(host.queries).toEqual(['Ки']);
    expect(panel.activeId()).toBeNull();
  });
});
