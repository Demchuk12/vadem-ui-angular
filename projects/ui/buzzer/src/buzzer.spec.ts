import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdBuzzer, type VdBuzzerState } from './buzzer';

@Component({
  imports: [VdBuzzer],
  template: `<button vdBuzzer [state]="state()" (buzz)="presses.update((n) => n + 1)">Go</button>`,
})
class Host {
  readonly state = signal<VdBuzzerState>('ready');
  readonly presses = signal(0);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
  return { fixture, button, host: fixture.componentInstance };
}

function pointerDown(target: Element, button = 0) {
  const event = new MouseEvent('pointerdown', { bubbles: true, button });
  target.dispatchEvent(event);
}

describe('Buzzer', () => {
  it('counts a pointer press once, on pointer down', async () => {
    const { button, host } = await setup();
    pointerDown(button);
    expect(host.presses()).toBe(1);
    document.dispatchEvent(new MouseEvent('pointerup'));
    button.click();
    expect(host.presses()).toBe(1);
  });

  it('counts a click without a pointer press (keyboard, assistive technology)', async () => {
    const { button, host } = await setup();
    button.click();
    expect(host.presses()).toBe(1);
  });

  it('ignores secondary pointer buttons', async () => {
    const { button, host } = await setup();
    pointerDown(button, 2);
    expect(host.presses()).toBe(0);
  });

  it('does not swallow a later click after releasing outside the button', async () => {
    const { button, host } = await setup();
    vi.useFakeTimers();
    try {
      pointerDown(button);
      document.dispatchEvent(new MouseEvent('pointerup'));
      vi.advanceTimersByTime(200);
      button.click();
      expect(host.presses()).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it.each<VdBuzzerState>(['locked', 'won', 'spent'])(
    'stays focusable but inert while %s',
    async (state) => {
      const { fixture, button, host } = await setup();
      host.state.set(state);
      await fixture.whenStable();
      pointerDown(button);
      document.dispatchEvent(new MouseEvent('pointerup'));
      button.click();
      button.click();
      expect(host.presses()).toBe(0);
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.hasAttribute('disabled')).toBe(false);
      expect(button.getAttribute('data-state')).toBe(state);
    },
  );

  it('is a plain enabled button while ready', async () => {
    const { button } = await setup();
    expect(button.getAttribute('aria-disabled')).toBeNull();
    expect(button.getAttribute('type')).toBe('button');
  });
});
