import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { VdBuzzer, type VdBuzzerState } from '@vadem/ui/buzzer';
import { VdSegment, VdSegmented } from '@vadem/ui/segmented';

const LABELS: Record<VdBuzzerState, string> = {
  locked: 'Зачекайте',
  ready: 'Відповісти',
  won: 'Ви перші!',
  spent: 'Спробу використано',
};

@Component({
  selector: 'demo-buzzer',
  imports: [VdBuzzer, VdSegmented, VdSegment],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .demo-buzzer-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--vd-space-6);
      align-items: center;
    }
    .demo-buzzer-row .vd-buzzer {
      --vd-buzzer-size: 12rem;
      --vd-buzzer-font-size: var(--vd-text-lg);
    }
    .demo-buzzer-live {
      display: grid;
      justify-items: center;
      gap: var(--vd-space-4);
    }
  `,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Buzzer</p>
      <h1>Buzzer</h1>
      <p>
        A press-to-answer button. It reacts on pointer down, because the first press wins, and a
        press never becomes a scroll or a zoom. A server decides who actually was first.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="buzzer-states">
      <div class="demo-section__head">
        <h2 id="buzzer-states">States</h2>
        <p>Only ready accepts a press. All states stay focusable.</p>
      </div>
      <div class="demo-buzzer-row">
        <button vdBuzzer>Зачекайте</button>
        <button vdBuzzer state="ready">Відповісти</button>
        <button vdBuzzer state="won">Ви перші!</button>
        <button vdBuzzer state="spent">Спробу використано</button>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="buzzer-live">
      <div class="demo-section__head">
        <h2 id="buzzer-live">Try it</h2>
        <p>Pressing while ready wins; the application changes the state and the label.</p>
      </div>
      <div class="demo-buzzer-live">
        <vd-segmented
          aria-label="Buzzer state"
          [value]="state()"
          (valueChange)="state.set($any($event))"
        >
          <vd-segment value="locked">Locked</vd-segment>
          <vd-segment value="ready">Ready</vd-segment>
          <vd-segment value="won">Won</vd-segment>
          <vd-segment value="spent">Spent</vd-segment>
        </vd-segmented>
        <button vdBuzzer [state]="state()" (buzz)="onBuzz()">{{ label() }}</button>
        <p aria-live="polite">Presses counted: {{ presses() }}</p>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="buzzer-content">
      <div class="demo-section__head">
        <h2 id="buzzer-content">Long and short labels, RTL</h2>
      </div>
      <div class="demo-buzzer-row">
        <button vdBuzzer state="ready">Go</button>
        <button vdBuzzer state="spent">Ви вже відповідали на це питання</button>
        <button vdBuzzer state="ready" dir="rtl">أجب الآن</button>
      </div>
    </section>
  `,
})
export default class BuzzerPage {
  protected readonly state = signal<VdBuzzerState>('ready');
  protected readonly presses = signal(0);
  protected readonly label = computed(() => LABELS[this.state()]);

  protected onBuzz(): void {
    this.presses.update((n) => n + 1);
    this.state.set('won');
  }
}
