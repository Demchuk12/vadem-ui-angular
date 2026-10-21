import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_MENU } from '@vadem/ui/menu';
import { installFakePopover } from '../../test-utils/fake-popover';

@Component({
  imports: [VD_MENU],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="trigger" [vdMenuTrigger]="menu">Дії</button>
    <div vdMenu #menu="vdMenu">
      <button vdMenuItem (click)="last.set('edit')">Редагувати</button>
      <button vdMenuItem disabled>Архівувати</button>
      <button vdMenuItem (click)="last.set('dup')">Дублювати</button>
      <hr vdMenuSeparator />
      <button vdMenuItem variant="danger" (click)="last.set('del')">Видалити</button>
    </div>
  `,
})
class Host {
  readonly last = signal('');
}

describe('VdMenu', () => {
  beforeAll(installFakePopover);
  afterEach(() => document.body.replaceChildren());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector<HTMLButtonElement>('.trigger')!;
    const menu = root.querySelector<HTMLElement>('[role=menu]')!;
    const items = Array.from(menu.querySelectorAll<HTMLElement>('[role=menuitem]'));
    const key = (el: Element, k: string) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    return { fixture, host: fixture.componentInstance, trigger, menu, items, key };
  }

  it('wires menu button ARIA', async () => {
    const { trigger, menu } = await setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
    expect(menu.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('ArrowDown opens on the first item; arrows loop and skip disabled', async () => {
    const { trigger, items, key, fixture } = await setup();
    key(trigger, 'ArrowDown');
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(items[0]);
    key(items[0], 'ArrowDown');
    expect(document.activeElement).toBe(items[2]);
    key(items[2], 'ArrowDown');
    expect(document.activeElement).toBe(items[3]);
    key(items[3], 'ArrowDown');
    expect(document.activeElement).toBe(items[0]);
  });

  it('ArrowUp opens on the last item; typeahead jumps', async () => {
    const { trigger, items, key } = await setup();
    key(trigger, 'ArrowUp');
    expect(document.activeElement).toBe(items[3]);
    key(items[3], 'д');
    expect(document.activeElement).toBe(items[2]);
  });

  it('activating an item runs it, closes, and returns focus', async () => {
    const { trigger, items, menu, key, host, fixture } = await setup();
    key(trigger, 'Enter');
    items[2].click();
    fixture.detectChanges();
    expect(host.last()).toBe('dup');
    expect(menu.matches(':popover-open')).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes and returns focus; disabled items do nothing', async () => {
    const { trigger, items, menu, key, host } = await setup();
    key(trigger, 'ArrowDown');
    items[1].click();
    expect(menu.matches(':popover-open')).toBe(true);
    expect(host.last()).toBe('');
    key(items[0], 'Escape');
    expect(menu.matches(':popover-open')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});
