import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VdButton } from '@vadem/ui/button';
import { provideVdLocale, vdLocaleUk } from '@vadem/ui/locale';

@Component({
  selector: 'app-root',
  imports: [VdButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Мій перший інтерфейс із Vadem</h1>
    <button vdButton variant="primary" (click)="count.update(increment)">Додати</button>
    <p role="status">Додано: {{ count() }}</p>
  `,
})
export class App {
  protected readonly count = signal(0);
  protected readonly increment = (value: number) => value + 1;
}

bootstrapApplication(App, { providers: [provideVdLocale(vdLocaleUk)] }).catch(console.error);
