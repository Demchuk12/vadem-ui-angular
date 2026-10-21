import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdAlertDialog, type VdAlertDialogAction } from './alert-dialog';

const show = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    },
  });
});
afterAll(() => {
  for (const [key, descriptor] of [
    ['showModal', show],
    ['close', close],
  ] as const) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, key, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, key);
  }
});
async function setup(action: VdAlertDialogAction = () => undefined) {
  TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] });
  const fixture = TestBed.createComponent(VdAlertDialog);
  fixture.componentRef.setInput('title', 'Видалити звіт?');
  fixture.componentRef.setInput('description', 'Відновлення буде неможливим.');
  fixture.componentRef.setInput('action', action);
  fixture.componentRef.setInput('open', true);
  await fixture.whenStable();
  const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
  const [cancel, confirm] = [...dialog.querySelectorAll('button')];
  const state = () => dialog.getAttribute('data-state');
  return { fixture, dialog, cancel, confirm, state };
}
function deferred() {
  let resolve!: () => void, reject!: (reason: unknown) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('Alert dialog', () => {
  it('names/describes the alert and cancels without running the action', async () => {
    const action = vi.fn();
    const { fixture, dialog, cancel, state } = await setup(action);
    const canceled = vi.fn();
    fixture.componentInstance.canceled.subscribe(canceled);
    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.querySelector('h2')!.id).toBe(dialog.getAttribute('aria-labelledby'));
    expect(dialog.querySelector('[vdDialogDescription]')!.id).toBe(
      dialog.getAttribute('aria-describedby'),
    );
    expect(cancel.textContent).toContain('Скасувати');
    expect(cancel.hasAttribute('autofocus')).toBe(true);
    expect(state()).toBe('idle');
    cancel.click();
    await fixture.whenStable();
    expect(action).not.toHaveBeenCalled();
    expect(canceled).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.open()).toBe(false);
  });
  it('guards duplicate action, cancel and Escape while pending; success emits once', async () => {
    const work = deferred(),
      action = vi.fn(() => work.promise);
    const { fixture, dialog, cancel, confirm, state } = await setup(action);
    const done = vi.fn();
    fixture.componentInstance.confirmed.subscribe(done);
    confirm.click();
    confirm.click();
    cancel.click();
    const escape = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(escape);
    await fixture.whenStable();
    expect(action).toHaveBeenCalledTimes(1);
    expect(state()).toBe('pending');
    expect(escape.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.open()).toBe(true);
    expect(cancel.getAttribute('aria-disabled')).toBe('true');
    work.resolve();
    await work.promise;
    await fixture.whenStable();
    expect(done).toHaveBeenCalledTimes(1);
    expect(state()).toBe('closed');
  });
  it('keeps failure visible, emits the original exception and retries the current callback', async () => {
    const error = new Error('<script>do not render</script>');
    let attempts = 0;
    const { fixture, dialog, confirm, state } = await setup(() => {
      if (++attempts === 1) throw error;
    });
    const failed = vi.fn();
    fixture.componentInstance.actionFailed.subscribe(failed);
    confirm.click();
    await fixture.whenStable();
    expect(state()).toBe('error');
    expect(failed).toHaveBeenCalledWith(error);
    expect(dialog.textContent).toContain('Не вдалося виконати дію.');
    expect(dialog.textContent).not.toContain(error.message);
    confirm.click();
    await fixture.whenStable();
    expect(attempts).toBe(2);
    expect(fixture.componentInstance.open()).toBe(false);
  });
  it.each(['resolve', 'reject'] as const)(
    'ignores a stale %s after external close/reopen',
    async (outcome) => {
      const work = deferred();
      const { fixture, confirm, state } = await setup(() => work.promise);
      const failed = vi.fn(),
        done = vi.fn();
      fixture.componentInstance.actionFailed.subscribe(failed);
      fixture.componentInstance.confirmed.subscribe(done);
      confirm.click();
      await fixture.whenStable();
      fixture.componentRef.setInput('open', false);
      await fixture.whenStable();
      fixture.componentRef.setInput('open', true);
      await fixture.whenStable();
      if (outcome === 'reject') work.reject(new Error('old failure'));
      else work.resolve();
      await work.promise.catch(() => undefined);
      await fixture.whenStable();
      expect(state()).toBe('idle');
      expect(failed).not.toHaveBeenCalled();
      expect(done).not.toHaveBeenCalled();
    },
  );
  it('ignores successful work after destruction and does not emit', async () => {
    const work = deferred();
    const { fixture, confirm } = await setup(() => work.promise);
    const done = vi.fn();
    fixture.componentInstance.confirmed.subscribe(done);
    confirm.click();
    await fixture.whenStable();
    fixture.destroy();
    work.resolve();
    await work.promise;
    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();
  });
  it('treats text overrides as text and Escape as cancel when not pending', async () => {
    const { fixture, dialog, state } = await setup();
    fixture.componentRef.setInput('title', '<b>Question</b>');
    fixture.componentRef.setInput('confirmLabel', 'Proceed');
    await fixture.whenStable();
    expect(dialog.querySelector('b')).toBeNull();
    expect(dialog.textContent).toContain('<b>Question</b>');
    expect(dialog.textContent).toContain('Proceed');
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();
    expect(state()).toBe('closed');
  });
});
