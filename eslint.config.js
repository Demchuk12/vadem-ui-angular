// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

// Single source of truth for the selector prefix. Renaming the library = change it here
// (and in angular.json "prefix").
const PREFIX = 'vd';

module.exports = tseslint.config(
  { ignores: ['dist/', '.angular/', 'node_modules/', 'test-results/', 'playwright-report/'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      // Hook signatures in base classes name parameters they don't use.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['projects/ui/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: PREFIX, style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: PREFIX, style: 'kebab-case' },
      ],
      // SSR safety: reach the DOM through DI (DOCUMENT) or element refs, never globals.
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'Not SSR-safe. Inject DOCUMENT and use defaultView.' },
        { name: 'document', message: 'Not SSR-safe. Inject DOCUMENT.' },
        { name: 'localStorage', message: 'Not SSR-safe.' },
        { name: 'navigator', message: 'Not SSR-safe.' },
      ],
    },
  },
  {
    // Tests run in a DOM environment; SSR rules don't apply.
    files: ['projects/ui/**/*.spec.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    // Framework-agnostic logic: no Angular (or any framework) imports allowed.
    files: ['projects/ui/**/core/**/*.ts', 'projects/ui/keyboard/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@angular/*', 'rxjs', 'rxjs/*'],
              message: 'core/ must stay framework-agnostic.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['projects/site/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'site', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'site', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['projects/demo/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'demo', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'demo', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
);
