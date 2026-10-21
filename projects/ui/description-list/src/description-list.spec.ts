import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdDescriptionList, VdDescriptionListLayout } from './description-list';

@Component({
  imports: [VdDescriptionList],
  template: `<h2 id="details">Details</h2>
    <dl vdDescriptionList [layout]="layout()" aria-labelledby="details">
      <div>
        <dt>Count</dt>
        <dd>{{ count() }}</dd>
      </div>
      <div>
        <dt>Contact</dt>
        <dd><a href="mailto:olena@example.com">Olena</a></dd>
      </div>
      <div>
        <dt>Owner</dt>
        <dt>Responsible person</dt>
        <dd>Olena</dd>
        <dd>Marko</dd>
      </div>
    </dl>`,
})
class Host {
  readonly layout = signal<VdDescriptionListLayout>('horizontal');
  readonly count = signal(0);
}

describe('Description list native contract', () => {
  it('reflects layout changes while retaining native groups and consumer content', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const list = fixture.nativeElement.querySelector('dl') as HTMLDListElement;
    expect(list.classList.contains('vd-description-list')).toBe(true);
    expect(list.dataset['layout']).toBe('horizontal');
    expect(list.getAttribute('aria-labelledby')).toBe('details');
    expect(list.querySelectorAll(':scope > div')).toHaveLength(3);
    expect(list.querySelector('dd')!.textContent).toBe('0');
    expect(list.querySelectorAll(':scope > div:last-child > dt')).toHaveLength(2);
    expect(list.querySelectorAll(':scope > div:last-child > dd')).toHaveLength(2);
    const link = list.querySelector('a');
    fixture.componentInstance.layout.set('vertical');
    fixture.componentInstance.count.set(12);
    await fixture.whenStable();
    expect(list.dataset['layout']).toBe('vertical');
    expect(list.querySelector('dd')!.textContent).toBe('12');
    expect(list.querySelector('a')).toBe(link);
    expect(list.querySelector('[role], [tabindex]')).toBeNull();
    expect(list.hasAttribute('role')).toBe(false);
    expect(list.hasAttribute('tabindex')).toBe(false);
  });
});
