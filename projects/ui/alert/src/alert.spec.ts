import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_ALERT } from '@vadem/ui/alert';

@Component({
  imports: [VD_ALERT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div vdAlert class="danger" variant="danger" role="alert">
      <p vdAlertTitle>Не вдалося зберегти</p>
      <p>Спробуйте ще раз.</p>
    </div>
    <div vdAlert class="plain" [icon]="null">Без іконки</div>
  `,
})
class Host {}

describe('VdAlert', () => {
  it('reflects the variant, picks its icon and keeps consumer roles', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const danger = root.querySelector('.danger')!;
    expect(danger.getAttribute('data-variant')).toBe('danger');
    expect(danger.getAttribute('role')).toBe('alert');
    expect(danger.querySelector('.vd-alert__icon')).not.toBeNull();
    expect(danger.querySelector('.vd-alert__title')!.textContent).toContain('Не вдалося');
    expect(root.querySelector('.plain .vd-alert__icon')).toBeNull();
    expect(root.querySelector('.plain')!.getAttribute('data-variant')).toBe('neutral');
  });
});
