import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdAvatar } from '@vadem/ui/avatar';

@Component({
  imports: [VdAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-avatar class="photo" name="Олена Коваленко" [src]="src()" />
    <vd-avatar class="deco" name="Тарас Мельник" decorative />
    <vd-avatar class="more" name="Ще 3 учасники" initials="+3" />
  `,
})
class Host {
  readonly src = signal<string | undefined>('/missing.png');
}

describe('VdAvatar', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, q: (s: string) => root.querySelector(s)! };
  }

  it('is a named image with initials as fallback', () => {
    const { q } = setup();
    const avatar = q('.photo');
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Олена Коваленко');
    expect(q('.photo .vd-avatar__initials').textContent!.trim()).toBe('ОК');
    expect(q('.photo img').getAttribute('alt')).toBe('');
  });

  it('drops a broken image and retries when the source changes', () => {
    const { fixture, host, q } = setup();
    q('.photo img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(q('.photo').querySelector('img')).toBeNull();
    host.src.set('/other.png');
    fixture.detectChanges();
    expect(q('.photo').querySelector('img')).not.toBeNull();
  });

  it('can be decorative or show custom initials', () => {
    const { q } = setup();
    expect(q('.deco').getAttribute('aria-hidden')).toBe('true');
    expect(q('.deco').hasAttribute('role')).toBe(false);
    expect(q('.more .vd-avatar__initials').textContent!.trim()).toBe('+3');
    expect(q('.more').getAttribute('aria-label')).toBe('Ще 3 учасники');
  });
});
