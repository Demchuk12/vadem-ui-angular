import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdBadge } from '@vadem/ui/badge';
import { VD_CARD } from '@vadem/ui/card';
import { VdSkeleton } from '@vadem/ui/skeleton';

@Component({
  imports: [VD_CARD, VdBadge, VdSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article vdCard class="plain" [variant]="variant()">
      <header vdCardHeader>
        <h3 vdCardTitle><a vdCardLink href="#p">Проєкт</a></h3>
        <p vdCardDescription>Опис</p>
        <span vdBadge variant="success" dot>Активний</span>
      </header>
      <div vdSkeleton></div>
    </article>
    <article vdCard class="stretched" interactive></article>
    <a vdCard class="link" href="#x">Link card</a>
  `,
})
class Host {
  readonly variant = signal<'default' | 'raised'>('default');
}

describe('VdCard / VdBadge / VdSkeleton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const q = (s: string) => root.querySelector<HTMLElement>(s)!;
    return { fixture, host: fixture.componentInstance, root, q };
  }

  it('reflects variant and parts', () => {
    const { fixture, host, q } = setup();
    expect(q('.plain').classList).toContain('vd-card');
    expect(q('.plain').dataset['variant']).toBe('default');
    host.variant.set('raised');
    fixture.detectChanges();
    expect(q('.plain').dataset['variant']).toBe('raised');
    expect(q('.vd-card__header .vd-card__title .vd-card__link')).not.toBeNull();
    expect(q('.vd-card__description').textContent).toBe('Опис');
  });

  it('marks interactive cards: explicit, anchors; plain cards are not', () => {
    const { q } = setup();
    expect(q('.plain').hasAttribute('data-interactive')).toBe(false);
    expect(q('.stretched').hasAttribute('data-interactive')).toBe(true);
    expect(q('.link').hasAttribute('data-interactive')).toBe(true);
  });

  it('tracks the pointer into --vd-x/--vd-y on interactive cards only', async () => {
    const { fixture, q } = setup();
    await fixture.whenStable();
    const card = q('.stretched');
    card.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 30, clientY: 12, pointerType: 'mouse' }),
    );
    expect(card.style.getPropertyValue('--vd-x')).toBe('30px');
    expect(card.style.getPropertyValue('--vd-y')).toBe('12px');

    const plain = q('.plain');
    plain.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 5, clientY: 5, pointerType: 'mouse' }),
    );
    expect(plain.style.getPropertyValue('--vd-x')).toBe('');
  });

  it('renders badge variant/dot and hides skeletons from AT', () => {
    const { q } = setup();
    const badge = q('.vd-badge');
    expect(badge.dataset['variant']).toBe('success');
    expect(badge.hasAttribute('data-dot')).toBe(true);
    expect(q('.vd-skeleton').getAttribute('aria-hidden')).toBe('true');
  });
});
