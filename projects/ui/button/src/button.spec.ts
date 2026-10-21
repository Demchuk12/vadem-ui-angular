import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdButton } from './button';

@Component({
  imports: [VdButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      vdButton
      [variant]="variant()"
      [disabled]="disabled()"
      [loading]="loading()"
      (click)="clicks.set(clicks() + 1)"
    >
      Зберегти
    </button>
    <a vdButton href="#target" [disabled]="disabled()" (click)="linkClicks.set(linkClicks() + 1)"
      >Link</a
    >
    <button vdButton type="submit" disabled>Static</button>
  `,
})
class Host {
  readonly variant = signal<'primary' | 'secondary'>('primary');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly clicks = signal(0);
  readonly linkClicks = signal(0);
}

describe('VdButton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const [button, , staticButton] = Array.from(root.querySelectorAll<HTMLElement>('.vd-button'));
    const link = root.querySelector<HTMLAnchorElement>('a')!;
    return { fixture, host: fixture.componentInstance, button, link, staticButton };
  }

  it('reflects variant and size to data attributes and defaults type to button', () => {
    const { button } = setup();
    expect(button.dataset['variant']).toBe('primary');
    expect(button.dataset['size']).toBe('md');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('accepts bare boolean attributes and an explicit type', () => {
    const { staticButton } = setup();
    expect(staticButton.hasAttribute('disabled')).toBe(true);
    expect(staticButton.getAttribute('type')).toBe('submit');
  });

  it('uses native disabled on buttons', () => {
    const { fixture, host, button } = setup();
    host.disabled.set(true);
    fixture.detectChanges();
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBeNull();
  });

  it('blocks clicks while loading but keeps the button focusable', () => {
    const { fixture, host, button } = setup();
    host.loading.set(true);
    fixture.detectChanges();
    button.click();
    expect(host.clicks()).toBe(0);
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('data-loading')).toBe(true);
    expect(button.querySelector('.vd-button__spinner')).not.toBeNull();

    host.loading.set(false);
    fixture.detectChanges();
    button.click();
    expect(host.clicks()).toBe(1);
    expect(button.querySelector('.vd-button__spinner')).toBeNull();
  });

  it('disables anchors with aria-disabled, removes them from tab order, blocks clicks', () => {
    const { fixture, host, link } = setup();
    host.disabled.set(true);
    fixture.detectChanges();
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.hasAttribute('disabled')).toBe(false);
    expect(link.hasAttribute('type')).toBe(false);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(host.linkClicks()).toBe(0);
  });
});
