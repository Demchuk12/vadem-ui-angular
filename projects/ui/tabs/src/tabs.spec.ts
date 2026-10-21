import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_TABS } from '@vadem/ui/tabs';

@Component({
  imports: [VD_TABS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-tabs [(value)]="value" [activation]="activation()">
      <div vdTabList aria-label="Налаштування">
        <button vdTab value="a">A</button>
        <button vdTab value="b" disabled>B</button>
        <button vdTab value="c">C</button>
        @for (v of extra; track v) {
          <button vdTab [value]="v">{{ v }}</button>
        }
      </div>
      <div vdTabPanel value="a">Panel A</div>
      <div vdTabPanel value="b">Panel B</div>
      <div vdTabPanel value="c">Panel C</div>
    </vd-tabs>
  `,
})
class Host {
  readonly value = signal<string | undefined>(undefined);
  readonly activation = signal<'automatic' | 'manual'>('automatic');
  readonly extra = ['d', 'e'];
}

describe('VdTabs', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role=tab]'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[role=tabpanel]'));
    const key = (el: HTMLElement, k: string) => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      fixture.detectChanges();
    };
    return { fixture, host: fixture.componentInstance, root, tabs, panels, key };
  }

  afterEach(() => document.body.replaceChildren());

  it('selects the first enabled tab by default and wires ARIA', () => {
    const { tabs, panels } = setup();
    expect(tabs.length).toBe(5); // includes dynamic [value] tabs
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].tabIndex).toBe(0);
    expect(tabs[2].tabIndex).toBe(-1);
    expect(tabs[0].getAttribute('aria-controls')).toBe(panels[0].id);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(tabs[0].id);
    expect(panels[0].hidden).toBe(false);
    expect(panels[2].hidden).toBe(true);
  });

  it('arrows skip disabled tabs and select automatically', () => {
    const { tabs, panels, host, key } = setup();
    tabs[0].focus();
    key(tabs[0], 'ArrowRight');
    expect(document.activeElement).toBe(tabs[2]);
    expect(host.value()).toBe('c');
    expect(panels[2].hidden).toBe(false);
  });

  it('manual activation moves focus only until Enter', () => {
    const { tabs, host, key, fixture } = setup();
    host.activation.set('manual');
    fixture.detectChanges();
    key(tabs[0], 'End');
    expect(document.activeElement).toBe(tabs[4]);
    expect(host.value()).toBeUndefined();
    key(tabs[4], 'Enter');
    expect(host.value()).toBe('e');
  });

  it('click selects; two-way value updates the view', () => {
    const { tabs, host, fixture } = setup();
    tabs[2].click();
    fixture.detectChanges();
    expect(host.value()).toBe('c');
    host.value.set('a');
    fixture.detectChanges();
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });
});
