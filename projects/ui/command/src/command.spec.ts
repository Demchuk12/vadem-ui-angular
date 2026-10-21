import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { VD_COMMAND } from './command';

@Component({
  imports: [VD_COMMAND],
  template: `
    <vd-command
      label="Пошук дій"
      [(query)]="query"
      [disabled]="disabled()"
      [loading]="loading()"
      (selected)="selected.push($event)"
      (dismissed)="dismissals = dismissals + 1"
    >
      @for (item of items(); track item.value) {
        <vd-command-item
          [value]="item.value"
          [label]="item.label"
          [keywords]="item.keywords"
          [disabled]="item.disabled"
          (selected)="itemSelections.push(item.value)"
        >
          <span vdCommandDescription>{{ item.description }}</span>
          <kbd vdCommandShortcut>G S</kbd>
        </vd-command-item>
      }
    </vd-command>
  `,
})
class Host {
  readonly query = signal('');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly items = signal([
    {
      value: 'projects',
      label: 'Проєкти',
      description: 'Робочі проєкти',
      keywords: ['workspace'],
      disabled: false,
    },
    {
      value: 'billing',
      label: 'Оплата',
      description: 'Лише для власника',
      keywords: ['billing'],
      disabled: true,
    },
    {
      value: 'settings',
      label: 'Налаштування',
      description: 'Ваш профіль',
      keywords: ['settings'],
      disabled: false,
    },
  ]);
  readonly selected: string[] = [];
  readonly itemSelections: string[] = [];
  dismissals = 0;
}

describe('VdCommand', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector<HTMLInputElement>('input')!;
    const options = () => [...root.querySelectorAll<HTMLElement>('[role=option]')];
    const key = (value: string, init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key: value,
        bubbles: true,
        cancelable: true,
        ...init,
      });
      input.dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };
    return { fixture, host: fixture.componentInstance, root, input, options, key };
  }

  it('links the named native search, result list and optional description', () => {
    const { root, input, options } = setup();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-label')).toBe('Пошук дій');
    expect(
      root.querySelector('#' + input.getAttribute('aria-controls'))?.getAttribute('role'),
    ).toBe('listbox');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    input.dispatchEvent(new FocusEvent('focus'));
    TestBed.tick();
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[0].id);
    const described = options()[0].getAttribute('aria-describedby');
    expect(root.querySelector('#' + described)?.textContent).toBe('Робочі проєкти');
    expect(root.querySelector('[vdCommandShortcut]')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('filters through the controlled query and updates active identity after content changes', () => {
    const { fixture, host, options } = setup();
    host.query.set('settings');
    fixture.detectChanges();
    expect(
      options()
        .filter((option) => !option.hidden)
        .map((option) => option.getAttribute('aria-label')),
    ).toEqual(['Налаштування']);
    expect(options()[2].getAttribute('aria-selected')).toBe('true');
    host.items.set(host.items().filter((item) => item.value !== 'settings'));
    fixture.detectChanges();
    expect(options().some((option) => option.getAttribute('aria-selected') === 'true')).toBe(false);
    host.query.set('');
    fixture.detectChanges();
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
  });

  it('skips unavailable actions and accepts exactly once without overwriting the query', () => {
    const { host, input, key } = setup();
    input.dispatchEvent(new FocusEvent('focus'));
    key('ArrowDown');
    key('Enter');
    key('Enter', { repeat: true });
    expect(host.selected).toEqual(['settings']);
    expect(host.itemSelections).toEqual(['settings']);
    expect(host.query()).toBe('');
  });

  it('rejects disabled, hidden, loading and root-disabled actions even for synthetic clicks', () => {
    const { fixture, host, input, options, key } = setup();
    options()[1].click();
    host.query.set('settings');
    fixture.detectChanges();
    options()[0].click();
    host.loading.set(true);
    fixture.detectChanges();
    options()[2].click();
    key('Enter');
    expect(options().every((option) => option.hidden)).toBe(true);
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    host.loading.set(false);
    host.disabled.set(true);
    fixture.detectChanges();
    options()[2].click();
    key('Enter');
    expect(input.disabled).toBe(true);
    expect(host.selected).toEqual([]);
  });

  it('does not intercept text editing or execute/dismiss during IME composition', () => {
    const { host, key } = setup();
    expect(key('Home').defaultPrevented).toBe(false);
    expect(key('End').defaultPrevented).toBe(false);
    key('Enter', { isComposing: true });
    key('Escape', { isComposing: true });
    key('Tab');
    expect(host.selected).toEqual([]);
    expect(host.dismissals).toBe(0);
  });

  it('collapses on Escape without clearing text and reopens on ArrowDown', () => {
    const { fixture, host, input, key } = setup();
    host.query.set('settings');
    fixture.detectChanges();
    key('Escape');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(host.query()).toBe('settings');
    expect(host.dismissals).toBe(1);
    key('Enter');
    expect(host.selected).toEqual([]);
    key('ArrowDown');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    key('Enter');
    expect(host.selected).toEqual(['settings']);
  });
});
