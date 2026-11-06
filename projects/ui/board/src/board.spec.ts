import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VD_BOARD, type VdBoardCellState } from './board';

@Component({
  imports: [VD_BOARD],
  providers: [vdLocaleProvider(vdLocaleUk)],
  template: `
    <vd-board label="Раунд 1" [rows]="2">
      <vd-board-column heading="Історія">
        <button vdBoardCell [state]="state()">200</button>
        <div vdBoardCell [state]="state()">400</div>
      </vd-board-column>
      <vd-board-column heading="Кіно">
        <button vdBoardCell>200</button>
      </vd-board-column>
    </vd-board>
  `,
})
class Host {
  readonly state = signal<VdBoardCellState>('open');
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    board: root.querySelector<HTMLElement>('vd-board')!,
    button: root.querySelector('button')!,
    readOnly: root.querySelector<HTMLElement>('div[vdBoardCell]')!,
    column: root.querySelector('vd-board-column')!,
  };
}

describe('Board', () => {
  it('derives the column count and exposes rows to the layout', async () => {
    const { board } = await setup();
    expect(board.style.getPropertyValue('--vd-board-columns')).toBe('2');
    expect(board.style.getPropertyValue('--vd-board-rows')).toBe('2');
    expect(board.style.getPropertyValue('--vd-board-column-span')).toBe('3');
  });

  it('names the board and every column as groups', async () => {
    const { board, column } = await setup();
    expect(board.getAttribute('role')).toBe('group');
    expect(board.getAttribute('aria-label')).toBe('Раунд 1');
    expect(column.getAttribute('role')).toBe('group');
    expect(column.getAttribute('aria-label')).toBe('Історія');
  });

  it('keeps buttons as non-submitting buttons and read-only tiles free of button state', async () => {
    const { button, readOnly } = await setup();
    expect(button.getAttribute('type')).toBe('button');
    expect(readOnly.hasAttribute('type')).toBe(false);
  });

  it('marks the active tile as current', async () => {
    const { fixture, host, button } = await setup();
    host.state.set('active');
    await fixture.whenStable();
    expect(button.getAttribute('aria-current')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('disables a played button and speaks the locale label on both element kinds', async () => {
    const { fixture, host, button, readOnly } = await setup();
    host.state.set('played');
    await fixture.whenStable();
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(readOnly.hasAttribute('disabled')).toBe(false);
    expect(button.querySelector('.vd-visually-hidden')?.textContent).toBe('Зіграно');
    expect(readOnly.querySelector('.vd-visually-hidden')?.textContent).toBe('Зіграно');
  });
});
