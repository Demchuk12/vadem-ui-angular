// Copies the framework-agnostic CSS and fonts into the built package.
// Kept outside projects/ui on purpose (future @vadem/tokens); ng-packagr can't read
// assets outside the project root, so we copy after `ng build ui`.
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist/ui');

if (!existsSync(dist)) {
  console.error('dist/ui not found - run `ng build ui` first.');
  process.exit(1);
}

cpSync(resolve(root, 'src/styles'), resolve(dist, 'styles'), { recursive: true });
cpSync(resolve(root, 'src/fonts'), resolve(dist, 'fonts'), {
  recursive: true,
  filter: (src) => !src.endsWith('README.md'),
});
cpSync(resolve(root, 'projects/ui/icon/LICENSE-lucide.txt'), resolve(dist, 'LICENSE-lucide.txt'));
console.log('Copied styles/, fonts/ and third-party licenses into dist/ui');
