import { VdTooltipController, vdResetTooltipWarmth } from './tooltip-controller';

/** jsdom lacks the Popover API: emulate showPopover/hidePopover and :popover-open. */
function fakePopover(el: HTMLElement) {
  let open = false;
  el.showPopover = () => void (open = true);
  el.hidePopover = () => void (open = false);
  const matches = el.matches.bind(el);
  (el as { matches: (s: string) => boolean }).matches = (s) =>
    s === ':popover-open' ? open : matches(s);
  return () => open;
}

function setup() {
  const trigger = document.createElement('button');
  const tip = document.createElement('div');
  document.body.append(trigger, tip);
  const isOpen = fakePopover(tip);
  const controller = new VdTooltipController(trigger, tip, { showDelay: 500, hideDelay: 100 });
  const pointer = (type: string, el: Element, pointerType = 'mouse') =>
    el.dispatchEvent(new PointerEvent(type, { pointerType }));
  return { trigger, tip, isOpen, controller, pointer };
}

describe('VdTooltipController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vdResetTooltipWarmth();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('shows after the hover delay and hides after the grace period', () => {
    const { trigger, isOpen, pointer } = setup();
    pointer('pointerenter', trigger);
    vi.advanceTimersByTime(499);
    expect(isOpen()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(isOpen()).toBe(true);
    pointer('pointerleave', trigger);
    vi.advanceTimersByTime(100);
    expect(isOpen()).toBe(false);
  });

  it('stays open while the pointer moves onto the tooltip', () => {
    const { trigger, tip, isOpen, pointer } = setup();
    pointer('pointerenter', trigger);
    vi.advanceTimersByTime(500);
    pointer('pointerleave', trigger);
    pointer('pointerenter', tip);
    vi.advanceTimersByTime(1000);
    expect(isOpen()).toBe(true);
  });

  it('ignores touch, hides on Escape and on press', () => {
    const { trigger, isOpen, pointer, controller } = setup();
    pointer('pointerenter', trigger, 'touch');
    vi.advanceTimersByTime(1000);
    expect(isOpen()).toBe(false);

    controller.show();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(isOpen()).toBe(false);

    controller.show();
    pointer('pointerdown', trigger);
    expect(isOpen()).toBe(false);
  });

  it('shows instantly right after another tooltip closed (warm)', () => {
    const a = setup();
    a.controller.show();
    a.controller.hide();
    const b = setup();
    b.pointer('pointerenter', b.trigger);
    vi.advanceTimersByTime(0);
    expect(b.isOpen()).toBe(true);
  });
});
