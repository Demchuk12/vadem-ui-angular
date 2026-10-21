import { TestBed } from '@angular/core/testing';
import { VdUploadList, type VdUploadFile } from './upload-list';

const file = (id: string, status: VdUploadFile['status'] = 'success'): VdUploadFile => ({
  id,
  name: 'same.csv',
  status,
});
async function setup(files: readonly VdUploadFile[]) {
  const fixture = TestBed.createComponent(VdUploadList);
  fixture.componentRef.setInput('files', files);
  fixture.detectChanges();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLUListElement;
  document.body.append(root);
  const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
  return { fixture, root, buttons };
}

describe('VdUploadList', () => {
  it('emits stable ids for each supported action without mutating consumer records', async () => {
    const source = ['queued', 'uploading', 'success', 'error', 'canceled'].map((status, index) =>
      file(String(index), status as VdUploadFile['status']),
    );
    const { fixture, root, buttons } = await setup(source);
    const calls: string[] = [];
    fixture.componentInstance.fileCancel.subscribe((id) => calls.push('cancel:' + id));
    fixture.componentInstance.fileRetry.subscribe((id) => calls.push('retry:' + id));
    fixture.componentInstance.fileRemove.subscribe((id) => calls.push('remove:' + id));
    buttons().forEach((button) => button.click());
    expect(calls).toEqual([
      'cancel:0',
      'cancel:1',
      'remove:2',
      'retry:3',
      'remove:3',
      'retry:4',
      'remove:4',
    ]);
    expect(source.map((item) => item.status)).toEqual([
      'queued',
      'uploading',
      'success',
      'error',
      'canceled',
    ]);
    root.remove();
  });
  it('normalizes progress without treating 100 percent as completed', async () => {
    const values = [-5, 140, NaN, Infinity, null];
    const { root } = await setup(
      values.map((progress, index) => ({ ...file(String(index), 'uploading'), progress })),
    );
    expect(
      Array.from(root.querySelectorAll('progress')).map((el) => el.getAttribute('value')),
    ).toEqual(['0', '100', null, null, null]);
    expect(root.querySelectorAll('[data-state=success]')).toHaveLength(0);
    expect(root.querySelectorAll('[aria-label="Cancel same.csv"]')).toHaveLength(5);
    expect(
      Array.from(root.querySelectorAll('[role=status]')).every(
        (el) => !el.textContent?.includes('%'),
      ),
    ).toBe(true);
    root.remove();
  });
  it('guards disabled actions and preserves their status', async () => {
    const { fixture, root, buttons } = await setup([file('a', 'error')]);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const retry = vi.fn(),
      remove = vi.fn();
    fixture.componentInstance.fileRetry.subscribe(retry);
    fixture.componentInstance.fileRemove.subscribe(remove);
    // Synthetic dispatch bypasses native disabled click suppression; the adapter still guards.
    buttons().forEach((button) => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(buttons().every((button) => button.disabled)).toBe(true);
    expect(retry).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(root.querySelector('[data-state=error]')).not.toBeNull();
    root.remove();
  });
  it('keeps the primary action focused when retry becomes cancel', async () => {
    const { fixture, root, buttons } = await setup([file('a', 'error')]);
    const primary = buttons()[0];
    primary.focus();
    fixture.componentRef.setInput('files', [file('a', 'uploading')]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttons()[0]).toBe(primary);
    expect(document.activeElement).toBe(primary);
    expect(primary.getAttribute('aria-label')).toBe('Cancel same.csv');
    root.remove();
  });
  it('recovers next/previous/list focus when a focused row is removed', async () => {
    const { fixture, root, buttons } = await setup([file('a'), file('b'), file('c')]);
    buttons()[1].focus();
    fixture.componentRef.setInput('files', [file('a'), file('c')]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons()[1]);
    fixture.componentRef.setInput('files', [file('a')]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons()[0]);
    fixture.componentRef.setInput('files', []);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(root);
    expect(root.textContent).toContain('Choose files to start uploading.');
    root.remove();
  });
  it('does not steal outside focus when consumer state changes', async () => {
    const { fixture, root, buttons } = await setup([file('a')]);
    buttons()[0].focus();
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    fixture.componentRef.setInput('files', []);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
    outside.remove();
    root.remove();
  });

  it('keeps the next-row target current when earlier rows disappear in the background', async () => {
    const { fixture, root, buttons } = await setup([file('a'), file('b'), file('c'), file('d')]);
    buttons()[1].focus();
    fixture.componentRef.setInput('files', [file('b'), file('c'), file('d')]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons()[0]);
    fixture.componentRef.setInput('files', [file('c'), file('d')]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(buttons()[0]);
    root.remove();
  });
});

it('formats numeric sizes, preserves explicit text and distinguishes missing from zero', async () => {
  const { root } = await setup([
    { ...file('zero'), size: 0 },
    { ...file('numeric'), size: 1536000 },
    { ...file('override'), size: 1536000, sizeText: 'Custom size' },
    { ...file('unknown'), size: null },
    file('absent'),
  ]);
  const rows = [...root.querySelectorAll('li')];
  expect(rows[0].textContent).toContain('0 byte');
  expect(rows[1].textContent).toContain('1.5 MB');
  expect(rows[2].textContent).toContain('Custom size');
  expect(rows[2].textContent).not.toContain('1.5 MB');
  expect(rows[3].textContent).toContain('Unknown size');
  expect(rows[4].textContent).not.toContain('Unknown size');
  root.remove();
});
