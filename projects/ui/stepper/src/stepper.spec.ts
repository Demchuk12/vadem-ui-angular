import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_STEPPER } from './stepper';

@Component({
  imports: [...VD_STEPPER],
  template: `
    <nav
      vdStepper
      label="Процес"
      [(value)]="stage"
      [disabled]="disabled()"
      completedLabel="Завершено"
      errorLabel="Потрібно виправити"
    >
      <ol>
        @for (item of items(); track item) {
          <li>
            <button
              vdStep
              [value]="item"
              [completed]="item === 'a'"
              [invalid]="item === 'b'"
              [disabled]="item === 'c'"
            >
              <span vdStepTitle>{{ item }}</span
              ><span vdStepDescription>Опис {{ item }}</span>
            </button>
          </li>
        }
      </ol>
    </nav>
  `,
})
class Host {
  readonly stage = signal<string | undefined>(undefined);
  readonly disabled = signal(false);
  readonly items = signal(['a', 'b', 'c']);
}

describe('VdStepper', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
    return { fixture, host: fixture.componentInstance, root, buttons };
  }

  it('defaults to the first stage without emitting or claiming tab semantics', () => {
    const { root, host, buttons } = setup();
    expect(host.stage()).toBeUndefined();
    expect(buttons()[0].getAttribute('aria-current')).toBe('step');
    expect(root.querySelector('[role=tablist]')).toBeNull();
    expect(buttons().every((b) => b.type === 'button')).toBe(true);
  });

  it('activates enabled steps and rejects disabled steps even for synthetic clicks', () => {
    const { fixture, host, buttons } = setup();
    buttons()[1].click();
    fixture.detectChanges();
    expect(host.stage()).toBe('b');
    expect(buttons()[1].getAttribute('aria-current')).toBe('step');
    buttons()[2].dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(host.stage()).toBe('b');
    host.disabled.set(true);
    fixture.detectChanges();
    expect(buttons().every((b) => b.disabled)).toBe(true);
    buttons()[0].dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(host.stage()).toBe('b');
    expect(buttons()[1].getAttribute('aria-current')).toBe('step');
  });

  it('links titles, descriptions and localized completion/error status', () => {
    const { root, buttons } = setup();
    const title = root.querySelector('#' + buttons()[0].getAttribute('aria-labelledby'))!;
    expect(title.textContent).toBe('a');
    const descriptions = (button: HTMLButtonElement) =>
      button
        .getAttribute('aria-describedby')!
        .split(' ')
        .map((id) => root.querySelector('#' + id)!.textContent)
        .join(' ');
    expect(descriptions(buttons()[0])).toBe('Опис a Завершено');
    expect(descriptions(buttons()[1])).toBe('Опис b Потрібно виправити');
    expect(descriptions(buttons()[2])).toBe('Опис c');
  });

  it('follows DOM order and clears aria-current for an explicit missing value', () => {
    const { fixture, host, buttons } = setup();
    host.items.set(['c', 'a', 'b']);
    fixture.detectChanges();
    expect(buttons()[0].getAttribute('aria-current')).toBe('step');
    expect(buttons()[0].querySelector('.vd-step__indicator')!.textContent!.trim()).toBe('1');
    host.stage.set('missing');
    fixture.detectChanges();
    expect(buttons().some((b) => b.hasAttribute('aria-current'))).toBe(false);
    host.stage.set('a');
    fixture.detectChanges();
    host.items.set(['c', 'b']);
    fixture.detectChanges();
    expect(buttons().some((b) => b.hasAttribute('aria-current'))).toBe(false);
  });
});
