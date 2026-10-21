import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_EMPTY_STATE } from '@vadem/ui/empty-state';

@Component({
  imports: [VD_EMPTY_STATE],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section vdEmptyState icon="search" size="sm" class="with-icon">
      <h3 vdEmptyStateTitle>Нічого не знайдено</h3>
      <p vdEmptyStateDescription>Змініть запит.</p>
      <div slot="actions"><button>Скинути</button></div>
    </section>
    <div vdEmptyState class="plain"><p vdEmptyStateTitle>Порожньо</p></div>
  `,
})
class Host {}

describe('VdEmptyState', () => {
  it('renders the optional icon, parts and actions', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const withIcon = root.querySelector('.with-icon')!;
    expect(withIcon.classList).toContain('vd-empty-state');
    expect(withIcon.getAttribute('data-size')).toBe('sm');
    expect(withIcon.querySelector('.vd-empty-state__icon vd-icon')).not.toBeNull();
    expect(withIcon.querySelector('.vd-empty-state__title')!.textContent).toBe(
      'Нічого не знайдено',
    );
    expect(withIcon.querySelector('.vd-empty-state__description')).not.toBeNull();
    expect(withIcon.lastElementChild!.getAttribute('slot')).toBe('actions');
    expect(root.querySelector('.plain .vd-empty-state__icon')).toBeNull();
  });
});
