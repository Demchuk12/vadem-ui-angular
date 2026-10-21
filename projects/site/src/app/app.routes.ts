import { Routes } from '@angular/router';

/** English at the root, Ukrainian under /uk; the page reads `lang` from route data. */
export const routes: Routes = [
  { path: '', loadComponent: () => import('./landing'), data: { lang: 'en' } },
  { path: 'uk', loadComponent: () => import('./landing'), data: { lang: 'uk' } },
  { path: '**', redirectTo: '' },
];
