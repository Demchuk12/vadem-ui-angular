import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdReorderList } from './reorder-list';
beforeEach(() => TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] }));
const initial = [
  { id: 'a', label: 'Звіт', description: 'Ї є і ґ' },
  { id: 'b', label: 'План' },
  { id: 'c', label: 'Якість' },
];
async function setup(items = initial) {
  const fixture = TestBed.createComponent(VdReorderList);
  fixture.componentRef.setInput('items', items);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const rows = () => [...root.querySelectorAll<HTMLElement>('[data-reorder-id]')];
  return { fixture, root, rows };
}
describe('Reorder list', () => {
  it('provides named list/instructions, quiet status and boundary guards', async () => {
    const { fixture, root, rows } = await setup();
    const changed = vi.fn();
    fixture.componentInstance.reordered.subscribe(changed);
    expect(root.querySelector('ol')!.getAttribute('aria-label')).toBe('Порядок елементів');
    expect(root.querySelector('ol')!.getAttribute('aria-describedby')).toBe(
      root.querySelector('p')!.id,
    );
    expect(root.querySelector('[role=status]')!.textContent).toBe('');
    const up = rows()[0].querySelector('button')!;
    expect(up.disabled).toBe(true);
    up.click();
    await fixture.whenStable();
    expect(changed).not.toHaveBeenCalled();
  });
  it('keeps row identity, emits immutable model and position metadata and updates native order', async () => {
    const { fixture, root, rows } = await setup();
    const first = rows()[0],
      change = vi.fn(),
      model = vi.fn();
    fixture.componentInstance.reordered.subscribe(change);
    fixture.componentInstance.items.subscribe(model);
    first.querySelectorAll('button')[1].click();
    await fixture.whenStable();
    expect(rows().map((row) => row.dataset['reorderId'])).toEqual(['b', 'a', 'c']);
    expect(rows()[1]).toBe(first);
    expect(model).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledWith({ id: 'a', fromIndex: 0, toIndex: 1, method: 'buttons' });
    expect(initial.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(root.querySelector('[role=status]')!.textContent).toBe('Звіт. Позиція 2 з 3.');
  });
  it('handles invalid, empty, single and disabled inputs without actionable moves', async () => {
    const { fixture, root } = await setup();
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(root.getAttribute('data-state')).toBe('disabled');
    expect(root.querySelectorAll('button:disabled')).toHaveLength(6);
    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('items', [
      { id: 'x', label: 'Один' },
      { id: 'x', label: 'Два' },
    ]);
    await fixture.whenStable();
    expect(root.getAttribute('data-state')).toBe('invalid');
    expect(root.querySelectorAll('button')).toHaveLength(0);
    fixture.componentRef.setInput('items', []);
    await fixture.whenStable();
    expect(root.getAttribute('data-state')).toBe('empty');
    expect(root.textContent).toContain('Немає елементів');
    fixture.componentRef.setInput('items', [initial[0]]);
    await fixture.whenStable();
    expect([...root.querySelectorAll('button')].every((button) => button.disabled)).toBe(true);
  });
  it('renders hostile-looking IDs/labels as text and supports custom announcement copy', async () => {
    const { fixture, root, rows } = await setup([
      { id: 'a"[]', label: '<img src=x onerror=alert(1)>', description: '<strong>Ї</strong>' },
      { id: 'b', label: 'Інший' },
    ]);
    fixture.componentRef.setInput('downText', 'Далі');
    fixture.componentRef.setInput(
      'movedText',
      (_label: string, position: number, total: number) => `${position}/${total}`,
    );
    await fixture.whenStable();
    rows()[0].querySelectorAll('button')[1].click();
    await fixture.whenStable();
    expect(root.querySelector('img,strong,script')).toBeNull();
    expect(root.querySelector('[role=status]')!.textContent).toBe('2/2');
    expect(rows()[1].textContent).toContain('<img');
  });
});
