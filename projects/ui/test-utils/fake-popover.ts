/**
 * Test-only Popover API stand-in for jsdom: showPopover/hidePopover, :popover-open matching
 * and the `toggle` event. Install once per spec file.
 */
export function installFakePopover(): void {
  const proto = HTMLElement.prototype as HTMLElement & { __vdFake?: boolean };
  if (proto.__vdFake) return;
  proto.__vdFake = true;

  proto.showPopover = function (this: HTMLElement) {
    if (this.hasAttribute('data-popover-open')) return;
    this.setAttribute('data-popover-open', '');
    this.dispatchEvent(
      Object.assign(new Event('toggle'), { newState: 'open', oldState: 'closed' }),
    );
  };
  proto.hidePopover = function (this: HTMLElement) {
    if (!this.hasAttribute('data-popover-open')) return;
    this.removeAttribute('data-popover-open');
    this.dispatchEvent(
      Object.assign(new Event('toggle'), { newState: 'closed', oldState: 'open' }),
    );
  };
  const proto2 = Element.prototype as { matches: (this: Element, selector: string) => boolean };
  const matches = proto2.matches;
  proto2.matches = function (selector) {
    if (selector === ':popover-open') return this.hasAttribute('data-popover-open');
    return matches.call(this, selector);
  };
  // jsdom has no scrollIntoView.
  Element.prototype.scrollIntoView ??= () => undefined;
}
