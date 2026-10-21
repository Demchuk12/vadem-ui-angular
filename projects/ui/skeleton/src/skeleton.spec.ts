import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdSkeleton } from './skeleton';

@Component({
  imports: [VdSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <span vdSkeleton></span>
    } @else {
      <p>Loaded content</p>
    }
    <div vdSkeleton shape="rectangle" animated="false"></div>
    <span vdSkeleton shape="circle" size="lg"></span>
  `,
})
class Host {
  readonly loading = signal(true);
}

describe('VdSkeleton composition', () => {
  it('hides decorative placeholders without adding controls or progress announcements', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const placeholders = root.querySelectorAll('.vd-skeleton');
    expect(placeholders).toHaveLength(3);
    for (const el of placeholders) {
      expect(el.getAttribute('aria-hidden')).toBe('true');
      expect(el.hasAttribute('role')).toBe(false);
      expect(el.hasAttribute('tabindex')).toBe(false);
    }
    expect(placeholders[1].hasAttribute('data-animated')).toBe(false);
    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();
    expect(root.querySelectorAll('.vd-skeleton')).toHaveLength(2);
    expect(root.querySelector('p')?.textContent).toBe('Loaded content');
  });
});
