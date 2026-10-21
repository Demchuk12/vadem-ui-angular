import { TestBed } from '@angular/core/testing';
import { VdIcon } from './icon';
import { VD_ICONS, VD_ICON_NAMES } from './core/icons';

describe('VdIcon', () => {
  function render(name: string, label?: string) {
    const fixture = TestBed.createComponent(VdIcon);
    fixture.componentRef.setInput('name', name);
    if (label) fixture.componentRef.setInput('label', label);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('is decorative by default', () => {
    const el = render('check');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.getAttribute('role')).toBeNull();
    expect(el.querySelectorAll('path').length).toBe(VD_ICONS.check.length);
  });

  it('becomes an image with a label', () => {
    const el = render('search', 'Пошук');
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Пошук');
    expect(el.getAttribute('aria-hidden')).toBeNull();
  });

  it('marks directional icons for RTL mirroring', () => {
    expect(render('chevron-right').hasAttribute('data-directional')).toBe(true);
    expect(render('chevron-down').hasAttribute('data-directional')).toBe(false);
  });

  it('stores every icon as path data starting with a moveto', () => {
    for (const name of VD_ICON_NAMES) {
      for (const d of VD_ICONS[name]) expect(d).toMatch(/^[Mm]/);
    }
  });
});
