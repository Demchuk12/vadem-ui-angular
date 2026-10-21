import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_POPOVER } from '@vadem/ui/popover';
import { installFakePopover } from '../../test-utils/fake-popover';

installFakePopover();

@Component({
  imports: [VD_POPOVER],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="trigger" [vdPopoverTrigger]="share">Поділитися</button>
    <div vdPopover #share="vdPopover" aria-label="Поділитися проєктом" placement="top">
      <input class="link" readonly value="https://vadem.dev/p/1" />
      <!-- eslint-disable-next-line @angular-eslint/template/no-autofocus -- popovers focus [autofocus] on show, like dialogs -->
      <button class="copy" autofocus>Копіювати</button>
    </div>
  `,
})
class Host {}

describe('VdPopover', () => {
  it('is a named popover dialog; the trigger reflects and toggles it, focusing [autofocus]', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.append(root);
    const trigger = root.querySelector<HTMLButtonElement>('.trigger')!;
    const panel = root.querySelector<HTMLElement>('.vd-popover')!;

    expect(panel.getAttribute('popover')).toBe('auto');
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('data-placement')).toBe('top');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    fixture.detectChanges();
    expect(panel.matches(':popover-open')).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(root.querySelector('.copy'));

    trigger.click();
    fixture.detectChanges();
    expect(panel.matches(':popover-open')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    root.remove();
  });
});
