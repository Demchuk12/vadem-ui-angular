import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VdPagination } from '@vadem/ui/pagination';

@Component({
  imports: [VdPagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vd-pagination
      class="full"
      label="Сторінки рахунків"
      previousLabel="Попередня"
      nextLabel="Наступна"
      [pageLabel]="pageLabel"
      [pageCount]="12"
      [(page)]="page"
    />
    <vd-pagination class="compact" compact [pageCount]="3" [(page)]="small" />
  `,
})
class Host {
  readonly page = signal(6);
  readonly small = signal(1);
  readonly pageLabel = (n: number) => `Сторінка ${n}`;
}

describe('VdPagination', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const full = root.querySelector<HTMLElement>('.full')!;
    const pages = () =>
      Array.from(full.querySelectorAll<HTMLButtonElement>('.vd-pagination__page')).map((b) =>
        b.textContent!.trim(),
      );
    return { fixture, host: fixture.componentInstance, root, full, pages };
  }

  it('is a named navigation landmark with the current page marked', () => {
    const { full, pages } = setup();
    expect(full.getAttribute('role')).toBe('navigation');
    expect(full.getAttribute('aria-label')).toBe('Сторінки рахунків');
    expect(pages()).toEqual(['1', '5', '6', '7', '12']);
    expect(full.querySelectorAll('.vd-pagination__ellipsis').length).toBe(2);
    const current = full.querySelector('[aria-current="page"]')!;
    expect(current.textContent!.trim()).toBe('6');
    expect(current.getAttribute('aria-label')).toBe('Сторінка 6');
  });

  it('moves with page buttons and steps; steps at the edges are aria-disabled', () => {
    const { fixture, host, full } = setup();
    const [prev, next] = Array.from(
      full.querySelectorAll<HTMLButtonElement>('.vd-pagination__step'),
    );
    expect(prev.getAttribute('aria-label')).toBe('Попередня');
    next.click();
    fixture.detectChanges();
    expect(host.page()).toBe(7);

    full.querySelector<HTMLButtonElement>('[aria-label="Сторінка 12"]')!.click();
    fixture.detectChanges();
    expect(host.page()).toBe(12);
    expect(next.getAttribute('aria-disabled')).toBe('true');
    expect(next.disabled).toBe(false);
    next.click();
    fixture.detectChanges();
    expect(host.page()).toBe(12);
    expect(prev.hasAttribute('aria-disabled')).toBe(false);
  });

  it('shows "page / count" in compact mode', () => {
    const { root } = setup();
    const compact = root.querySelector('.compact')!;
    expect(compact.querySelector('.vd-pagination__status')!.textContent!.trim()).toBe('1 / 3');
    expect(compact.querySelector('.vd-pagination__pages')).toBeNull();
    expect(compact.querySelector('.vd-pagination__step')!.getAttribute('aria-disabled')).toBe(
      'true',
    );
  });
});
