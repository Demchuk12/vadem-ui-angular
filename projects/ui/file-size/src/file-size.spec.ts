import { TestBed } from '@angular/core/testing';
import { vdLocaleProvider, vdLocaleUk } from '@vadem/ui/locale';
import { VdFileSizePipe } from './file-size';
it('uses locale defaults and explicit overrides without changing global locale', () => {
  TestBed.configureTestingModule({ providers: [vdLocaleProvider(vdLocaleUk)] });
  const pipe = TestBed.runInInjectionContext(() => new VdFileSizePipe());
  expect(pipe.transform(1536000)).toContain('1,5');
  expect(pipe.transform(null)).toBe('Розмір невідомий');
  expect(pipe.transform(1536000, 'decimal', 2, 'en')).toBe('1.54 MB');
  expect(pipe.transform(null, 'decimal', 1, 'en', 'Unavailable')).toBe('Unavailable');
  expect(pipe.transform(null)).toBe('Розмір невідомий');
});
