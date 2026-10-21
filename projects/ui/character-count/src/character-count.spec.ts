import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VdField } from '@vadem/ui/field';
import { VdInput } from '@vadem/ui/input';
import { vdLocaleEn, vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdCharacterCount } from './character-count';

@Component({
  imports: [VdField, VdInput, VdCharacterCount, ReactiveFormsModule],
  template: `<vd-field
      label="Comment"
      hint="Keep it short"
      error="Shorten the comment"
      [descriptionIds]="count.descriptionId() + ' extra ' + count.descriptionId()"
    >
      <textarea vdInput id="counter-field" [formControl]="control" [invalid]="invalid()"></textarea>
      <vd-character-count #count [value]="value()" [maxLength]="5" controlId="counter-field" />
    </vd-field>
    <p id="extra">Extra description</p>`,
})
class Host {
  readonly control = new FormControl('', { nonNullable: true });
  readonly value = signal('');
  readonly invalid = signal(false);
}

describe('Character count', () => {
  it('keeps counter and extra descriptions with both the Field hint and error, deduplicated', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('textarea')!;
    const description = root.querySelector('.vd-character-count__content')!;
    const ids = () => input.getAttribute('aria-describedby')!.split(' ');
    expect(ids()).toEqual([root.querySelector('.vd-field__hint')!.id, description.id, 'extra']);
    fixture.componentInstance.invalid.set(true);
    fixture.componentInstance.value.set('long comment');
    await fixture.whenStable();
    expect(ids()).toEqual([root.querySelector('.vd-field__error')!.id, description.id, 'extra']);
    expect(root.querySelector('vd-character-count')!.getAttribute('data-state')).toBe('over');
    expect(root.querySelector('.vd-character-count__message')!.textContent).toContain(
      '7 characters over',
    );
    expect(root.querySelector('[role=status]')!.textContent).toBe('');
    expect(description.querySelector('[role=status]')).toBeNull();
    expect(fixture.componentInstance.control.value).toBe('');
  });

  it('renders initial over-limit content silently and permits text overrides', async () => {
    const fixture = TestBed.createComponent(VdCharacterCount);
    fixture.componentRef.setInput('value', 'abcdef');
    fixture.componentRef.setInput('maxLength', 5);
    fixture.componentRef.setInput('overText', (excess: number) => `Remove ${excess}`);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('6 / 5');
    expect(root.textContent).toContain('Remove 1');
    expect(root.querySelector('[role=status]')!.textContent).toBe('');
    expect(root.hasAttribute('tabindex')).toBe(false);
    fixture.componentRef.setInput('maxLength', null);
    await fixture.whenStable();
    expect(root.textContent).toContain('6 characters');
    expect(root.querySelector('.vd-character-count__message')).toBeNull();
  });

  it('cleans up a pending focused announcement when destroyed', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const textarea = (fixture.nativeElement as HTMLElement).querySelector('textarea')!;
    textarea.focus();
    const schedule = vi.spyOn(window, 'setTimeout');
    const clear = vi.spyOn(window, 'clearTimeout');
    try {
      fixture.componentInstance.value.set('a');
      await fixture.whenStable();
      const index = schedule.mock.calls.findIndex((call) => call[1] === 1000);
      expect(index).toBeGreaterThanOrEqual(0);
      const timer = schedule.mock.results[index].value;
      fixture.destroy();
      expect(clear).toHaveBeenCalledWith(timer);
    } finally {
      schedule.mockRestore();
      clear.mockRestore();
    }
  });

  it('uses Ukrainian CLDR forms and localized limit text', async () => {
    TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] });
    const fixture = TestBed.createComponent(VdCharacterCount);
    fixture.componentRef.setInput('value', 'зміна');
    fixture.componentRef.setInput('maxLength', 5);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Ліміт символів досягнуто.',
    );
    expect(vdLocaleUk.characterCount.remainingText(1)).toBe('Залишилось 1 символ.');
    expect(vdLocaleUk.characterCount.remainingText(3)).toBe('Залишилось 3 символи.');
    expect(vdLocaleUk.characterCount.remainingText(11)).toBe('Залишилось 11 символів.');
    expect(vdLocaleEn.characterCount.overText(1)).toBe('1 character over the limit.');
  });
});
