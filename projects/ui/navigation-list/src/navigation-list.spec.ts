import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_NAVIGATION_LIST } from './navigation-list';

@Component({
  imports: [VD_NAVIGATION_LIST],
  template: `<nav vdNavigationList [label]="label()">
    <section aria-labelledby="group">
      <h2 vdNavigationLabel id="group">Workspace</h2>
      <ul role="list">
        <li>
          <a
            vdNavigationLink
            href="/projects"
            target="_blank"
            rel="noopener"
            [attr.aria-current]="current()"
            ><span>Projects</span><span slot="end">0 open projects</span></a
          >
        </li>
      </ul>
    </section>
  </nav>`,
})
class Host {
  readonly label = signal('Робочі розділи');
  readonly current = signal<string | null>('page');
}

describe('Navigation list native contract', () => {
  it('names the landmark while retaining headings, links, counts and consumer current state', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const nav = root.querySelector('nav')!;
    const link = root.querySelector('a')!;
    expect(nav.getAttribute('aria-label')).toBe('Робочі розділи');
    expect(nav.classList.contains('vd-navigation-list')).toBe(true);
    expect(root.querySelector('h2')?.textContent).toBe('Workspace');
    expect(root.querySelector('section')?.getAttribute('aria-labelledby')).toBe('group');
    expect(link.getAttribute('href')).toBe('/projects');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.textContent).toContain('0 open projects');
    expect(
      root.querySelector('[tabindex], [role="menu"], [role="menuitem"], [aria-selected]'),
    ).toBeNull();
    fixture.componentInstance.label.set('Team navigation');
    fixture.componentInstance.current.set('false');
    await fixture.whenStable();
    expect(nav.getAttribute('aria-label')).toBe('Team navigation');
    expect(link.getAttribute('aria-current')).toBe('false');
    fixture.componentInstance.current.set(null);
    await fixture.whenStable();
    expect(link.hasAttribute('aria-current')).toBe(false);
  });
});
