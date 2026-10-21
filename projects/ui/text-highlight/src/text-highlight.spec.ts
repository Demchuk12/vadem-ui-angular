import { TestBed } from '@angular/core/testing';
import { VdTextHighlight } from './text-highlight';

describe('Text highlight', () => {
  it('renders the exact source text with native marks and no extra roles, spacing or focus targets', async () => {
    const fixture = TestBed.createComponent(VdTextHighlight);
    const text = '  ЗВІТ за зміну.\nЩе звіт!  ';
    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('query', 'звіт');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toBe(text);
    expect([...root.querySelectorAll('mark')].map((mark) => mark.textContent)).toEqual([
      'ЗВІТ',
      'звіт',
    ]);
    expect(root.querySelector('[role], [tabindex], [aria-live]')).toBeNull();
    expect(root.hasAttribute('tabindex')).toBe(false);
    expect(root.getAttribute('data-state')).toBe('matched');
  });
  it('renders apparent HTML as text, including when query fragments are tags', async () => {
    const fixture = TestBed.createComponent(VdTextHighlight);
    const text = '<img src=x onerror="alert(1)"><strong>Report</strong>';
    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('query', '<strong>');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toBe(text);
    expect(root.querySelector('img, strong, script')).toBeNull();
    expect(root.querySelector('mark')!.textContent).toBe('<strong>');
  });
  it('reacts to text/query changes and returns to plain/empty states', async () => {
    const fixture = TestBed.createComponent(VdTextHighlight);
    fixture.componentRef.setInput('text', 'Report');
    fixture.componentRef.setInput('query', 'report');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('query', 'missing');
    await fixture.whenStable();
    expect(root.querySelector('mark')).toBeNull();
    expect(root.textContent).toBe('Report');
    expect(root.getAttribute('data-state')).toBe('plain');
    fixture.componentRef.setInput('text', 'missing missing');
    await fixture.whenStable();
    expect(root.querySelectorAll('mark')).toHaveLength(2);
    fixture.componentRef.setInput('text', '');
    await fixture.whenStable();
    expect(root.textContent).toBe('');
    expect(root.getAttribute('data-state')).toBe('empty');
  });
});
