import { ChangeDetectionStrategy, Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { VD_VERSION } from '@vadem/ui';
import { provideVdLocale, vdLocaleUk } from '@vadem/ui/locale';
import { ProfileForm } from './profile-form';
import { SelectLifecycle } from './select-lifecycle';

@Component({
  selector: 'app-root',
  imports: [ProfileForm, SelectLifecycle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <h1>Vadem package consumer</h1>
      <p data-testid="version">{{ version }}</p>
      <app-profile-form />
      <app-select-lifecycle />
    </main>
  `,
})
class App {
  protected readonly version = VD_VERSION;
}

bootstrapApplication(App, { providers: [provideVdLocale(vdLocaleUk)] }).catch(console.error);
