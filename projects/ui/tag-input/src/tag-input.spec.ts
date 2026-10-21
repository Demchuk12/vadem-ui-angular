import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, minLength, required } from '@angular/forms/signals';
import { VdField } from '@vadem/ui/field';
import { VdTagInput } from './tag-input';

@Component({
  imports: [ReactiveFormsModule, VdField, VdTagInput, FormField],
  template: `
    <vd-field label="Tags" hint="Enter a tag" error="Add a tag">
      <vd-tag-input [formControl]="tags" [readonly]="readonly()" />
    </vd-field>
    <vd-field label="Skills" error="Add a skill"
      ><vd-tag-input [formField]="skillsForm.skills"
    /></vd-field>
    <button type="button">Outside</button>
  `,
})
class Host {
  readonly tags = new FormControl<string[]>(['Дизайн'], Validators.required);
  readonly readonly = signal(false);
  readonly skillsModel = signal({ skills: [] as string[] });
  readonly skillsForm = form(this.skillsModel, (p) => {
    required(p.skills);
    minLength(p.skills, 1);
  });
}

describe('Tag input integration', () => {
  afterEach(() => document.body.replaceChildren());
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    const control = root.querySelector('vd-tag-input')!;
    const input = control.querySelector('input')!;
    const type = async (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    };
    const key = async (value: string, extra: KeyboardEventInit = {}) => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...extra }),
      );
      await fixture.whenStable();
    };
    return { fixture, root, control, input, host: fixture.componentInstance, type, key };
  }
  it('wires Field to the inner textbox and committed required state', async () => {
    const { root, control, input } = await setup();
    expect(root.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.required).toBe(false);
    expect(input.getAttribute('aria-describedby')).toContain('vd-field-hint');
    expect(input.hasAttribute('role')).toBe(false);
    expect(control.querySelector('ul')?.getAttribute('role')).toBe('list');
    expect(control.querySelector('button')?.getAttribute('aria-label')).toBe('Remove Дизайн');
  });
  it('commits only an explicit addition, preserves focus and does not touch on internal moves', async () => {
    const { host, input, control, type, key } = await setup();
    input.focus();
    await type(' Angular ');
    expect(host.tags.value).toEqual(['Дизайн']);
    expect(host.tags.pristine).toBe(true);
    await key('Enter');
    expect(host.tags.value).toEqual(['Дизайн', 'Angular']);
    expect(host.tags.dirty).toBe(true);
    expect(host.tags.touched).toBe(false);
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
    expect(control.querySelector('[role=status]')?.textContent).toBe('Added Angular.');
  });
  it('keeps duplicates as draft, announces repeated attempts and ignores IME Enter', async () => {
    const { host, input, control, type, key } = await setup();
    await type(' ДИЗАЙН ');
    await key('Enter');
    expect(input.value).toBe(' ДИЗАЙН ');
    expect(host.tags.value).toEqual(['Дизайн']);
    expect(host.tags.pristine).toBe(true);
    expect(control.querySelector('[role=status]')?.textContent).toBe('ДИЗАЙН is already added.');
    await key('Enter');
    expect(control.querySelector('[role=status]')?.textContent).toBe('ДИЗАЙН is already added.');
    await type('日本語');
    await key('Enter', { isComposing: true });
    expect(host.tags.value).toEqual(['Дизайн']);
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    await key('Enter');
    expect(host.tags.value).toEqual(['Дизайн']);
    input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await key('Enter');
    expect(host.tags.value).toEqual(['Дизайн', '日本語']);
  });
  it('Backspace only focuses removal; activation removes and restores the input', async () => {
    const { host, input, control, key, fixture } = await setup();
    input.focus();
    await key('Backspace');
    const remove = control.querySelector('button')!;
    expect(document.activeElement).toBe(remove);
    expect(host.tags.value).toEqual(['Дизайн']);
    expect(host.tags.touched).toBe(false);
    remove.click();
    await fixture.whenStable();
    expect(host.tags.value).toEqual([]);
    expect(document.activeElement).toBe(input);
    expect(host.tags.touched).toBe(false);
    expect(control.querySelector('ul')).toBeNull();
  });
  it('handles programmatic values, reset, disabled and read-only without spurious user edits', async () => {
    const { host, control, input, type, key, fixture } = await setup();
    await type('Draft');
    host.tags.setValue([' UI ', 'ui']);
    await fixture.whenStable();
    expect(control.querySelectorAll('li')).toHaveLength(1);
    expect(input.value).toBe('');
    expect(host.tags.pristine).toBe(true);
    host.tags.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(control.querySelector('button')!.disabled).toBe(true);
    await type('Blocked');
    await key('Enter');
    expect(host.tags.value).toEqual([' UI ', 'ui']);
    host.tags.enable();
    host.readonly.set(true);
    await fixture.whenStable();
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(false);
    await key('Enter');
    expect(host.tags.value).toEqual([' UI ', 'ui']);
    host.tags.reset();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(control.querySelectorAll('li')).toHaveLength(0);
  });
  it('touches only on whole-control exit and shows Reactive and Signal form errors after touch', async () => {
    const { root, input, control, host, fixture } = await setup();
    host.tags.reset();
    await fixture.whenStable();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    input.focus();
    root.querySelectorAll('input')[1].focus();
    await fixture.whenStable();
    expect(host.tags.touched).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(control.parentElement!.textContent).toContain('Add a tag');
    const skillsInput = root.querySelectorAll('input')[1];
    root.querySelector<HTMLButtonElement>(':scope > button')!.focus();
    await fixture.whenStable();
    expect(host.skillsForm.skills().touched()).toBe(true);
    expect(skillsInput.getAttribute('aria-invalid')).toBe('true');
  });
  it('lets Signal Forms focus the inner textbox instead of the nonfocusable host', async () => {
    const { fixture, root } = await setup();
    const field = fixture.debugElement.queryAll(By.directive(FormField))[0].injector.get(FormField);
    field.focus({ preventScroll: true });
    expect(document.activeElement).toBe(root.querySelectorAll('input')[1]);
  });
  it('updates Signal Forms and supports programmatic values and UI reset', async () => {
    const { root, host, fixture } = await setup();
    const input = root.querySelectorAll('input')[1];
    input.value = 'Angular';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(host.skillsModel().skills).toEqual(['Angular']);
    host.skillsModel.set({ skills: ['TypeScript'] });
    await fixture.whenStable();
    expect(input.parentElement!.textContent).toContain('TypeScript');
    input.value = 'Draft';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    host.skillsForm().reset({ skills: [] });
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(host.skillsModel().skills).toEqual([]);
  });
});
