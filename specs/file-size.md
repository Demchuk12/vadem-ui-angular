# File size

Status: stable · Pattern: plain localized text, native bidi isolation in compositions.

## API

`vdFormatFileSize(bytes, options?)` returns a string. `bytes` accepts number/null/undefined.
Options: `locale` (BCP47, default en), `system` (decimal | binary, default decimal),
`maximumFractionDigits` (integer 0–3, default 1), `unknownText` (default Unknown size).
Malformed locale falls back to en. Invalid precision falls back to 1.

Only nonnegative safe integer byte counts are valid. Zero is real data, not unknown.
Missing, negative, fractional, infinite, NaN and unsafe values return unknownText.
Decimal uses powers of 1000 and Intl localized byte/kilobyte/.../petabyte units.
Binary uses powers of 1024 and international KiB/MiB/GiB/TiB/PiB symbols; bytes use
localized Intl byte units. Numbers use Intl.NumberFormat, no forced trailing zeroes.
Rounded values reaching the next unit promote (999950 bytes → 1 MB at default precision).
Formatting never mutates the source, parses a display string or calculates transfer progress.

## Anatomy and accessibility

Plain text, no wrapper, focus stop, live region or interaction. Consumers should wrap a
standalone mixed-direction value in bdi, preserving native reading/selection/copying.
No keyboard behavior or ARIA role. No CSS, component tokens, animation or visual variants;
typography and contrast inherit from the containing component.

## Integrations

Upload list accepts optional numeric `size`; existing nonempty `sizeText` wins when supplied.
Omitted size remains hidden; explicit null displays the localized unknown text. File preview
shows the source Blob's actual byte count when present. Both use decimal defaults and bdi.
Applications may preformat binary sizes through sizeText where needed.

## Adapter notes

`VdFileSizePipe` (`vdFileSize`) is a pure standalone Angular pipe exported with the formatter
and `VdFileSizeOptions`/`VdFileSizeSystem` from `@vadem/ui/file-size`.
`bytes | vdFileSize:system:maximumFractionDigits:locale:unknownText` uses active VD_LOCALE.code
and locale:fileSize.unknownText unless explicitly overridden. No LOCALE_ID/global locale mutation.
Pure formatting has no Angular imports or browser globals; SSR/client Intl data must match.
