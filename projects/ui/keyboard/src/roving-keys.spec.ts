import { vdIsActivationKey, vdRovingTarget, VdRovingOptions } from './roving-keys';

const h: VdRovingOptions = { orientation: 'horizontal', dir: 'ltr', loop: true };

describe('vdRovingTarget', () => {
  const none = [false, false, false, false];

  it('moves with arrows and wraps', () => {
    expect(vdRovingTarget('ArrowRight', 0, none, h)).toBe(1);
    expect(vdRovingTarget('ArrowRight', 3, none, h)).toBe(0);
    expect(vdRovingTarget('ArrowLeft', 0, none, h)).toBe(3);
  });

  it('mirrors arrows in RTL', () => {
    const rtl = { ...h, dir: 'rtl' as const };
    expect(vdRovingTarget('ArrowLeft', 0, none, rtl)).toBe(1);
    expect(vdRovingTarget('ArrowRight', 0, none, rtl)).toBe(3);
  });

  it('uses up/down for vertical and ignores the other axis', () => {
    const v = { ...h, orientation: 'vertical' as const };
    expect(vdRovingTarget('ArrowDown', 1, none, v)).toBe(2);
    expect(vdRovingTarget('ArrowUp', 1, none, v)).toBe(0);
    expect(vdRovingTarget('ArrowRight', 1, none, v)).toBeNull();
    expect(vdRovingTarget('ArrowDown', 1, none, h)).toBeNull();
  });

  it('skips disabled items, including for Home/End', () => {
    const d = [true, false, true, false];
    expect(vdRovingTarget('ArrowRight', 1, d, h)).toBe(3);
    expect(vdRovingTarget('ArrowRight', 3, d, h)).toBe(1);
    expect(vdRovingTarget('Home', 3, d, h)).toBe(1);
    expect(vdRovingTarget('End', 1, [false, false, true], h)).toBe(1);
  });

  it('stops at the edges without loop', () => {
    expect(vdRovingTarget('ArrowRight', 3, none, { ...h, loop: false })).toBe(3);
  });

  it('returns null for unrelated keys, empty or fully disabled sets', () => {
    expect(vdRovingTarget('a', 0, none, h)).toBeNull();
    expect(vdRovingTarget('ArrowRight', 0, [], h)).toBeNull();
    expect(vdRovingTarget('Home', 0, [true, true], h)).toBeNull();
  });

  it('recognises activation keys', () => {
    expect(vdIsActivationKey('Enter')).toBe(true);
    expect(vdIsActivationKey(' ')).toBe(true);
    expect(vdIsActivationKey('Tab')).toBe(false);
  });
});
