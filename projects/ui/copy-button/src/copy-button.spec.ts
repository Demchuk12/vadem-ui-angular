import { Component, DOCUMENT, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdCopyButton } from './copy-button';

@Component({
  imports: [VdCopyButton],
  template: `<form (submit)="submitted = true">
    <vd-copy-button
      [value]="value()"
      [disabled]="disabled()"
      label="Copy reference"
      (copied)="copied = copied + 1"
      (copyFailed)="failed = failed + 1"
    />
  </form>`,
})
class Host {
  readonly value = signal('  Україна\nVDM-001  ');
  readonly disabled = signal(false);
  copied = 0;
  failed = 0;
  submitted = false;
}

describe('Copy button clipboard lifecycle', () => {
  async function setup(writeText?: (value: string) => Promise<void>) {
    const document = TestBed.inject(DOCUMENT);
    const nav = document.defaultView!.navigator;
    const descriptor = Object.getOwnPropertyDescriptor(nav, 'clipboard');
    Object.defineProperty(nav, 'clipboard', {
      configurable: true,
      value: writeText ? { writeText } : undefined,
    });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      root,
      host: fixture.componentInstance,
      button: root.querySelector('button')!,
      restore: () => {
        if (descriptor) Object.defineProperty(nav, 'clipboard', descriptor);
        else Reflect.deleteProperty(nav, 'clipboard');
      },
    };
  }

  it('copies exact whitespace once, reports success after settlement and never submits', async () => {
    let finish!: () => void;
    const write = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { fixture, root, host, button, restore } = await setup(write);
    try {
      button.click();
      button.click();
      fixture.detectChanges();
      expect(write).toHaveBeenCalledExactlyOnceWith(host.value());
      expect(host.copied).toBe(0);
      expect(button.getAttribute('aria-busy')).toBe('true');
      finish();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(host.copied).toBe(1);
      expect(host.submitted).toBe(false);
      expect(root.querySelector('vd-copy-button')!.getAttribute('data-state')).toBe('copied');
      expect(button.getAttribute('aria-label')).toBe('Copy reference: Copied');
    } finally {
      fixture.destroy();
      restore();
    }
  });
  it('reports rejected/unavailable APIs, supports retry and guards disabled', async () => {
    const write = vi.fn().mockRejectedValueOnce(new Error('Denied')).mockResolvedValue(undefined);
    const { fixture, root, host, button, restore } = await setup(write);
    try {
      button.click();
      await fixture.whenStable();
      expect(host.failed).toBe(1);
      expect(root.querySelector('[role=status]')!.textContent).toContain('Could not copy');
      button.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(host.copied).toBe(1);
      host.disabled.set(true);
      fixture.detectChanges();
      button.click();
      expect(write).toHaveBeenCalledTimes(2);
    } finally {
      fixture.destroy();
      restore();
    }
    const missing = await setup();
    try {
      missing.button.click();
      await missing.fixture.whenStable();
      expect(missing.host.failed).toBe(1);
    } finally {
      missing.fixture.destroy();
      missing.restore();
    }
  });
  it('discards stale UI results while preventing overlapping writes', async () => {
    let finish!: () => void;
    const write = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { fixture, root, host, button, restore } = await setup(write);
    try {
      button.click();
      host.value.set('new');
      fixture.detectChanges();
      button.click();
      expect(write).toHaveBeenCalledTimes(1);
      finish();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(host.copied).toBe(0);
      expect(host.failed).toBe(0);
      expect(root.querySelector('vd-copy-button')!.getAttribute('data-state')).toBe('idle');
    } finally {
      fixture.destroy();
      restore();
    }
  });
  it('ignores settlement after destruction', async () => {
    let finish!: () => void;
    const { fixture, host, button, restore } = await setup(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    try {
      button.click();
      fixture.destroy();
      finish();
      await Promise.resolve();
      expect(host.copied).toBe(0);
      expect(host.failed).toBe(0);
    } finally {
      restore();
    }
  });
});
