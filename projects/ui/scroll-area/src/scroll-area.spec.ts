import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdScrollArea } from './scroll-area';

@Component({
  imports: [VdScrollArea],
  template: `<section
      vdScrollArea
      [label]="label()"
      aria-labelledby="title"
      aria-describedby="hint"
    >
      <h2 id="title">History</h2>
      <p id="hint">Use native scrolling</p>
      <input aria-label="Search" (keydown)="lastKey = $event.key" />
    </section>
    <div vdScrollArea label="Managed viewport" tabindex="-1"></div>`,
})
class Host {
  readonly label = signal('Історія');
  lastKey = '';
}

describe('Scroll area', () => {
  it('names the viewport and preserves heading/description references and consumer keyboard entry', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const viewport = root.querySelector('section')!;
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.tabIndex).toBe(0);
    expect(viewport.getAttribute('aria-label')).toBe('Історія');
    expect(viewport.getAttribute('aria-labelledby')).toBe('title');
    expect(viewport.getAttribute('aria-describedby')).toBe('hint');
    expect(root.querySelector('div')!.tabIndex).toBe(-1);
    fixture.componentInstance.label.set('Оновлена історія');
    await fixture.whenStable();
    expect(viewport.getAttribute('aria-label')).toBe('Оновлена історія');
  });
  it('keeps descendants in place and does not intercept their editing keys', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const viewport = root.querySelector('section')!;
    const input = viewport.querySelector('input')!;
    expect(viewport.children).toHaveLength(3);
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.lastKey).toBe('ArrowLeft');
    expect(input.parentElement).toBe(viewport);
  });
});
