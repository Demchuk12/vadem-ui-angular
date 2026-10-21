import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdDropzone, VdRejectedFile } from '@vadem/ui/dropzone';

@Component({
  imports: [VdDropzone],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label
      vdDropzone
      maxSize="1000"
      (filesSelected)="picked = $event"
      (filesRejected)="rejected = $event"
    >
      <input type="file" accept="image/*" multiple />
      Перетягніть зображення
    </label>
  `,
})
class Host {
  picked: File[] = [];
  rejected: VdRejectedFile[] = [];
}

describe('VdDropzone', () => {
  it('checks picked files by size (the picker already filtered the type)', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const label = root.querySelector('label')!;
    expect(label.classList).toContain('vd-dropzone');
    const input = root.querySelector<HTMLInputElement>('input[type=file]')!;
    const small = new File(['x'], 'a.png', { type: 'image/png' });
    const big = new File(['x'.repeat(2000)], 'b.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [small, big] });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const host = fixture.componentInstance;
    expect(host.picked.map((f) => f.name)).toEqual(['a.png']);
    expect(host.rejected.map((r) => [r.file.name, r.reason])).toEqual([['b.png', 'size']]);
  });
});
