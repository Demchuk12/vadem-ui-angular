import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdEditableText, type VdEditableTextSave } from './editable-text';
import { vdEditableTextIssue, vdEditableTextLimit } from './core/editable-text';

@Component({
  imports: [VdEditableText],
  template: `<vd-editable-text
      label="Name"
      [(value)]="value"
      [save]="save"
      required
      (saveFailed)="failure = $event"
    /><button class="outside">Outside</button>`,
})
class Host {
  readonly value = signal('Original');
  save: VdEditableTextSave | undefined;
  failure: unknown;
}

async function setup(save?: VdEditableTextSave) {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.save = save;
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  root.querySelector<HTMLButtonElement>('.vd-editable-text__trigger')!.click();
  await fixture.whenStable();
  const input = root.querySelector('input')!;
  const fill = async (value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  };
  const key = async (key: string, isComposing = false) => {
    const event = new KeyboardEvent('keydown', {
      key,
      isComposing,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    await fixture.whenStable();
    return event;
  };
  return { fixture, host: fixture.componentInstance, root, input, fill, key };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('Editable text', () => {
  it('keeps a separate draft, selects the editor and restores focus on cancel', async () => {
    const x = await setup();
    expect(document.activeElement).toBe(x.input);
    expect(x.input.selectionEnd).toBe('Original'.length);
    await x.fill('Draft');
    expect(x.host.value()).toBe('Original');
    await x.key('Escape');
    expect(x.root.querySelector('input')).toBeNull();
    expect(document.activeElement).toBe(x.root.querySelector('.vd-editable-text__trigger'));
    expect(x.host.value()).toBe('Original');
  });

  it('validates before persistence and does not save unchanged text', async () => {
    const save = vi.fn();
    const x = await setup(save);
    await x.fill('   ');
    expect((await x.key('Enter')).defaultPrevented).toBe(true);
    expect(x.input.getAttribute('aria-invalid')).toBe('true');
    expect(save).not.toHaveBeenCalled();
    await x.fill('Original');
    await x.key('Enter');
    expect(save).not.toHaveBeenCalled();
    expect(x.root.querySelector('input')).toBeNull();
  });

  it('blocks duplicate saves, preserves the draft after failure and retries it', async () => {
    const pending = deferred();
    const save = vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(undefined);
    const x = await setup(save);
    await x.fill('Changed');
    await x.key('Enter');
    expect(x.input.readOnly).toBe(true);
    await x.key('Enter');
    await x.key('Escape');
    expect(save).toHaveBeenCalledTimes(1);
    expect(x.host.value()).toBe('Original');
    const error = new Error('Private backend detail');
    pending.reject(error);
    await pending.promise.catch(() => undefined);
    await x.fixture.whenStable();
    expect(x.input.value).toBe('Changed');
    expect(x.host.failure).toBe(error);
    expect(x.root.textContent).not.toContain(error.message);
    expect(x.input.readOnly).toBe(false);
    await x.key('Enter');
    expect(x.host.value()).toBe('Changed');
    expect(save).toHaveBeenLastCalledWith('Changed');
  });

  it('preserves newer external writes and focus outside the widget on completion', async () => {
    const pending = deferred();
    const x = await setup(() => pending.promise);
    await x.fill('Draft');
    await x.key('Enter');
    const outside = x.root.querySelector<HTMLButtonElement>('.outside')!;
    outside.focus();
    x.host.value.set('Newer server value');
    await x.fixture.whenStable();
    pending.resolve();
    await pending.promise;
    await x.fixture.whenStable();
    expect(x.host.value()).toBe('Newer server value');
    expect(document.activeElement).toBe(outside);
  });

  it('ignores IME confirmation and late completion after destruction', async () => {
    const pending = deferred();
    const save = vi.fn(() => pending.promise);
    const x = await setup(save);
    await x.fill('日本語');
    expect((await x.key('Enter', true)).defaultPrevented).toBe(false);
    expect(save).not.toHaveBeenCalled();
    await x.key('Enter');
    x.fixture.destroy();
    pending.resolve();
    await pending.promise;
    expect(x.host.value()).toBe('Original');
  });

  it('uses the provided Ukrainian locale and permits explicit text overrides', async () => {
    TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] });
    const fixture = TestBed.createComponent(VdEditableText);
    fixture.componentRef.setInput('label', 'Назва');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('button')!.getAttribute('aria-label')).toBe(
      'Редагувати Назва: Додати значення',
    );
    root.querySelector('button')!.click();
    await fixture.whenStable();
    expect(root.textContent).toContain('Зберегти');
    fixture.componentRef.setInput('saveLabel', 'Готово');
    await fixture.whenStable();
    expect(root.textContent).toContain('Готово');
  });

  it('normalizes limits and validates whitespace and UTF-16 length without trimming', () => {
    expect(vdEditableTextLimit(-1)).toBeNull();
    expect(vdEditableTextLimit(Infinity)).toBeNull();
    expect(vdEditableTextLimit(2.8)).toBe(2);
    expect(vdEditableTextIssue('', false, 0)).toBeNull();
    expect(vdEditableTextIssue(' ', true, null)).toBe('required');
    expect(vdEditableTextIssue('😀', false, 1)).toBe('tooLong');
    expect(vdEditableTextIssue(' x ', true, 3)).toBeNull();
  });
});
