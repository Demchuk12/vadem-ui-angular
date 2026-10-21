import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VdCombobox, VdOption, VdSelect } from '@vadem/ui/select';
import { installFakePopover } from '../../test-utils/fake-popover';

@Component({
  imports: [ReactiveFormsModule, VdField, VdSelect, VdCombobox, VdOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-field label="Місто" error="Оберіть місто">
      <vd-select [formControl]="city" placeholder="Оберіть">
        <vd-option value="kyiv">Київ</vd-option>
        <vd-option value="lviv" disabled>Львів</vd-option>
        <vd-option value="lutsk">Луцьк</vd-option>
        <vd-option value="odesa">Одеса</vd-option>
      </vd-select>
    </vd-field>
    <vd-combobox [(value)]="country" emptyText="Нічого">
      @for (c of countries; track c.value) {
        <vd-option [value]="c.value">{{ c.label }}</vd-option>
      }
    </vd-combobox>
  `,
})
class Host {
  readonly city = new FormControl<string | null>(null, Validators.required);
  readonly country = signal<string | null>(null);
  readonly countries = [
    { value: 'ua', label: 'Україна' },
    { value: 'pl', label: 'Польща' },
    { value: 'pt', label: 'Португалія' },
  ];
}

describe('VdSelect / VdCombobox', () => {
  beforeAll(installFakePopover);
  afterEach(() => document.body.replaceChildren());

  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    const trigger = root.querySelector<HTMLButtonElement>('.vd-select__trigger')!;
    const input = root.querySelector<HTMLInputElement>('.vd-combobox__input')!;
    const key = (el: HTMLElement, k: string, extra: KeyboardEventInit = {}) => {
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }),
      );
      fixture.detectChanges();
    };
    const listOf = (el: HTMLElement) =>
      root.querySelector<HTMLElement>('#' + el.getAttribute('aria-controls'))!;
    const active = (el: HTMLElement) =>
      root.querySelector('#' + el.getAttribute('aria-activedescendant'));
    return { fixture, host: fixture.componentInstance, root, trigger, input, key, listOf, active };
  }

  it('wires combobox ARIA and the field label', () => {
    const { root, trigger, listOf } = setup();
    expect(trigger.getAttribute('role')).toBe('combobox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(listOf(trigger).getAttribute('role')).toBe('listbox');
    expect(root.querySelector('label')!.getAttribute('for')).toBe(trigger.id);
    expect(trigger.textContent).toContain('Оберіть');
  });

  it('opens with ArrowDown, skips disabled, selects with Enter', () => {
    const { fixture, host, trigger, key, listOf, active } = setup();
    key(trigger, 'ArrowDown');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(listOf(trigger).matches(':popover-open')).toBe(true);
    expect(active(trigger)?.textContent).toContain('Київ');
    key(trigger, 'ArrowDown');
    expect(active(trigger)?.textContent).toContain('Луцьк');
    key(trigger, 'Enter');
    fixture.detectChanges();
    expect(host.city.value).toBe('lutsk');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Луцьк');
  });

  it('typeahead on a closed select opens on the match', () => {
    const { trigger, key, active } = setup();
    key(trigger, 'о');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(active(trigger)?.textContent).toContain('Одеса');
  });

  it('Escape closes without changing the value; writeValue updates the view', () => {
    const { fixture, host, trigger, key } = setup();
    key(trigger, 'ArrowDown');
    key(trigger, 'Escape');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(host.city.value).toBeNull();
    host.city.setValue('odesa');
    fixture.detectChanges();
    expect(trigger.textContent).toContain('Одеса');
  });

  it('shows the field error after touch', async () => {
    const { fixture, host, trigger, root } = setup();
    host.city.markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('.vd-field__error')?.textContent).toContain('Оберіть місто');
  });

  it('combobox filters as you type and picks the active match', () => {
    const { fixture, host, input, key, root, active } = setup();
    input.value = 'пол';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const visible = Array.from(root.querySelectorAll<HTMLElement>('vd-combobox vd-option')).filter(
      (o) => !o.hidden,
    );
    expect(visible.map((o) => o.textContent?.trim())).toEqual(['Польща']);
    expect(active(input)?.textContent).toContain('Польща');
    key(input, 'Enter');
    fixture.detectChanges();
    expect(host.country()).toBe('pl');
    expect(input.value).toBe('Польща');
  });

  it('combobox shows the empty text when nothing matches', () => {
    const { fixture, input, root } = setup();
    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelector('vd-combobox .vd-listbox__empty')?.textContent).toContain('Нічого');
  });
});
