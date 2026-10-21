/**
 * Default user-facing strings of every component, grouped by component. Framework-agnostic:
 * adapters provide one of these objects; a component input always overrides its entry.
 */

export interface VdLocale {
  /** BCP 47 language tag, also used for plural rules. */
  code: string;
  activeFilters: {
    label: string;
    clearText: string;
    emptyText: string;
    invalidText: string;
    removeLabel: (label: string, value: string) => string;
  };
  alert: { dismissLabel: string };
  alertDialog: {
    confirmLabel: string;
    cancelLabel: string;
    pendingText: string;
    errorText: string;
  };
  autocomplete: {
    label: string;
    loadingText: string;
    emptyText: string;
    resultsText: (count: number) => string;
  };
  breadcrumbs: { label: string };
  calendar: { previousLabel: string; nextLabel: string };
  characterCount: {
    countText: (used: number, limit: number | null) => string;
    remainingText: (remaining: number) => string;
    overText: (excess: number) => string;
    limitText: string;
  };
  chart: {
    tableLabel: string;
    categoryLabel: string;
    /** Spoken summary of a sparkline: values arrive already formatted. */
    trendSummary: (first: string, last: string, min: string, max: string) => string;
  };
  datePicker: { openLabel: string; dialogLabel: string; previousLabel: string; nextLabel: string };
  colorPicker: {
    placeholder: string;
    pickerLabel: string;
    hexLabel: string;
    paletteLabel: string;
    applyLabel: string;
    errorLabel: string;
  };
  command: { label: string; placeholder: string; emptyText: string; loadingText: string };
  contextMenu: { label: string };
  copyButton: {
    label: string;
    copyingLabel: string;
    copiedLabel: string;
    errorLabel: string;
    errorMessage: string;
  };
  dateRangePicker: {
    groupLabel: string;
    startLabel: string;
    endLabel: string;
    openLabel: string;
    pickerLabel: string;
    previousLabel: string;
    nextLabel: string;
    startInstruction: string;
    endInstruction: string;
    errorLabel: string;
  };
  editableText: {
    emptyText: string;
    editLabel: (label: string, value: string) => string;
    saveLabel: string;
    cancelLabel: string;
    savingText: string;
    savedText: string;
    saveErrorText: string;
    requiredText: string;
    tooLongText: (limit: number) => string;
  };
  fileSize: { unknownText: string };
  filePreview: {
    title: string;
    closeLabel: string;
    downloadLabel: string;
    loadingText: string;
    errorText: string;
    emptyText: string;
    unsupportedText: string;
    pdfText: string;
  };
  expandableText: { expandLabel: string; collapseLabel: string };
  formErrorSummary: { title: string; description: string };
  kbd: { thenLabel: string };
  navigationList: { label: string };
  numberInput: { decreaseLabel: string; increaseLabel: string };
  pagination: {
    label: string;
    previousLabel: string;
    nextLabel: string;
    pageLabel: (page: number) => string;
  };
  passwordInput: { revealLabel: string };
  progressRing: { label: string };
  rangeSlider: { lowerLabel: string; upperLabel: string };
  rating: { starLabel: (value: number) => string };
  relativeTime: { justNowText: string; unknownText: string };
  reorderList: {
    label: string;
    instructions: string;
    upText: string;
    downText: string;
    emptyText: string;
    invalidText: string;
    movedText: (label: string, position: number, total: number) => string;
    canceledText: (label: string) => string;
  };
  searchInput: { clearLabel: string; loadingLabel: string };
  select: { emptyText: string };
  multiSelect: {
    removeLabel: (label: string) => string;
    selectionLabel: (count: number) => string;
  };
  sidebar: { label: string; closeLabel: string };
  stat: { increaseLabel: string; decreaseLabel: string; unchangedLabel: string };
  stepper: { label: string; completedLabel: string; errorLabel: string };
  tagInput: {
    addLabel: string;
    tagsLabel: string;
    removeLabel: (tag: string) => string;
    addedMessage: (tag: string) => string;
    removedMessage: (tag: string) => string;
    duplicateMessage: (tag: string) => string;
  };
  timeInput: { pickerLabel: string; hoursLabel: string; minutesLabel: string; emptyLabel: string };
  timeline: { label: string };
  toast: { label: string; closeLabel: string };
  toolbar: { label: string };
  tree: { label: string };
  uploadList: { label: string };
}

