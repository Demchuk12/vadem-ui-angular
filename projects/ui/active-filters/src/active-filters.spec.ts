import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdActiveFilters } from './active-filters';
const filters = Object.freeze([
  { id: 'a', label: 'Статус', value: 'очікує' },
  { id: 'b', label: 'Клієнт', value: 'Іскра' },
]);
beforeEach(() => TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] }));
async function setup() {
  const fixture = TestBed.createComponent(VdActiveFilters);
  fixture.componentRef.setInput('filters', filters);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}
it('names native actions and emits requests without changing input', async () => {
  const { fixture, root } = await setup();
  const remove = vi.fn(),
    clear = vi.fn();
  fixture.componentInstance.filterRemove.subscribe(remove);
  fixture.componentInstance.clearAll.subscribe(clear);
  expect(root.getAttribute('role')).toBe('group');
  expect(root.getAttribute('aria-label')).toBe('Застосовані фільтри');
  const buttons = root.querySelectorAll('button');
  expect(buttons[0].getAttribute('aria-label')).toBe('Прибрати фільтр Статус: очікує');
  buttons[0].click();
  buttons[2].click();
  await fixture.whenStable();
  expect(remove).toHaveBeenCalledWith('a');
  expect(clear).toHaveBeenCalledTimes(1);
  expect(root.querySelectorAll('li')).toHaveLength(2);
  expect(fixture.componentInstance.filters()).toBe(filters);
  expect(root.querySelector('[aria-live],[role=status]')).toBeNull();
});
it('guards disabled/invalid/empty state with no accidental requests', async () => {
  const { fixture, root } = await setup();
  const remove = vi.fn();
  fixture.componentInstance.filterRemove.subscribe(remove);
  fixture.componentRef.setInput('disabled', true);
  await fixture.whenStable();
  root.querySelector('button')!.click();
  expect(remove).not.toHaveBeenCalled();
  expect([...root.querySelectorAll('button')].every((button) => button.disabled)).toBe(true);
  fixture.componentRef.setInput('filters', [filters[0], filters[0]]);
  await fixture.whenStable();
  expect(root.getAttribute('data-state')).toBe('invalid');
  expect(root.querySelector('button')).toBeNull();
  fixture.componentRef.setInput('filters', []);
  await fixture.whenStable();
  expect(root.textContent).toContain('Фільтри не застосовано.');
  expect(root.querySelector('ul')).toBeNull();
});
it('preserves literal labels and supports explicit copy overrides', async () => {
  const { fixture, root } = await setup();
  fixture.componentRef.setInput('filters', [
    { id: '"[]', label: '<img>', value: '<strong>Ї</strong>' },
  ]);
  fixture.componentRef.setInput(
    'removeLabel',
    (label: string, value: string) => `Remove ${label} / ${value}`,
  );
  fixture.componentRef.setInput('clearText', 'Clear');
  await fixture.whenStable();
  expect(root.querySelector('img,strong')).toBeNull();
  expect(root.textContent).toContain('<strong>Ї</strong>');
  expect(root.querySelector('button')!.getAttribute('aria-label')).toBe(
    'Remove <img> / <strong>Ї</strong>',
  );
  expect(root.querySelectorAll('bdi')).toHaveLength(2);
  expect(root.textContent).toContain('Clear');
});
