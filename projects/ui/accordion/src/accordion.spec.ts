import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_ACCORDION } from '@vadem/ui/accordion';

@Component({
  imports: [VD_ACCORDION],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div vdAccordion exclusive class="faq">
      <details vdAccordionItem [(open)]="first">
        <summary>Ціни</summary>
        <p>...</p>
      </details>
      <details vdAccordionItem>
        <summary>Повернення</summary>
        <p>...</p>
      </details>
    </div>
    <div vdAccordion class="free">
      <details vdAccordionItem open>
        <summary>A</summary>
        <p>...</p>
      </details>
    </div>
  `,
})
class Host {
  readonly first = signal(true);
}

describe('VdAccordion', () => {
  it('shares a name only when exclusive and mirrors open two-way', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const [a, b] = Array.from(root.querySelectorAll<HTMLDetailsElement>('.faq details'));
    expect(a.getAttribute('name')).toBeTruthy();
    expect(a.getAttribute('name')).toBe(b.getAttribute('name'));
    expect(root.querySelector('.free details')!.hasAttribute('name')).toBe(false);
    // Plain attribute, like native details.
    expect(root.querySelector<HTMLDetailsElement>('.free details')!.open).toBe(true);
    expect(a.open).toBe(true);

    // The browser toggles (summary click, find-in-page): the model follows.
    a.open = false;
    a.dispatchEvent(new Event('toggle'));
    fixture.detectChanges();
    expect(fixture.componentInstance.first()).toBe(false);

    fixture.componentInstance.first.set(true);
    fixture.detectChanges();
    expect(a.open).toBe(true);
  });
});
