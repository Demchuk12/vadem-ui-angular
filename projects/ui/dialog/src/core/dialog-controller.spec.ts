import { VdDialogController, vdIsOutside, vdViewportGutters } from './dialog-controller';

/** Minimal stand-in for HTMLDialogElement (jsdom has no showModal). */
class FakeDialog extends EventTarget {
  open = false;
  returnValue = '';
  readonly ownerDocument = document;
  readonly style = document.createElement('div').style;
  showModal() {
    this.open = true;
  }
  close(value = '') {
    this.open = false;
    this.returnValue = value;
    this.dispatchEvent(new Event('close'));
  }
  getBoundingClientRect() {
    return { left: 100, right: 300, top: 100, bottom: 300 } as DOMRect;
  }
}

function setup(dismissible = true) {
  const dialog = new FakeDialog();
  const closes: string[] = [];
  const controller = new VdDialogController(dialog as unknown as HTMLDialogElement, {
    dismissible: () => dismissible,
    onClose: (v) => closes.push(v),
  });
  controller.open();
  return { dialog, controller, closes };
}

function pointer(type: string, target: EventTarget, x: number, y: number) {
  const e = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true });
  target.dispatchEvent(e);
  return e;
}

describe('VdDialogController', () => {
  it('opens, closes with a return value and reports it', () => {
    const { dialog, controller, closes } = setup();
    expect(dialog.open).toBe(true);
    controller.close('confirm');
    expect(dialog.open).toBe(false);
    expect(closes).toEqual(['confirm']);
  });

  it('ignores a queued close event from before reopening', () => {
    const { dialog, controller, closes } = setup();
    dialog.open = false;
    dialog.returnValue = 'previous';
    controller.open();
    dialog.dispatchEvent(new Event('close'));
    expect(dialog.open).toBe(true);
    expect(closes).toEqual([]);
    controller.close('current');
    expect(closes).toEqual(['current']);
  });

  it('closes on a click that starts and ends on the backdrop', () => {
    const { dialog, closes } = setup();
    pointer('pointerdown', dialog, 10, 10);
    pointer('click', dialog, 10, 10);
    expect(closes).toEqual(['']);
  });

  it('ignores a drag that started inside the dialog', () => {
    const { dialog, closes } = setup();
    pointer('pointerdown', dialog, 150, 150);
    pointer('click', dialog, 10, 10);
    expect(dialog.open).toBe(true);
    expect(closes).toEqual([]);
  });

  it('respects non-dismissible dialogs for Escape and backdrop', () => {
    const { dialog } = setup(false);
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    pointer('pointerdown', dialog, 10, 10);
    pointer('click', dialog, 10, 10);
    expect(dialog.open).toBe(true);
  });

  it('stops listening after destroy', () => {
    const { dialog, controller, closes } = setup();
    controller.destroy();
    dialog.close('x');
    expect(closes).toEqual([]);
  });
});

describe('vdIsOutside', () => {
  const rect = { left: 0, right: 10, top: 0, bottom: 10 } as DOMRect;
  it('detects points outside the rect', () => {
    expect(vdIsOutside(rect, 5, 5)).toBe(false);
    expect(vdIsOutside(rect, 11, 5)).toBe(true);
    expect(vdIsOutside(rect, 5, -1)).toBe(true);
  });
});

describe('vdViewportGutters', () => {
  it('measures with a temporary probe and leaves the document clean', () => {
    const before = document.body.childElementCount;
    const gutters = vdViewportGutters(document);
    // jsdom has no layout: no gutters, and the probe is removed again.
    expect(gutters).toEqual({ left: 0, right: 0 });
    expect(document.body.childElementCount).toBe(before);
  });
});
