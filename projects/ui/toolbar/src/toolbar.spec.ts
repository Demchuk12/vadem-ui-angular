import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdButton } from '@vadem/ui/button';
import { VD_TOOLBAR } from './toolbar';

@Component({
  imports: [VD_TOOLBAR, VdButton],
  template: `
    <div vdToolbar label="Actions" [orientation]="orientation()">
      <div vdToolbarGroup label="Edit" [hidden]="groupHidden()">
        <button vdButton vdToolbarItem [disabled]="disabled()" (click)="count.update(plus)">
          Edit
        </button>
        @if (show()) {
          <button
            vdButton
            vdToolbarItem
            [loading]="loading()"
            [hidden]="itemHidden()"
            (click)="count.update(plus)"
          >
            Copy
          </button>
        }
      </div>
      <span vdToolbarSeparator></span>
      <button
        vdButton
        vdToolbarItem
        [attr.aria-pressed]="pressed()"
        (click)="pressed.set(!pressed())"
      >
        Protect
      </button>
    </div>
    <button type="button">Outside</button>
  `,
})
class Host {
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly itemHidden = signal(false);
  readonly groupHidden = signal(false);
  readonly show = signal(true);
  readonly pressed = signal(false);
  readonly count = signal(0);
  readonly plus = (value: number) => value + 1;
}

describe('Toolbar integration', () => {
  afterEach(() => document.body.replaceChildren());
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    const toolbar = root.querySelector<HTMLElement>('[role=toolbar]')!;
    const buttons = () => [...toolbar.querySelectorAll<HTMLButtonElement>('button')];
    const key = async (button: HTMLButtonElement, key: string, extra: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...extra,
      });
      button.dispatchEvent(event);
      await fixture.whenStable();
      return event;
    };
    return { host: fixture.componentInstance, fixture, root, toolbar, buttons, key };
  }
  it('preserves native buttons, names, groups and one initial Tab stop', async () => {
    const { toolbar, buttons } = await setup();
    expect(toolbar.getAttribute('aria-label')).toBe('Actions');
    expect(toolbar.querySelector('[role=group]')!.getAttribute('aria-label')).toBe('Edit');
    expect(toolbar.querySelector('[role=separator]')!.getAttribute('aria-orientation')).toBe(
      'vertical',
    );
    expect(buttons().map((button) => button.tabIndex)).toEqual([0, -1, -1]);
    expect(buttons().every((button) => button.type === 'button')).toBe(true);
  });
  it('navigates without activation and skips disabled/loading items', async () => {
    const { host, buttons, key, fixture } = await setup();
    host.loading.set(true);
    await fixture.whenStable();
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowRight');
    expect(document.activeElement).toBe(buttons()[2]);
    expect(host.count()).toBe(0);
    expect(host.pressed()).toBe(false);
    await key(buttons()[2], 'ArrowRight');
    expect(document.activeElement).toBe(buttons()[0]);
    host.disabled.set(true);
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons()[2]);
    expect(buttons().map((button) => button.tabIndex)).toEqual([-1, -1, 0]);
  });
  it('mirrors RTL and reserves cross-axis/modified/IME keys', async () => {
    const { host, toolbar, buttons, key, fixture } = await setup();
    toolbar.dir = 'rtl';
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowLeft');
    expect(document.activeElement).toBe(buttons()[1]);
    expect((await key(buttons()[1], 'ArrowDown')).defaultPrevented).toBe(false);
    expect((await key(buttons()[1], 'ArrowLeft', { isComposing: true })).defaultPrevented).toBe(
      false,
    );
    expect((await key(buttons()[1], 'ArrowLeft', { ctrlKey: true })).defaultPrevented).toBe(false);
    host.orientation.set('vertical');
    await fixture.whenStable();
    await key(buttons()[1], 'ArrowDown');
    expect(document.activeElement).toBe(buttons()[2]);
    expect(toolbar.querySelector('[role=separator]')!.getAttribute('aria-orientation')).toBe(
      'horizontal',
    );
  });
  it('preserves native clicks and consumer-owned pressed state; loading blocks actions', async () => {
    const { host, buttons, fixture } = await setup();
    buttons()[0].click();
    buttons()[2].click();
    await fixture.whenStable();
    expect(host.count()).toBe(1);
    expect(buttons()[2].getAttribute('aria-pressed')).toBe('true');
    host.loading.set(true);
    await fixture.whenStable();
    buttons()[1].click();
    expect(host.count()).toBe(1);
  });
  it('repairs focus after hiding a group/item or removing an action', async () => {
    const { host, buttons, fixture } = await setup();
    buttons()[1].focus();
    host.itemHidden.set(true);
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons()[2]);
    host.itemHidden.set(false);
    await fixture.whenStable();
    buttons()[1].focus();
    host.show.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons()[1]);
    buttons()[0].focus();
    host.groupHidden.set(true);
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons()[1]);
  });
  it('remembers focus after exit and never steals outside focus', async () => {
    const { host, buttons, fixture, root } = await setup();
    buttons()[1].focus();
    const outside = root.querySelector<HTMLButtonElement>(':scope > button')!;
    outside.focus();
    await fixture.whenStable();
    expect(buttons()[1].tabIndex).toBe(0);
    host.show.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
    expect(buttons().map((button) => button.tabIndex)).toEqual([-1, 0]);
  });
});
