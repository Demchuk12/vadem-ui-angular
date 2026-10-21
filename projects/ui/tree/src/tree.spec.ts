import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_TREE } from './tree';

@Component({
  imports: [VD_TREE],
  template: `
    <ul vdTree label="Files" [(value)]="value" [disabled]="disabled()">
      <li vdTreeItem value="root" label="Root" [(expanded)]="open">
        <ul vdTreeGroup>
          @if (show()) {
            <li vdTreeItem value="child" label="Child"></li>
          }
          <li vdTreeItem value="disabled" label="Disabled" disabled></li>
        </ul>
      </li>
      <li vdTreeItem value="last" label="Last"></li>
    </ul>
    <button type="button">Outside</button>
  `,
})
class Host {
  readonly value = signal<string | null>('child');
  readonly open = signal(true);
  readonly show = signal(true);
  readonly disabled = signal(false);
}

describe('Tree integration', () => {
  afterEach(() => document.body.replaceChildren());
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    const tree = root.querySelector('[role=tree]')!;
    const items = () => [...root.querySelectorAll<HTMLElement>('[role=treeitem]')];
    const key = async (item: HTMLElement, key: string) => {
      item.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await fixture.whenStable();
    };
    return { fixture, root, tree, items, key, host: fixture.componentInstance };
  }
  it('keeps native nesting, own names and complete sibling positions', async () => {
    const { tree, items } = await setup();
    const [parent, child, disabled, last] = items();
    expect(tree.tagName).toBe('UL');
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    expect(child.hasAttribute('aria-expanded')).toBe(false);
    expect(child.getAttribute('aria-level')).toBe('2');
    expect(disabled.getAttribute('aria-posinset')).toBe('2');
    expect(child.getAttribute('aria-setsize')).toBe('2');
    expect(last.getAttribute('aria-level')).toBe('1');
    expect(child.getAttribute('aria-labelledby')).toBe(
      child.querySelector('.vd-tree-item__label')!.id,
    );
    expect(items().filter((el) => el.tabIndex === 0)).toEqual([child]);
  });
  it('separates keyboard focus from selection and preserves hidden selected values', async () => {
    const { host, items, key, fixture } = await setup();
    const [parent, child, disabled, last] = items();
    child.focus();
    await key(child, 'ArrowDown');
    expect(document.activeElement).toBe(disabled);
    await key(disabled, 'Enter');
    expect(host.value()).toBe('child');
    await key(disabled, 'ArrowDown');
    expect(document.activeElement).toBe(last);
    await key(last, ' ');
    expect(host.value()).toBe('last');
    child.focus();
    host.value.set('child');
    host.open.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(parent);
    expect(host.value()).toBe('child');
    expect(parent.querySelector('ul')!.hidden).toBe(true);
    expect(parent.tabIndex).toBe(0);
  });
  it('reconciles removed focus and does not steal outside focus on updates', async () => {
    const { host, items, root, fixture } = await setup();
    items()[1].focus();
    host.show.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(items()[0]);
    const outside = root.querySelector('button')!;
    outside.focus();
    host.open.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
  });
  it('uses a programmatic visible selection for the next keyboard entry', async () => {
    const { host, items, fixture, root } = await setup();
    items()[1].focus();
    root.querySelector('button')!.focus();
    host.value.set('last');
    await fixture.whenStable();
    expect(items()[3].tabIndex).toBe(0);
    expect(items()[1].tabIndex).toBe(-1);
    expect(document.activeElement).toBe(root.querySelector('button'));
  });
  it('supports expansion and child navigation before the same render completes', async () => {
    const { host, items, fixture } = await setup();
    host.open.set(false);
    await fixture.whenStable();
    const parent = items()[0];
    parent.focus();
    for (let i = 0; i < 2; i++)
      parent.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
      );
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    expect(document.activeElement).toBe(items()[1]);
  });
  it('disabled tree locks interaction with one container tab stop', async () => {
    const { host, items, tree, fixture, key } = await setup();
    host.disabled.set(true);
    await fixture.whenStable();
    expect(tree.getAttribute('aria-disabled')).toBe('true');
    expect(tree.getAttribute('tabindex')).toBe('0');
    expect(items().every((el) => el.tabIndex === -1)).toBe(true);
    await key(items()[0], 'Enter');
    expect(host.value()).toBe('child');
  });
});
