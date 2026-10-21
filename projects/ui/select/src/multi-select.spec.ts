import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VdMultiSelect, VdOption } from '@vadem/ui/select';
import { installFakePopover } from '../../test-utils/fake-popover';

@Component({
  imports: [ReactiveFormsModule, VdField, VdMultiSelect, VdOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-field label="Міста" error="Оберіть міста" hint="Міста доставки">
      <vd-multi-select [formControl]="cities" emptyText="Нічого не знайдено">
        @for (option of options(); track option.value) {
          <vd-option [value]="option.value" [label]="option.label" [disabled]="option.disabled">{{
            option.label
          }}</vd-option>
        }
      </vd-multi-select>
    </vd-field>
    <vd-multi-select [(value)]="teams" aria-label="Команди">
      <vd-option value="design">Дизайн</vd-option>
      <vd-option value="support">Підтримка</vd-option>
    </vd-multi-select>
  `,
})
class Host {
  readonly cities = new FormControl<string[]>([], Validators.required);
  readonly teams = signal(['design']);
  readonly options = signal([
    { value: 'kyiv', label: 'Київ', disabled: false },
    { value: 'dnipro', label: 'Дніпро', disabled: true },
    { value: 'lviv', label: 'Львів', disabled: false },
    { value: 'kamianets', label: 'Кам’янець-Подільський', disabled: false },
  ]);
}

describe('VdMultiSelect', () => {
  beforeAll(installFakePopover);
  afterEach(() => document.body.replaceChildren());

  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    const input = root.querySelector<HTMLInputElement>('input')!;
    const list = root.querySelector<HTMLElement>('[role=listbox]')!;
    const key = (key: string, extra: KeyboardEventInit = {}) => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra }),
      );
      fixture.detectChanges();
    };
    const filter = (query: string) => {
      input.value = query;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    return { fixture, host: fixture.componentInstance, root, input, list, key, filter };
  }

  it('wires the label, descriptions and multiple-selection semantics', () => {
    const { root, input, list } = setup();
    expect(root.querySelector('label')!.htmlFor).toBe(input.id);
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(input.getAttribute('aria-describedby')!.split(' ')).toHaveLength(2);
    expect(root.querySelectorAll('input')[1].getAttribute('aria-label')).toBe('Команди');
  });

  it('toggles without closing, preserves focus, and skips disabled options', () => {
    const { input, list, key, host } = setup();
    input.focus();
    key('ArrowDown');
    key('Enter');
    key('ArrowDown');
    key('Enter');
    expect(host.cities.value).toEqual(['kyiv', 'lviv']);
    expect(list.matches(':popover-open')).toBe(true);
    expect(document.activeElement).toBe(input);
    key('Enter');
    expect(host.cities.value).toEqual(['kyiv']);
    key('Tab');
    expect(host.cities.value).toEqual(['kyiv']);
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('filters Ukrainian apostrophes, clears on Escape, and retains selection', () => {
    const { key, filter, host, root, input } = setup();
    filter("кам'ян под");
    const visible = Array.from(root.querySelectorAll<HTMLElement>('vd-field vd-option')).filter(
      (option) => !option.hidden,
    );
    expect(visible).toHaveLength(1);
    key('Enter');
    filter('zzz');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    expect(root.querySelector('.vd-listbox__empty')!.textContent).toContain('Нічого');
    key('Escape');
    expect(input.value).toBe('');
    expect(host.cities.value).toEqual(['kamianets']);
  });

  it('does not commit an IME Enter or an unavailable option', () => {
    const { key, filter, host, root, fixture } = setup();
    filter('ки');
    key('Enter', { isComposing: true });
    expect(host.cities.value).toEqual([]);
    root.querySelectorAll<HTMLElement>('vd-option')[1].click();
    fixture.detectChanges();
    expect(host.cities.value).toEqual([]);
  });

  it('normalizes form writes, preserves unknown values, and resets to an empty array', () => {
    const { host, fixture, root } = setup();
    host.cities.setValue(['kyiv', 'kyiv', 'unknown']);
    fixture.detectChanges();
    expect(root.querySelectorAll('vd-field .vd-multi-select__chip')).toHaveLength(2);
    expect(root.textContent).toContain('unknown');
    host.cities.reset();
    fixture.detectChanges();
    expect(root.querySelectorAll('vd-field .vd-multi-select__chip')).toHaveLength(0);
  });

  it('removes with Backspace, locks disabled selections, and updates a two-way model', () => {
    const { host, fixture, key, root } = setup();
    host.cities.setValue(['kyiv', 'dnipro']);
    fixture.detectChanges();
    key('Backspace');
    expect(host.cities.value).toEqual(['kyiv', 'dnipro']);
    host.cities.setValue(['kyiv', 'lviv']);
    fixture.detectChanges();
    key('Backspace');
    expect(host.cities.value).toEqual(['kyiv']);
    root.querySelectorAll<HTMLButtonElement>('.vd-multi-select__remove')[1].click();
    fixture.detectChanges();
    expect(host.teams()).toEqual([]);
  });

  it('shows required errors after leaving the whole control and closes on form disable', async () => {
    const { host, fixture, input, root, key } = setup();
    input.focus();
    input.blur();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.cities.touched).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('.vd-field__error')!.textContent).toContain('Оберіть міста');
    key('ArrowDown');
    host.cities.disable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('repairs the active descendant when a dynamic option is removed', async () => {
    const { host, fixture, input, key, root } = setup();
    key('ArrowDown');
    host.options.update((options) => options.filter((option) => option.value !== 'kyiv'));
    fixture.detectChanges();
    await fixture.whenStable();
    const active = root.querySelector('#' + input.getAttribute('aria-activedescendant'));
    expect(active?.textContent).toContain('Львів');
  });
});