/** Picks a plural form with the platform's CLDR rules ("one", "few", "many", "other"...). */
export function vdPlural(
  code: string,
  count: number,
  forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string },
): string {
  const rule = new Intl.PluralRules(code).select(count);
  return (forms[rule] ?? forms.other).replace('#', String(count));
}

export const vdLocaleEn: VdLocale = {
  code: 'en',
  activeFilters: {
    label: 'Active filters',
    clearText: 'Clear all',
    emptyText: 'No filters applied.',
    invalidText: 'These filters could not be displayed.',
    removeLabel: (label, value) => `Remove ${label}: ${value}`,
  },
  alert: { dismissLabel: 'Dismiss' },
  alertDialog: {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    pendingText: 'Working… Please wait.',
    errorText: 'The action could not be completed. Try again or cancel.',
  },
  autocomplete: {
    label: 'Suggestions',
    loadingText: 'Loading suggestions…',
    emptyText: 'No suggestions. You can enter your own text.',
    resultsText: (count) =>
      vdPlural('en', count, {
        one: '# suggestion available.',
        other: '# suggestions available.',
      }),
  },
  breadcrumbs: { label: 'Breadcrumb' },
  calendar: { previousLabel: 'Previous month', nextLabel: 'Next month' },
  characterCount: {
    countText: (used, limit) =>
      limit === null
        ? vdPlural('en', used, { one: `${used} character`, other: `${used} characters` })
        : `${used} / ${limit}`,
    remainingText: (count) =>
      vdPlural('en', count, {
        one: `${count} character remaining.`,
        other: `${count} characters remaining.`,
      }),
    overText: (count) =>
      vdPlural('en', count, {
        one: `${count} character over the limit.`,
        other: `${count} characters over the limit.`,
      }),
    limitText: 'Character limit reached.',
  },
  chart: {
    tableLabel: 'Data table',
    categoryLabel: 'Category',
    trendSummary: (first, last, min, max) => `from ${first} to ${last}, low ${min}, high ${max}`,
  },
  datePicker: {
    openLabel: 'Choose date',
    dialogLabel: 'Choose date',
    previousLabel: 'Previous month',
    nextLabel: 'Next month',
  },
  colorPicker: {
    placeholder: 'Choose color',
    pickerLabel: 'Choose color',
    hexLabel: 'HEX color',
    paletteLabel: 'Palette',
    applyLabel: 'Apply color',
    errorLabel: 'Enter a HEX color, such as #6D4BD3',
  },
  contextMenu: { label: 'Actions' },
  command: {
    label: 'Search commands',
    placeholder: 'Search commands…',
    emptyText: 'No commands found',
    loadingText: 'Loading commands…',
  },
  copyButton: {
    label: 'Copy',
    copyingLabel: 'Copying…',
    copiedLabel: 'Copied',
    errorLabel: 'Try again',
    errorMessage: 'Could not copy. Select the text and copy it manually.',
  },
  dateRangePicker: {
    groupLabel: 'Date range',
    startLabel: 'Start date',
    endLabel: 'End date',
    openLabel: 'Choose date range',
    pickerLabel: 'Choose date range',
    previousLabel: 'Previous month',
    nextLabel: 'Next month',
    startInstruction: 'Choose the start date',
    endInstruction: 'Choose the end date',
    errorLabel: 'Enter a valid range, with the end on or after the start',
  },
  editableText: {
    emptyText: 'Add a value',
    editLabel: (label, value) => `Edit ${label}: ${value}`,
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    savingText: 'Saving…',
    savedText: 'Saved.',
    saveErrorText: 'Could not save. Your text is kept; try again.',
    requiredText: 'Enter a value.',
    tooLongText: (limit) => `Use at most ${limit} characters.`,
  },
  fileSize: { unknownText: 'Unknown size' },
  filePreview: {
    title: 'File preview',
    closeLabel: 'Close',
    downloadLabel: 'Download',
    loadingText: 'Loading preview…',
    errorText: 'The image could not be displayed. Download the file to open it.',
    emptyText: 'Choose a file to preview.',
    unsupportedText: 'Preview is not available for this file type. Download it to open it.',
    pdfText:
      'PDF preview depends on your browser. If it is unavailable, download the file to open it.',
  },
  expandableText: { expandLabel: 'Show more', collapseLabel: 'Show less' },
  formErrorSummary: {
    title: 'Check the form',
    description: 'Correct the following fields before continuing.',
  },
  kbd: { thenLabel: 'then' },
  navigationList: { label: 'Navigation' },
  numberInput: { decreaseLabel: 'Decrease value', increaseLabel: 'Increase value' },
  pagination: {
    label: 'Pagination',
    previousLabel: 'Previous page',
    nextLabel: 'Next page',
    pageLabel: (page) => `Page ${page}`,
  },
  passwordInput: { revealLabel: 'Show password' },
  progressRing: { label: 'Loading' },
  rangeSlider: { lowerLabel: 'Minimum', upperLabel: 'Maximum' },
  rating: {
    starLabel: (value) =>
      vdPlural('en', value, { one: '# out of 5 stars', other: '# out of 5 stars' }),
  },
  relativeTime: { justNowText: 'Just now', unknownText: 'Unknown time' },
  reorderList: {
    label: 'Item order',
    instructions:
      'Move items with Up and Down buttons or drag the handle. Escape cancels dragging.',
    upText: 'Up',
    downText: 'Down',
    emptyText: 'There are no items to reorder.',
    invalidText: 'This list cannot be reordered.',
    movedText: (label, position, total) => `${label}. Position ${position} of ${total}.`,
    canceledText: (label) => `Reordering canceled: ${label}.`,
  },
  searchInput: { clearLabel: 'Clear search', loadingLabel: 'Searching' },
  select: { emptyText: 'No options' },
  multiSelect: {
    removeLabel: (label) => `Remove ${label}`,
    selectionLabel: (count) => `${count} selected`,
  },
  sidebar: { label: 'Navigation', closeLabel: 'Close' },
  stat: { increaseLabel: 'Increase', decreaseLabel: 'Decrease', unchangedLabel: 'No change' },
  stepper: { label: 'Steps', completedLabel: 'Completed', errorLabel: 'Needs attention' },
  tagInput: {
    addLabel: 'Add tag',
    tagsLabel: 'Tags',
    removeLabel: (tag) => `Remove ${tag}`,
    addedMessage: (tag) => `Added ${tag}.`,
    removedMessage: (tag) => `Removed ${tag}.`,
    duplicateMessage: (tag) => `${tag} is already added.`,
  },
  timeInput: {
    pickerLabel: 'Choose time',
    hoursLabel: 'Hours',
    minutesLabel: 'Minutes',
    emptyLabel: 'No available times',
  },
  timeline: { label: 'Activity timeline' },
  toast: { label: 'Notifications', closeLabel: 'Close' },
  toolbar: { label: 'Toolbar' },
  tree: { label: 'Tree' },
  uploadList: { label: 'Uploads' },
};

