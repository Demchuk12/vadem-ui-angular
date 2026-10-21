import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdFormErrorSummary } from './form-error-summary';

const errors = [{ target: 'email:contact', message: 'Enter an email address.' }];

async function setup() {
  const fixture = TestBed.createComponent(VdFormErrorSummary);
  const root = fixture.nativeElement as HTMLElement;
  // jsdom has no layout/scrolling; browser geometry is covered by Playwright.
  Object.defineProperty(root, 'scrollIntoView', { value: vi.fn() });
  await fixture.whenStable();
  return { fixture, root };
}

describe('Form error summary', () => {
  it('hides empty content and renders a labelled region with native links for errors', async () => {
    const { fixture, root } = await setup();
    expect(root.hidden).toBe(true);
    expect(root.getAttribute('role')).toBeNull();
    expect(root.querySelector('a')).toBeNull();
    fixture.componentRef.setInput('errors', errors);
    await fixture.whenStable();
    expect(root.hidden).toBe(false);
    expect(root.getAttribute('role')).toBe('region');
    expect(root.tabIndex).toBe(-1);
    expect(root.getAttribute('aria-labelledby')).toBe(root.querySelector('h2')!.id);
    expect(root.getAttribute('aria-describedby')).toBe(root.querySelector('p')!.id);
    expect(root.querySelector('a')!.getAttribute('href')).toBe('#email%3Acontact');
    expect(root.querySelector('[role=alert], [aria-live]')).toBeNull();
  });

  it('only focuses explicitly, after freshly supplied errors render; empty requests do nothing', async () => {
    const { fixture, root } = await setup();
    fixture.componentRef.setInput('errors', errors);
    await fixture.whenStable();
    expect(document.activeElement).not.toBe(root);
    fixture.componentInstance.focus();
    await fixture.whenStable();
    expect(document.activeElement).toBe(root);
    fixture.componentRef.setInput('errors', []);
    await fixture.whenStable();
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    fixture.componentInstance.focus();
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
    outside.remove();
    expect(root.getAttribute('aria-labelledby')).toBeNull();
  });

  it('uses exact IDs, prevents ordinary hash navigation and preserves modified clicks', async () => {
    const { fixture, root } = await setup();
    const field = document.createElement('input');
    field.id = errors[0].target;
    document.body.append(field);
    vi.spyOn(field, 'getClientRects').mockReturnValue([new DOMRect()] as unknown as DOMRectList);
    try {
      fixture.componentRef.setInput('errors', errors);
      await fixture.whenStable();
      const link = root.querySelector('a')!;
      const click = new MouseEvent('click', { button: 0, bubbles: true, cancelable: true });
      link.dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(field);
      link.focus();
      const modified = new MouseEvent('click', { ctrlKey: true, bubbles: true, cancelable: true });
      // Cancel in a parent after the component listener to avoid jsdom following the URL.
      let intercepted = false;
      root.addEventListener(
        'click',
        (event) => {
          intercepted = event.defaultPrevented;
          event.preventDefault();
        },
        { once: true },
      );
      link.dispatchEvent(modified);
      expect(intercepted).toBe(false);
      expect(document.activeElement).toBe(link);
    } finally {
      field.remove();
    }
  });

  it('keeps focus for unavailable targets without changing the field or throwing', async () => {
    const { fixture, root } = await setup();
    const field = document.createElement('input');
    field.id = 'unavailable';
    field.disabled = true;
    document.body.append(field);
    try {
      fixture.componentRef.setInput('errors', [
        { target: field.id, message: 'Disabled target' },
        { target: 'missing', message: 'Missing target' },
      ]);
      await fixture.whenStable();
      for (const link of root.querySelectorAll('a')) {
        link.focus();
        link.click();
        expect(document.activeElement).toBe(link);
      }
      expect(field.hasAttribute('tabindex')).toBe(false);
    } finally {
      field.remove();
    }
  });

  it('retains ordered duplicate targets, escapes message content and permits an empty description', async () => {
    const { fixture, root } = await setup();
    fixture.componentRef.setInput('errors', [
      errors[0],
      { target: errors[0].target, message: '<strong>Plain text</strong>' },
    ]);
    fixture.componentRef.setInput('description', '');
    await fixture.whenStable();
    expect(root.querySelectorAll('a')).toHaveLength(2);
    expect(root.querySelector('strong')).toBeNull();
    expect(root.textContent).toContain('<strong>Plain text</strong>');
    expect(root.getAttribute('aria-describedby')).toBeNull();
  });

  it('resolves Ukrainian defaults with explicit text overrides', async () => {
    TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] });
    const { fixture, root } = await setup();
    fixture.componentRef.setInput('errors', errors);
    await fixture.whenStable();
    expect(root.querySelector('h2')!.textContent).toContain('Перевірте форму');
    fixture.componentRef.setInput('title', 'Check these details');
    await fixture.whenStable();
    expect(root.querySelector('h2')!.textContent).toContain('Check these details');
    fixture.destroy();
    expect(() => fixture.componentInstance.focus()).not.toThrow();
  });
});
