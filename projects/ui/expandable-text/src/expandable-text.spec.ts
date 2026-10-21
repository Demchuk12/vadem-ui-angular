import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdExpandableText } from './expandable-text';

beforeEach(() => TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] }));

async function setup(text = '  ЇЄІ\n\nЩе опис.  ', length = 3) {
  const fixture = TestBed.createComponent(VdExpandableText);
  fixture.componentRef.setInput('text', text);
  fixture.componentRef.setInput('previewLength', length);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root };
}
describe('Expandable text', () => {
  it('uses native hidden and unique disclosure references, then restores exact original text', async () => {
    const text = '  ЇЄІ\n\nЩе опис.  ';
    const { fixture, root } = await setup(text);
    const button = root.querySelector('button')!,
      rest = root.querySelector<HTMLElement>('.vd-expandable-text__rest')!;
    expect(button.textContent).toContain('Показати більше');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(rest.id);
    expect(rest.hidden).toBe(true);
    expect(root.querySelector('[aria-hidden=true]')?.textContent).toBe('…');
    const changed = vi.fn();
    fixture.componentInstance.expanded.subscribe(changed);
    button.click();
    await fixture.whenStable();
    expect(root.querySelector('p')!.textContent).toBe(text);
    expect(rest.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.textContent).toContain('Згорнути');
    expect(changed).toHaveBeenCalledWith(true);
    button.click();
    await fixture.whenStable();
    expect(rest.hidden).toBe(true);
  });
  it('has no toggle for short/empty content and retains requested state through text changes', async () => {
    const { fixture, root } = await setup('Ї', 3);
    fixture.componentRef.setInput('expanded', true);
    await fixture.whenStable();
    expect(root.querySelector('button')).toBeNull();
    expect(root.getAttribute('data-state')).toBe('plain');
    fixture.componentRef.setInput('text', 'ЇЄІҐ');
    await fixture.whenStable();
    expect(root.getAttribute('data-state')).toBe('expanded');
    fixture.componentRef.setInput('text', '');
    await fixture.whenStable();
    expect(root.getAttribute('data-state')).toBe('empty');
    expect(root.querySelector('button')).toBeNull();
    expect(fixture.componentInstance.expanded()).toBe(true);
  });
  it('escapes text and label overrides and reacts to limit changes', async () => {
    const text = '<img src=x onerror=alert(1)><strong>Ї</strong>';
    const { fixture, root } = await setup(text, 1);
    fixture.componentRef.setInput('expandLabel', '<b>More</b>');
    await fixture.whenStable();
    expect(root.querySelector('button')!.textContent).toContain('<b>More</b>');
    expect(root.querySelector('img,strong,b,script')).toBeNull();
    fixture.componentRef.setInput('previewLength', 500);
    await fixture.whenStable();
    expect(root.querySelector('button')).toBeNull();
    expect(root.querySelector('p')!.textContent).toBe(text);
  });
  it('keeps multiple disclosure targets independent', async () => {
    const first = await setup('ЇЄІҐ', 1),
      second = await setup('abcd', 1);
    const firstId = first.root.querySelector('button')!.getAttribute('aria-controls');
    expect(second.root.querySelector('button')!.getAttribute('aria-controls')).not.toBe(firstId);
    first.root.querySelector('button')!.click();
    await first.fixture.whenStable();
    expect(second.root.querySelector('button')!.getAttribute('aria-expanded')).toBe('false');
  });
});
