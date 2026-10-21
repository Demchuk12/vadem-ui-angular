import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, disabled, form, required } from '@angular/forms/signals';
import { VdField } from '@vadem/ui/field';
import { VdCombobox, VdOption, VdSelect } from '@vadem/ui/select';
import { installFakePopover } from '../../test-utils/fake-popover';

@Component({
  imports: [ReactiveFormsModule, VdField, VdSelect, VdCombobox, VdOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-field label="Місто" hint="Оберіть зі списку" error="Вкажіть місто">
      @if (kind() === 'select') {
        <vd-select [formControl]="control" [disabled]="disabled()" placeholder="Оберіть">
          @for (option of options(); track option.value) {
            <vd-option [value]="option.value" [disabled]="option.disabled">{{
              option.label
            }}</vd-option>
          }
        </vd-select>
      } @else {
        <vd-combobox [formControl]="control" [disabled]="disabled()" placeholder="Оберіть">
          @for (option of options(); track option.value) {
            <vd-option [value]="option.value" [disabled]="option.disabled">{{
              option.label
            }}</vd-option>
          }
        </vd-combobox>
      }
    </vd-field>
  `,
})
class Host {
  readonly kind = input<'select' | 'combobox'>('select');
  readonly control = new FormControl<string | null>('kyiv', Validators.required);
  readonly disabled = signal(false);
  readonly options = signal([
    { value: 'kyiv', label: 'Київ', disabled: false },
    { value: 'lviv', label: 'Львів', disabled: false },
    { value: 'odesa', label: 'Одеса', disabled: false },
  ]);
}

@Component({
  imports: [FormField, VdField, VdSelect, VdCombobox, VdOption],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-field label="Місто" error="Вкажіть місто">
      @if (kind() === 'select') {
        <vd-select [formField]="fields.city">
          <vd-option value="kyiv">Київ</vd-option>
          <vd-option value="lviv">Львів</vd-option>
        </vd-select>
      } @else {
        <vd-combobox [formField]="fields.city">
          <vd-option value="kyiv">Київ</vd-option>
          <vd-option value="lviv">Львів</vd-option>
        </vd-combobox>
      }
    </vd-field>
  `,
})
class SignalHost {
  readonly kind = input<'select' | 'combobox'>('select');
  readonly unavailable = signal(false);
  readonly needed = signal(true);
  readonly model = signal({ city: null as string | null });
  readonly fields = form(this.model, (path) => {
    required(path.city, { when: () => this.needed() });
    disabled(path.city, () => this.unavailable());
  });
}

describe('Select/Combobox lifecycle', () => {
  beforeAll(installFakePopover);

  async function setup(kind: 'select' | 'combobox') {
    const fixture = TestBed.createComponent(Host);
    fixture.componentRef.setInput('kind', kind);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const control = root.querySelector<HTMLElement>('[role=combobox]')!;
    const list = root.querySelector<HTMLElement>('[role=listbox]')!;
    const key = async (key: string) => {
      control.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const render = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const active = () =>
      root.querySelector<HTMLElement>(`[id="${control.getAttribute('aria-activedescendant')}"]`);
    return { fixture, host: fixture.componentInstance, root, control, list, key, render, active };
  }

  for (const kind of ['select', 'combobox'] as const) {
    describe(kind, () => {
      it('closes its open popup when disabled through forms or its input', async () => {
        const { host, control, list, key, render } = await setup(kind);
        await key('ArrowDown');
        expect(list.matches(':popover-open')).toBe(true);
        host.control.disable();
        await render();
        expect(list.matches(':popover-open')).toBe(false);
        expect(control.getAttribute('aria-expanded')).toBe('false');
        expect(control.hasAttribute('disabled')).toBe(true);
        expect(host.control.touched).toBe(false);
        host.control.enable();
        await render();
        await key('ArrowDown');
        host.disabled.set(true);
        await render();
        expect(list.matches(':popover-open')).toBe(false);
        expect(host.control.value).toBe('kyiv');
      });

      it('repairs a removed or disabled active option without changing the selection', async () => {
        const { host, control, key, render, active } = await setup(kind);
        const changes: (string | null)[] = [];
        host.control.valueChanges.subscribe((value) => changes.push(value));
        await key('ArrowDown');
        await key('ArrowDown');
        expect(active()?.textContent).toContain('Львів');
        host.options.update((options) => options.filter((option) => option.value !== 'lviv'));
        await render();
        expect(active()?.textContent).toContain('Київ');
        host.options.update((options) =>
          options.map((option) => ({ ...option, disabled: option.value === 'kyiv' })),
        );
        await render();
        expect(active()?.textContent).toContain('Одеса');
        host.options.update((options) => options.map((option) => ({ ...option, disabled: true })));
        await render();
        expect(control.hasAttribute('aria-activedescendant')).toBe(false);
        expect(host.control.value).toBe('kyiv');
        expect(changes).toEqual([]);
      });

      it('keeps an unavailable selected value owned by the consumer and restores its label when options return', async () => {
        const { host, control, key, render, active } = await setup(kind);
        const original = host.options();
        await key('ArrowDown');
        host.options.set([]);
        await render();
        expect(control.hasAttribute('aria-activedescendant')).toBe(false);
        expect(host.control.value).toBe('kyiv');
        host.options.set(original);
        await render();
        expect(active()?.textContent).toContain('Київ');
        expect(host.control.value).toBe('kyiv');
      });

      it('resets displayed invalid state and mirrors required validator changes', async () => {
        const { host, control, root, render } = await setup(kind);
        host.control.reset();
        host.control.markAsTouched();
        await render();
        expect(control.getAttribute('aria-invalid')).toBe('true');
        expect(root.querySelector('.vd-field__error')).not.toBeNull();
        host.control.reset();
        await render();
        expect(control.getAttribute('aria-invalid')).toBeNull();
        expect(root.querySelector('.vd-field__error')).toBeNull();
        expect(control.getAttribute('aria-required')).toBe('true');
        host.control.clearValidators();
        host.control.updateValueAndValidity();
        await render();
        expect(control.getAttribute('aria-required')).toBeNull();
        expect(root.querySelector('.vd-field__required')).toBeNull();
      });
    });
  }

  it('combobox discards a pending query on form reset or a programmatic write', async () => {
    const { host, control, root, render } = await setup('combobox');
    const input = control as HTMLInputElement;
    input.value = 'льв';
    input.dispatchEvent(new Event('input'));
    await render();
    host.control.reset();
    await render();
    expect(input.value).toBe('');
    expect(root.querySelectorAll('vd-option:not([hidden])').length).toBe(3);
    input.value = 'оде';
    input.dispatchEvent(new Event('input'));
    await render();
    host.control.setValue('lviv');
    await render();
    expect(input.value).toBe('Львів');
  });
});

describe('Select/Combobox Signal Forms lifecycle', () => {
  beforeAll(installFakePopover);

  for (const kind of ['select', 'combobox'] as const) {
    it(`${kind} reports user touch and reflects required, reset and disabled state`, async () => {
      const fixture = TestBed.createComponent(SignalHost);
      fixture.componentRef.setInput('kind', kind);
      fixture.detectChanges();
      await fixture.whenStable();
      const host = fixture.componentInstance;
      const root = fixture.nativeElement as HTMLElement;
      const control = root.querySelector<HTMLElement>('[role=combobox]')!;
      expect(control.getAttribute('aria-required')).toBe('true');
      expect(control.getAttribute('aria-invalid')).toBeNull();
      control.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(host.fields.city().touched()).toBe(true);
      expect(control.getAttribute('aria-invalid')).toBe('true');
      host.fields().reset();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(control.getAttribute('aria-invalid')).toBeNull();
      control.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(control.getAttribute('aria-expanded')).toBe('true');
      host.unavailable.set(true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(control.hasAttribute('disabled')).toBe(true);
      expect(control.getAttribute('aria-expanded')).toBe('false');
      expect(host.fields.city().touched()).toBe(false);
      host.unavailable.set(false);
      host.needed.set(false);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(control.getAttribute('aria-required')).toBeNull();
      expect(root.querySelector('.vd-field__required')).toBeNull();
    });
  }

  it('clears a combobox query when Signal Forms resets an unchanged null model', async () => {
    const fixture = TestBed.createComponent(SignalHost);
    fixture.componentRef.setInput('kind', 'combobox');
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'льв';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.fields().reset();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(fixture.componentInstance.model().city).toBeNull();
  });
});
