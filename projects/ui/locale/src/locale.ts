import {
  type EnvironmentProviders,
  InjectionToken,
  type Provider,
  type Signal,
  computed,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { type VdLocale, vdLocaleEn } from './core/locale';

/** Active strings for Vadem components. English unless the application provides another. */
export const VD_LOCALE = new InjectionToken<VdLocale>('VD_LOCALE', {
  providedIn: 'root',
  factory: () => vdLocaleEn,
});

/** Application-wide component strings: `provideVdLocale(vdLocaleUk)` in bootstrap providers. */
export function provideVdLocale(locale: VdLocale): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: VD_LOCALE, useValue: locale }]);
}

/** The same, for one component subtree: `providers: [vdLocaleProvider(vdLocaleUk)]`. */
export function vdLocaleProvider(locale: VdLocale): Provider {
  return { provide: VD_LOCALE, useValue: locale };
}

type Section = Exclude<keyof VdLocale, 'code'>;

/**
 * Resolves a component's text inputs against the active locale: an input that is set wins,
 * otherwise the locale entry of the same name. Call in a field initializer (injection context).
 */
export function vdTexts<S extends Section, K extends keyof VdLocale[S]>(
  section: S,
  inputs: { [P in K]: Signal<VdLocale[S][P] | undefined> },
): Signal<Pick<VdLocale[S], K>> {
  const locale = inject(VD_LOCALE)[section];
  return computed(() => {
    const resolved = {} as Pick<VdLocale[S], K>;
    for (const key of Object.keys(inputs) as K[]) {
      resolved[key] = inputs[key]() ?? locale[key];
    }
    return resolved;
  });
}
