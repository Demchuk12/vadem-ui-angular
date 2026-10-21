/** All page copy. `uk` must satisfy the same shape as `en`, so no key can be left untranslated. */

import { VD_VERSION } from '@vadem/ui';

export type Lang = 'en' | 'uk';

const en = {
  htmlTitle: 'Vadem: accessible Angular components on native elements',
  skip: 'Skip to content',
  nav: {
    label: 'Site',
    components: 'Components',
    usage: 'Usage',
    roadmap: 'Roadmap',
    langSwitch: 'Українською',
    theme: { dark: 'Theme: dark', light: 'Theme: light' },
  },
  hero: {
    status: `Pre-release ${VD_VERSION}`,
    title: 'Components that stay native.',
    lead: 'Vadem is an Angular component library built on real buttons, inputs and dialogs, plain layered CSS, and one accent hue that themes everything.',
    primary: 'Browse components',
    secondary: 'See the code',
  },
  specimen: {
    label: 'Live example built with Vadem components',
    title: 'Deploy settings',
    status: 'Ready',
    region: 'Region',
    regions: { eu: 'Europe', us: 'US East', asia: 'Asia' },
    previews: 'Preview deployments for every branch',
    deploy: 'Deploy',
    cancel: 'Cancel',
    hue: 'Accent hue',
    hueHint: 'Drag to retheme this whole page. It changes one CSS variable.',
  },
  principles: {
    title: 'What it is built on',
    items: [
      {
        claim: 'Native elements first',
        proof:
          'A Vadem button is a <button>, a dialog is a <dialog>, tooltips use the Popover API. Behaviour you would otherwise reimplement comes from the browser.',
      },
      {
        claim: 'Accessibility is a requirement',
        proof:
          'Every component follows a WAI-ARIA pattern, works from the keyboard, passes axe in both themes, and keeps its focus ring in forced-colors mode.',
      },
      {
        claim: 'One hue, two themes',
        proof:
          'Colours are OKLCH tokens derived from --vd-hue-accent. Dark and light come from light-dark(), on the page or on any single element.',
      },
      {
        claim: 'CSS you can override',
        proof:
          'Styles are plain global CSS inside @layer vd. Any unlayered rule you write wins, without !important or deep selectors.',
      },
    ],
  },
  usage: {
    title: 'Import a directive. Keep the element.',
    lead: 'Most components are attribute directives on native elements, so forms, routing and the DOM behave the way you expect.',
    codeLabel: 'Angular template',
    domLabel: 'Rendered DOM',
  },
  catalog: {
    title: 'Components',
    lead: 'Each one has a spec, keyboard tests and an axe check, in dark and light, LTR and RTL.',
    open: 'Open in the gallery',
    groups: {
      forms: 'Forms and input',
      choice: 'Selection',
      overlays: 'Overlays and feedback',
      navigation: 'Navigation and layout',
      data: 'Data display',
    },
  },
  roadmap: {
    title: 'Roadmap',
    steps: [
      {
        title: 'Angular',
        text: 'The component set, tokens, themes and demo screens.',
        state: 'Now',
      },
      {
        title: 'Framework-free core',
        text: 'Keyboard, selection and dialog logic as plain TypeScript.',
        state: 'Next',
      },
      {
        title: 'React, Vue, Svelte',
        text: 'Adapters with idiomatic APIs over the same CSS and core.',
        state: 'Later',
      },
    ],
  },
  footer: {
    made: 'Made in Ukraine by Vasyl Demchuk.',
    fonts: 'Manrope and JetBrains Mono under the OFL. Icons from Lucide (ISC).',
    gallery: 'Component gallery',
  },
};

export type Copy = typeof en;

