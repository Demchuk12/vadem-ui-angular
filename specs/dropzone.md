# Dropzone (file upload)

Status: draft · Pattern: native `<input type="file">` inside its `<label>`

Choose files with the system picker or by dropping them. The library handles picking,
dropping and checking; the consumer owns requests and file state. Use the optional
[File upload list](upload-list.md) for controlled transfer presentation, or compose a custom
list with `vdProgress`.

## Anatomy

```html
<label class="vd-dropzone" data-dragover>
  <input type="file" accept="image/*,.pdf" multiple />
  <!-- visually hidden, focusable -->
  <vd-icon name="upload" />
  <strong>Перетягніть файли</strong> або натисніть, щоб обрати
  <span>PNG, JPG або PDF до 10 МБ</span>
</label>
```

## API

| Part                | Inputs / outputs                                                   | Notes                                                  |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| `label[vdDropzone]` | `maxSize` (bytes)                                                  | `accept` and `multiple` are read from the inner input. |
|                     | `(filesSelected): File[]`                                          | Accepted files after each pick or drop.                |
|                     | `(filesRejected): { file, reason: 'type' \| 'size' \| 'count' }[]` | Show why.                                              |

Dropped files bypass the picker's filter, so they are checked with `vdAcceptsFile` /
`vdCheckFiles` (core, pure) and the accepted ones are written back to `input.files`, so a plain
form submit sends them. Without `multiple`, only the first accepted file is kept.

## Keyboard

Tab focuses the hidden input (ring on the dropzone); Enter/Space opens the picker. Dropping is
a pointer-only shortcut; the picker covers everyone.

## States

| State         | Reflected as                                                            |
| ------------- | ----------------------------------------------------------------------- |
| idle          | dashed control border, field background                                 |
| hover         | stronger border                                                         |
| focus-visible | ring on the label (`:has(input:focus-visible)`)                         |
| drag over     | `data-dragover` - solid accent border, accent-subtle fill, slight scale |
| invalid       | input `data-invalid` - danger border                                    |
| disabled      | input `disabled` - reduced opacity, drops ignored                       |

## ARIA contract

- Name: the label text (everything inside the label). Keep it short; put limits in a hint.
- Announce results (e.g. "Додано 2 файли, 1 відхилено") with a `role="status"` region - the
  consumer owns the list.
- Drops outside the zone navigate to the file in most browsers; apps that rely on dropping can
  prevent that at the document level.

## Component tokens

`--vd-dropzone-padding`, `--vd-dropzone-radius`, `--vd-dropzone-border`, `--vd-dropzone-bg`,
`--vd-dropzone-border-active`, `--vd-dropzone-bg-active`.

## Adapter notes

Angular: attribute directive with outputs. React/Vue: same markup; `onFiles`/`onReject`
callbacks around `vdCheckFiles`.
