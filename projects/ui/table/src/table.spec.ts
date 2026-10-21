import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VD_TABLE, VdSort, vdSortRows } from '@vadem/ui/table';

@Component({
  imports: [VD_TABLE],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div vdTableScroll aria-label="Файли">
      <table vdTable size="sm" stickyHeader [(sort)]="sort">
        <thead>
          <tr>
            <th scope="col" vdSortHeader="name">Назва</th>
            <th scope="col" vdSortHeader="size" data-numeric>Розмір</th>
            <th scope="col">Тип</th>
          </tr>
        </thead>
        <tbody>
          @for (f of sorted(); track f.name) {
            <tr vdRow [selected]="f.name === 'b'">
              <td>{{ f.name }}</td>
              <td data-numeric>{{ f.size }}</td>
              <td>txt</td>
            </tr>
          } @empty {
            <tr>
              <td vdTableEmpty colspan="3">Порожньо</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
class Host {
  readonly sort = signal<VdSort | null>(null);
  readonly files = signal([
    { name: 'c', size: 1 },
    { name: 'a', size: 3 },
    { name: 'b', size: 2 },
  ]);
  readonly sorted = computed(() => vdSortRows(this.files(), this.sort()));
}

describe('VdTable', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const names = () =>
      Array.from(root.querySelectorAll('tbody td:first-child')).map((td) => td.textContent!.trim());
    const header = (i: number) => root.querySelectorAll('th')[i];
    return { fixture, host: fixture.componentInstance, root, names, header };
  }

  it('reflects size, sticky header and selected rows; the scroll region is focusable', () => {
    const { root } = setup();
    const table = root.querySelector('table')!;
    expect(table.classList).toContain('vd-table');
    expect(table.getAttribute('data-size')).toBe('sm');
    expect(table.hasAttribute('data-sticky-header')).toBe(true);
    const scroll = root.querySelector('.vd-table-scroll')!;
    expect(scroll.getAttribute('role')).toBe('region');
    expect(scroll.getAttribute('tabindex')).toBe('0');
    expect(root.querySelectorAll('tr[data-selected]').length).toBe(1);
  });

  it('sorts through header buttons with aria-sort on the sorted column only', () => {
    const { fixture, host, names, header } = setup();
    expect(header(0).hasAttribute('aria-sort')).toBe(false);
    const button = header(0).querySelector('button')!;
    expect(button.getAttribute('type')).toBe('button');

    button.click();
    fixture.detectChanges();
    expect(host.sort()).toEqual({ key: 'name', direction: 'ascending' });
    expect(header(0).getAttribute('aria-sort')).toBe('ascending');
    expect(names()).toEqual(['a', 'b', 'c']);

    button.click();
    fixture.detectChanges();
    expect(header(0).getAttribute('aria-sort')).toBe('descending');
    expect(names()).toEqual(['c', 'b', 'a']);

    header(1).querySelector('button')!.click();
    fixture.detectChanges();
    expect(header(0).hasAttribute('aria-sort')).toBe(false);
    expect(header(1).getAttribute('aria-sort')).toBe('ascending');
    expect(names()).toEqual(['c', 'b', 'a']);
  });

  it('renders the empty state cell', () => {
    const { fixture, host, root } = setup();
    host.files.set([]);
    fixture.detectChanges();
    expect(root.querySelector('td.vd-table__empty')!.textContent).toContain('Порожньо');
  });
});
