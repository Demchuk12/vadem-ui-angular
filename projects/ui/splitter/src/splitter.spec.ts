import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_SPLITTER } from './splitter';

@Component({
  imports: [VD_SPLITTER],
  template: `<div
    vdSplitter
    [(value)]="value"
    [min]="min()"
    [max]="max()"
    [disabled]="disabled()"
    [orientation]="orientation()"
  >
    <section vdSplitterPane id="primary">
      <button>First action</button>
      @if (nested()) {
        <div vdSplitter>
          <section vdSplitterPane>Nested first</section>
          <div vdSplitterHandle label="Nested"></div>
          <section vdSplitterPane>Nested second</section>
        </div>
      }
    </section>
    <div vdSplitterHandle label="Files"></div>
    @if (second()) {
      <section vdSplitterPane>Document</section>
    }
  </div>`,
})
class Host {
  readonly value = signal(40);
  readonly min = signal(20);
  readonly max = signal(80);
  readonly disabled = signal(false);
  readonly nested = signal(false);
  readonly second = signal(true);
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
}

describe('Splitter adapter', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const root = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[vdSplitter]')!;
    const handle = root.querySelector<HTMLElement>(':scope > [vdSplitterHandle]')!;
    const key = async (key: string, options: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...options,
      });
      handle.dispatchEvent(event);
      await fixture.whenStable();
      return event;
    };
    return { fixture, host: fixture.componentInstance, root, handle, key };
  }
  it('names the handle, references the primary pane and exposes perpendicular ARIA and fractions', async () => {
    const { root, handle } = await setup();
    expect(handle.getAttribute('role')).toBe('separator');
    expect(handle.tabIndex).toBe(0);
    expect(handle.getAttribute('aria-label')).toBe('Files');
    expect(handle.getAttribute('aria-controls')).toBe('primary');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.getAttribute('aria-valuenow')).toBe('40');
    expect(root.style.getPropertyValue('--vd-splitter-first')).toBe('40fr');
    expect(root.style.getPropertyValue('--vd-splitter-second')).toBe('60fr');
  });
  it('changes the model only for supported keys and retains handle focus', async () => {
    const { host, handle, key } = await setup();
    handle.focus();
    expect((await key('ArrowRight')).defaultPrevented).toBe(true);
    expect(host.value()).toBe(41);
    expect(document.activeElement).toBe(handle);
    await key('Home');
    expect(host.value()).toBe(20);
    await key('End');
    expect(host.value()).toBe(80);
    expect((await key('ArrowDown')).defaultPrevented).toBe(false);
    expect((await key('ArrowLeft', { ctrlKey: true })).defaultPrevented).toBe(false);
    expect((await key('ArrowLeft', { isComposing: true })).defaultPrevented).toBe(false);
    expect(host.value()).toBe(80);
  });
  it('clamps external constraints without rewriting the consumer model', async () => {
    const { fixture, host, handle } = await setup();
    host.value.set(5);
    await fixture.whenStable();
    expect(handle.getAttribute('aria-valuenow')).toBe('20');
    expect(host.value()).toBe(5);
    host.min.set(60);
    await fixture.whenStable();
    expect(handle.getAttribute('aria-valuenow')).toBe('60');
  });
  it('blocks disabled/fixed/missing-pane resize while leaving content accessible', async () => {
    const { fixture, host, handle, key, root } = await setup();
    host.disabled.set(true);
    await fixture.whenStable();
    expect(handle.tabIndex).toBe(-1);
    expect(handle.getAttribute('aria-disabled')).toBe('true');
    await key('End');
    expect(host.value()).toBe(40);
    expect(root.querySelector('button')!.disabled).toBe(false);
    host.disabled.set(false);
    host.max.set(20);
    await fixture.whenStable();
    expect(handle.tabIndex).toBe(-1);
    host.max.set(80);
    host.second.set(false);
    await fixture.whenStable();
    expect(handle.tabIndex).toBe(-1);
  });
  it('keeps nested ownership independent and changes layout/RTL axis correctly', async () => {
    const { fixture, host, root, handle, key } = await setup();
    host.nested.set(true);
    await fixture.whenStable();
    expect(handle.tabIndex).toBe(0);
    root.dir = 'rtl';
    await key('ArrowRight');
    expect(host.value()).toBe(39);
    const nested = root.querySelector<HTMLElement>('[vdSplitter] [vdSplitterHandle]')!;
    nested.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.value()).toBe(39);
    host.orientation.set('vertical');
    await fixture.whenStable();
    expect(handle.getAttribute('aria-orientation')).toBe('horizontal');
    await key('ArrowDown');
    expect(host.value()).toBe(40);
  });
});
