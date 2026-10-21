import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdBreadcrumbs } from '@vadem/ui/breadcrumbs';

@Component({
  imports: [VdBreadcrumbs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav vdBreadcrumbs label="Навігаційний ланцюжок">
      <ol>
        <li><a href="/">Проєкти</a></li>
        <li><span aria-current="page">Платформа оплат</span></li>
      </ol>
    </nav>
  `,
})
class Host {}

describe('VdBreadcrumbs', () => {
  it('is a named navigation landmark', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav')!;
    expect(nav.classList).toContain('vd-breadcrumbs');
    expect(nav.getAttribute('aria-label')).toBe('Навігаційний ланцюжок');
  });
});
