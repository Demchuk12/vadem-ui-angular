import { VdSheetDrag, vdSheetShouldDismiss } from './sheet-drag';

function setup(opts: { sheet?: boolean; dismissible?: boolean } = {}) {
  const el = document.createElement('div');
  el.innerHTML = '<header class="h"><button class="b">x</button></header><div class="body"></div>';
  el.getBoundingClientRect = () => ({ height: 400 }) as DOMRect;
  document.body.appendChild(el);
  let dismissed = 0;
  const drag = new VdSheetDrag(el, {
    handleSelector: '.h',
    isSheet: () => opts.sheet ?? true,
    dismissible: () => opts.dismissible ?? true,
    onDismiss: () => dismissed++,
  });
  const fire = (type: string, target: Element, y: number) =>
    target.dispatchEvent(
      new PointerEvent(type, { bubbles: true, clientY: y, pointerId: 1, button: 0 }),
    );
  const header = el.querySelector('.h')!;
  return { el, drag, header, fire, dismissed: () => dismissed };
}

// jsdom's PointerEvent ignores timeStamp overrides; drive time via a fake clock.
function at(t: number) {
  vi.spyOn(Event.prototype, 'timeStamp', 'get').mockReturnValue(t);
}

describe('VdSheetDrag', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('follows the pointer and dismisses past a quarter of the height', () => {
    const { el, header, fire, dismissed } = setup();
    at(0);
    fire('pointerdown', header, 100);
    at(400);
    fire('pointermove', header, 150);
    expect(el.dataset['dragging']).toBe('');
    expect(el.style.getPropertyValue('--vd-sheet-offset')).toBe('50px');
    at(800);
    fire('pointermove', header, 220);
    fire('pointerup', header, 220);
    expect(dismissed()).toBe(1);
    expect(el.dataset['dragging']).toBeUndefined();
    expect(el.style.getPropertyValue('--vd-sheet-offset')).toBe('');
  });

  it('snaps back on a short, slow drag', () => {
    const { header, fire, dismissed } = setup();
    at(0);
    fire('pointerdown', header, 100);
    at(500);
    fire('pointermove', header, 140);
    fire('pointerup', header, 140);
    expect(dismissed()).toBe(0);
  });

  it('ignores taps, presses on buttons, outside the handle, or when not a sheet', () => {
    const tap = setup();
    at(0);
    tap.fire('pointerdown', tap.header, 100);
    tap.fire('pointerup', tap.header, 102);
    expect(tap.dismissed()).toBe(0);

    const button = setup();
    button.fire('pointerdown', button.el.querySelector('.b')!, 100);
    button.fire('pointermove', button.header, 300);
    expect(button.el.dataset['dragging']).toBeUndefined();

    const body = setup();
    body.fire('pointerdown', body.el.querySelector('.body')!, 100);
    body.fire('pointermove', body.el, 300);
    expect(body.el.dataset['dragging']).toBeUndefined();

    const desktop = setup({ sheet: false });
    desktop.fire('pointerdown', desktop.header, 100);
    desktop.fire('pointermove', desktop.header, 300);
    expect(desktop.el.dataset['dragging']).toBeUndefined();

    const locked = setup({ dismissible: false });
    locked.fire('pointerdown', locked.header, 100);
    locked.fire('pointermove', locked.header, 300);
    expect(locked.el.dataset['dragging']).toBeUndefined();
  });
});

describe('vdSheetShouldDismiss', () => {
  it('uses distance or velocity, never upward offsets', () => {
    expect(vdSheetShouldDismiss(120, 400, 0)).toBe(true);
    expect(vdSheetShouldDismiss(40, 400, 0.8)).toBe(true);
    expect(vdSheetShouldDismiss(40, 400, 0.2)).toBe(false);
    expect(vdSheetShouldDismiss(-30, 400, 2)).toBe(false);
  });
});