const uk: Copy = {
  htmlTitle: 'Vadem: доступні Angular-компоненти на нативних елементах',
  skip: 'Перейти до вмісту',
  nav: {
    label: 'Сайт',
    components: 'Компоненти',
    usage: 'Використання',
    roadmap: 'План',
    langSwitch: 'English',
    theme: { dark: 'Тема: темна', light: 'Тема: світла' },
  },
  hero: {
    status: `Попередній випуск ${VD_VERSION}`,
    title: 'Компоненти, що лишаються нативними.',
    lead: 'Vadem — бібліотека компонентів для Angular на справжніх кнопках, полях і діалогах, зі звичайним CSS у шарах і одним відтінком акценту, що задає всю тему.',
    primary: 'Переглянути компоненти',
    secondary: 'Подивитися код',
  },
  specimen: {
    label: 'Живий приклад, зібраний з компонентів Vadem',
    title: 'Налаштування розгортання',
    status: 'Готово',
    region: 'Регіон',
    regions: { eu: 'Європа', us: 'США Схід', asia: 'Азія' },
    previews: 'Попередні розгортання для кожної гілки',
    deploy: 'Розгорнути',
    cancel: 'Скасувати',
    hue: 'Відтінок акценту',
    hueHint: 'Потягніть, щоб перефарбувати всю сторінку. Змінюється одна CSS-змінна.',
  },
  principles: {
    title: 'На чому це побудовано',
    items: [
      {
        claim: 'Спершу нативні елементи',
        proof:
          'Кнопка Vadem — це <button>, діалог — <dialog>, підказки працюють на Popover API. Поведінку, яку довелося б писати самому, дає браузер.',
      },
      {
        claim: 'Доступність — це вимога',
        proof:
          'Кожен компонент іде за патерном WAI-ARIA, працює з клавіатури, проходить axe в обох темах і зберігає фокус у режимі forced-colors.',
      },
      {
        claim: 'Один відтінок, дві теми',
        proof:
          'Кольори — це OKLCH-токени, похідні від --vd-hue-accent. Темна й світла теми йдуть з light-dark(), для сторінки чи окремого елемента.',
      },
      {
        claim: 'CSS, який легко перевизначити',
        proof:
          'Стилі — звичайний глобальний CSS у @layer vd. Будь-яке ваше правило поза шаром перемагає без !important і глибоких селекторів.',
      },
    ],
  },
  usage: {
    title: 'Імпортуйте директиву. Елемент лишається.',
    lead: 'Більшість компонентів — це атрибутні директиви на нативних елементах, тож форми, маршрутизація й DOM поводяться так, як ви очікуєте.',
    codeLabel: 'Шаблон Angular',
    domLabel: 'Результат у DOM',
  },
  catalog: {
    title: 'Компоненти',
    lead: 'У кожного є специфікація, тести клавіатури й перевірка axe — у темній і світлій темах, LTR і RTL.',
    open: 'Відкрити в галереї',
    groups: {
      forms: 'Форми та введення',
      choice: 'Вибір',
      overlays: 'Оверлеї та відгук',
      navigation: 'Навігація та макет',
      data: 'Відображення даних',
    },
  },
  roadmap: {
    title: 'План',
    steps: [
      { title: 'Angular', text: 'Набір компонентів, токени, теми й демо-екрани.', state: 'Зараз' },
      {
        title: 'Ядро без фреймворку',
        text: 'Логіка клавіатури, вибору й діалогів на чистому TypeScript.',
        state: 'Далі',
      },
      {
        title: 'React, Vue, Svelte',
        text: 'Адаптери з природними для кожного API поверх того самого CSS і ядра.',
        state: 'Згодом',
      },
    ],
  },
  footer: {
    made: 'Зроблено в Україні. Автор — Василь Демчук.',
    fonts: 'Manrope і JetBrains Mono за ліцензією OFL. Іконки Lucide (ISC).',
    gallery: 'Галерея компонентів',
  },
};

export const COPY: Record<Lang, Copy> = { en, uk };

/** Component names link to gallery routes; names are product names and stay untranslated. */
export const CATALOG: Record<keyof Copy['catalog']['groups'], { name: string; route: string }[]> = {
  forms: [
    { name: 'Button', route: 'button' },
    { name: 'Input', route: 'input' },
    { name: 'Password input', route: 'password-input' },
    { name: 'Number input', route: 'number-input' },
    { name: 'OTP input', route: 'otp-input' },
    { name: 'Time input', route: 'time-input' },
    { name: 'Tag input', route: 'tag-input' },
    { name: 'Color picker', route: 'color-picker' },
    { name: 'Date picker', route: 'calendar' },
    { name: 'Date range picker', route: 'date-range-picker' },
    { name: 'File upload', route: 'dropzone' },
    { name: 'Rating', route: 'rating' },
  ],
  choice: [
    { name: 'Checkbox & Switch', route: 'choice' },
    { name: 'Radio', route: 'radio' },
    { name: 'Select', route: 'select' },
    { name: 'Multi-select', route: 'multi-select' },
    { name: 'Autocomplete', route: 'autocomplete' },
    { name: 'Segmented', route: 'segmented' },
    { name: 'Slider', route: 'slider' },
    { name: 'Range slider', route: 'range-slider' },
  ],
  overlays: [
    { name: 'Dialog', route: 'dialog' },
    { name: 'Popover', route: 'popover' },
    { name: 'Tooltip', route: 'tooltip' },
    { name: 'Menu', route: 'menu' },
    { name: 'Command palette', route: 'command' },
    { name: 'Toast', route: 'toast' },
    { name: 'Alert', route: 'alert' },
    { name: 'Copy button', route: 'copy-button' },
  ],
  navigation: [
    { name: 'Sidebar', route: 'sidebar' },
    { name: 'Navigation list', route: 'navigation-list' },
    { name: 'Tabs', route: 'tabs' },
    { name: 'Breadcrumbs', route: 'breadcrumbs' },
    { name: 'Pagination', route: 'pagination' },
    { name: 'Stepper', route: 'stepper' },
    { name: 'Toolbar', route: 'toolbar' },
    { name: 'Accordion', route: 'accordion' },
    { name: 'Splitter', route: 'splitter' },
    { name: 'Scroll area', route: 'scroll-area' },
  ],
  data: [
    { name: 'Table', route: 'table' },
    { name: 'Tree view', route: 'tree' },
    { name: 'Timeline', route: 'timeline' },
    { name: 'Description list', route: 'description-list' },
    { name: 'Badge & Card', route: 'card' },
    { name: 'Avatar', route: 'avatar' },
    { name: 'Progress & Meter', route: 'progress' },
    { name: 'Skeleton', route: 'skeleton' },
    { name: 'Empty state', route: 'empty-state' },
    { name: 'Upload list', route: 'upload-list' },
  ],
};