export const vdLocaleUk: VdLocale = {
  code: 'uk',
  activeFilters: {
    label: 'Застосовані фільтри',
    clearText: 'Очистити всі',
    emptyText: 'Фільтри не застосовано.',
    invalidText: 'Не вдалося показати ці фільтри.',
    removeLabel: (label, value) => `Прибрати фільтр ${label}: ${value}`,
  },
  alert: { dismissLabel: 'Закрити повідомлення' },
  alertDialog: {
    confirmLabel: 'Підтвердити',
    cancelLabel: 'Скасувати',
    pendingText: 'Виконуємо дію… Зачекайте.',
    errorText: 'Не вдалося виконати дію. Спробуйте ще раз або скасуйте.',
  },
  autocomplete: {
    label: 'Підказки',
    loadingText: 'Завантаження підказок…',
    emptyText: 'Підказок немає. Можна ввести власний текст.',
    resultsText: (count) =>
      vdPlural('uk', count, {
        one: 'Доступна # підказка.',
        few: 'Доступні # підказки.',
        other: 'Доступно # підказок.',
      }),
  },
  breadcrumbs: { label: 'Навігаційний ланцюжок' },
  calendar: { previousLabel: 'Попередній місяць', nextLabel: 'Наступний місяць' },
  characterCount: {
    countText: (used, limit) =>
      limit === null
        ? vdPlural('uk', used, {
            one: `${used} символ`,
            few: `${used} символи`,
            many: `${used} символів`,
            other: `${used} символу`,
          })
        : `${used} / ${limit}`,
    remainingText: (count) =>
      `Залишилось ${vdPlural('uk', count, { one: `${count} символ`, few: `${count} символи`, many: `${count} символів`, other: `${count} символу` })}.`,
    overText: (count) =>
      `Перевищення на ${vdPlural('uk', count, { one: `${count} символ`, few: `${count} символи`, many: `${count} символів`, other: `${count} символу` })}.`,
    limitText: 'Ліміт символів досягнуто.',
  },
  chart: {
    tableLabel: 'Таблиця даних',
    categoryLabel: 'Категорія',
    trendSummary: (first, last, min, max) =>
      `від ${first} до ${last}, мінімум ${min}, максимум ${max}`,
  },
  datePicker: {
    openLabel: 'Обрати дату',
    dialogLabel: 'Обрати дату',
    previousLabel: 'Попередній місяць',
    nextLabel: 'Наступний місяць',
  },
  colorPicker: {
    placeholder: 'Оберіть колір',
    pickerLabel: 'Обрати колір',
    hexLabel: 'Колір HEX',
    paletteLabel: 'Палітра',
    applyLabel: 'Застосувати колір',
    errorLabel: 'Введіть колір у форматі HEX, наприклад #6D4BD3',
  },
  contextMenu: { label: 'Дії' },
  command: {
    label: 'Пошук команд',
    placeholder: 'Пошук команд…',
    emptyText: 'Команд не знайдено',
    loadingText: 'Завантаження команд…',
  },
  copyButton: {
    label: 'Копіювати',
    copyingLabel: 'Копіювання…',
    copiedLabel: 'Скопійовано',
    errorLabel: 'Спробувати ще раз',
    errorMessage: 'Не вдалося скопіювати. Виділіть текст і скопіюйте вручну.',
  },
  dateRangePicker: {
    groupLabel: 'Діапазон дат',
    startLabel: 'Дата початку',
    endLabel: 'Дата завершення',
    openLabel: 'Обрати діапазон дат',
    pickerLabel: 'Обрати діапазон дат',
    previousLabel: 'Попередній місяць',
    nextLabel: 'Наступний місяць',
    startInstruction: 'Оберіть дату початку',
    endInstruction: 'Оберіть дату завершення',
    errorLabel: 'Введіть коректний діапазон: кінець не раніше за початок',
  },
  editableText: {
    emptyText: 'Додати значення',
    editLabel: (label, value) => `Редагувати ${label}: ${value}`,
    saveLabel: 'Зберегти',
    cancelLabel: 'Скасувати',
    savingText: 'Зберігаємо…',
    savedText: 'Збережено.',
    saveErrorText: 'Не вдалося зберегти. Текст збережено в полі; спробуйте ще раз.',
    requiredText: 'Введіть значення.',
    tooLongText: (limit) => `Використайте не більше ${limit} символів.`,
  },
  fileSize: { unknownText: 'Розмір невідомий' },
  filePreview: {
    title: 'Перегляд файлу',
    closeLabel: 'Закрити',
    downloadLabel: 'Завантажити',
    loadingText: 'Завантажуємо перегляд…',
    errorText: 'Не вдалося показати зображення. Завантажте файл, щоб відкрити його.',
    emptyText: 'Виберіть файл для перегляду.',
    unsupportedText: 'Перегляд цього типу файлів недоступний. Завантажте файл, щоб відкрити його.',
    pdfText:
      'Перегляд PDF залежить від браузера. Якщо документ не відображається, завантажте файл.',
  },
  expandableText: { expandLabel: 'Показати більше', collapseLabel: 'Згорнути' },
  formErrorSummary: {
    title: 'Перевірте форму',
    description: 'Виправте ці поля, перш ніж продовжити.',
  },
  kbd: { thenLabel: 'потім' },
  navigationList: { label: 'Навігація' },
  numberInput: { decreaseLabel: 'Зменшити значення', increaseLabel: 'Збільшити значення' },
  pagination: {
    label: 'Сторінки',
    previousLabel: 'Попередня сторінка',
    nextLabel: 'Наступна сторінка',
    pageLabel: (page) => `Сторінка ${page}`,
  },
  passwordInput: { revealLabel: 'Показати пароль' },
  progressRing: { label: 'Завантаження' },
  rangeSlider: { lowerLabel: 'Мінімум', upperLabel: 'Максимум' },
  rating: {
    starLabel: (value) =>
      vdPlural('uk', value, {
        one: '# зірка з 5',
        few: '# зірки з 5',
        other: '# зірок з 5',
      }),
  },
  relativeTime: { justNowText: 'Щойно', unknownText: 'Час невідомий' },
  reorderList: {
    label: 'Порядок елементів',
    instructions:
      'Змінюйте порядок кнопками «Вище» та «Нижче» або перетягніть за маркер. Escape скасовує перетягування.',
    upText: 'Вище',
    downText: 'Нижче',
    emptyText: 'Немає елементів для впорядкування.',
    invalidText: 'Не вдалося впорядкувати цей список.',
    movedText: (label, position, total) => `${label}. Позиція ${position} з ${total}.`,
    canceledText: (label) => `Переміщення скасовано: ${label}.`,
  },
  searchInput: { clearLabel: 'Очистити пошук', loadingLabel: 'Пошук' },
  select: { emptyText: 'Немає варіантів' },
  multiSelect: {
    removeLabel: (label) => `Вилучити ${label}`,
    selectionLabel: (count) => `Обрано: ${count}`,
  },
  sidebar: { label: 'Навігація', closeLabel: 'Закрити' },
  stat: { increaseLabel: 'Зростання', decreaseLabel: 'Падіння', unchangedLabel: 'Без змін' },
  stepper: { label: 'Кроки', completedLabel: 'Завершено', errorLabel: 'Потребує уваги' },
  tagInput: {
    addLabel: 'Додати тег',
    tagsLabel: 'Теги',
    removeLabel: (tag) => `Вилучити ${tag}`,
    addedMessage: (tag) => `Додано ${tag}.`,
    removedMessage: (tag) => `Вилучено ${tag}.`,
    duplicateMessage: (tag) => `${tag} вже додано.`,
  },
  timeInput: {
    pickerLabel: 'Обрати час',
    hoursLabel: 'Години',
    minutesLabel: 'Хвилини',
    emptyLabel: 'Немає доступного часу',
  },
  timeline: { label: 'Хронологія подій' },
  toast: { label: 'Сповіщення', closeLabel: 'Закрити' },
  toolbar: { label: 'Панель інструментів' },
  tree: { label: 'Дерево' },
  uploadList: { label: 'Завантаження' },
};
