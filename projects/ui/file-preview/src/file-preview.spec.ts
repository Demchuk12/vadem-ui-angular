import { TestBed } from '@angular/core/testing';
import { VdFilePreview } from './file-preview';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';

// Dialog focus/layout is verified in a real browser; jsdom has no native modal implementation.
const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
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
    ['showModal', originalShow],
    ['close', originalClose],
  ] as const) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, key, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, key);
  }
});

describe('File preview', () => {
  it('does not expose file content or a download while closed, and resolves Ukrainian copy', async () => {
    TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] });
    const fixture = TestBed.createComponent(VdFilePreview);
    fixture.componentRef.setInput(
      'file',
      new File(['text'], 'Нотатки.txt', { type: 'text/plain' }),
    );
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h2')?.textContent).toBe('Нотатки.txt');
    expect(root.querySelector('button')?.textContent).toContain('Закрити');
    expect(root.querySelector('a, img, object')).toBeNull();
    expect(root.querySelector('dialog')?.open).toBe(false);
  });
  it('keeps caller-authored names and labels as text and shows an empty state without a link', async () => {
    const fixture = TestBed.createComponent(VdFilePreview);
    fixture.componentRef.setInput('name', '<script>filename</script>');
    fixture.componentRef.setInput('closeLabel', 'Dismiss preview');
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h2')?.textContent).toBe('<script>filename</script>');
    expect(root.querySelector('script, a, img, object')).toBeNull();
    expect(root.querySelector('[data-state]')?.getAttribute('data-state')).toBe('empty');
    expect(root.querySelector('button')?.textContent).toContain('Dismiss preview');
    root.querySelector('button')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
