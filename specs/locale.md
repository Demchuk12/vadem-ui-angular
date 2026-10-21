# Locale

Status: draft · Pattern: shared configuration (no DOM)

Default user-facing strings of all components: accessible names, announcements, empty and error
text, and count phrases. One locale object is active per application or per subtree; a text
input set on a component instance always wins.

## Shape

`VdLocale` has `code` (BCP 47 tag) and one section per component, named after the component in
camelCase (`toast`, `datePicker`, `multiSelect`...). Each section repeats the names of that
component's text inputs, so documentation for an input is also documentation for its locale
entry. Count-dependent entries are functions (`resultsText(count)`, `starLabel(value)`).

Packs: `vdLocaleEn` (default) and `vdLocaleUk`. Plurals use CLDR rules through
`vdPlural(code, count, { one, few, many, other })`, where `#` is replaced by the count;
Ukrainian needs one/few/many ("1 підказка", "3 підказки", "5 підказок").

## Resolution

For every text input: value set on the instance, otherwise the active locale entry of the same
name. Inputs that have no locale entry (placeholders left empty by default, value formatters
such as `valueText`) are unchanged.

## Adding a language

Create a full `VdLocale` object; the type lists every required key, so a missing string is a
compile error. Spreading `vdLocaleEn` gives English fallbacks for sections not yet translated.

## Adapter notes

Core: `projects/ui/locale/src/core/locale.ts` (no Angular): `VdLocale`, packs, `vdPlural`.
Angular: `VD_LOCALE` token (defaults to English), `provideVdLocale(locale)` for the application,
`vdLocaleProvider(locale)` in a component's `providers` for a subtree, and
`vdTexts(section, { input: this.input, ... })` inside components to resolve inputs.
React/Vue: a context/provide-inject value with the same object.
