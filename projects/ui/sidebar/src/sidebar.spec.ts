import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_SIDEBAR } from './sidebar';

@Component({
  imports: [VD_SIDEBAR],
  template: `<vd-sidebar-layout label="Навігація" [(collapsed)]="collapsed">
    <ng-template vdSidebar>
      <nav aria-label="Робочий простір">
        <a class="vd-navigation-link" href="/a"><span>Огляд</span></a>
      </nav>
    </ng-template>
    <button vdSidebarToggle aria-label="Навігація">≡</button>
    <main>Content</main>
  </vd-sidebar-layout>`,
})
class Host {
  readonly collapsed = signal(false);
}

describe('Sidebar layout', () => {
  it('renders content once, docked, and toggles the rail with matching ARIA', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const layout = root.querySelector('vd-sidebar-layout')!;
    const toggle = root.querySelector('button')!;
    const sidebar = layout.querySelector(':scope > .vd-sidebar')!;

    expect(layout.getAttribute('data-mode')).toBe('docked');
    expect(root.querySelectorAll('nav').length).toBe(1);
    expect(sidebar.getAttribute('role')).toBeNull();
    expect(toggle.getAttribute('type')).toBe('button');
    expect(toggle.getAttribute('aria-controls')).toBe(sidebar.id);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.hasAttribute('aria-haspopup')).toBe(false);
    expect(layout.hasAttribute('data-collapsed')).toBe(false);

    toggle.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.collapsed()).toBe(true);
    expect(layout.hasAttribute('data-collapsed')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    // The link's name stays in the DOM in rail mode.
    expect(root.querySelector('a')?.textContent).toContain('Огляд');

    fixture.componentInstance.collapsed.set(false);
    await fixture.whenStable();
    expect(layout.hasAttribute('data-collapsed')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });
});
