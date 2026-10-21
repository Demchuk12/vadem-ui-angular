# File upload list

Status: stable · Pattern: native named list, buttons and progress elements

Displays consumer-owned transfers. Composes with Dropzone; never sends requests, retains File
objects, validates files, schedules work or infers success from 100% progress.

## Anatomy and props

`ul.vd-upload-list[role=list]` contains keyed `li.vd-upload-list__item[data-state]` rows with a
filename in `bdi`, decorative icon, optional size/message, status, progress and native buttons.
The empty state is one explanatory list item. Long filenames wrap, retaining their extension.

| Prop     | Type                         | Default | Notes                                                                                                                            |
| -------- | ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| files    | readonly upload record array | []      | Unique stable string id, name, status; optional numeric size, preformatted sizeText, progress, message. Duplicate names allowed. |
| label    | string                       | Uploads | Accessible list name.                                                                                                            |
| labels   | localized labels object      | English | Five status names, cancel, retry, remove, empty. Action names include the filename.                                              |
| disabled | boolean                      | false   | Disables actions while preserving status information.                                                                            |

Statuses: queued, uploading, success, error, canceled. Uploading progress is clamped to 0..100;
finite values are rounded to whole percentages. Absent/null/non-finite values are indeterminate. Only explicit success means finished.

## Events and consumer responsibility

| Event      | Payload   | States                   |
| ---------- | --------- | ------------------------ |
| fileCancel | string id | queued, uploading        |
| fileRetry  | string id | error, canceled          |
| fileRemove | string id | success, error, canceled |

Events request actions without mutating records. Consumers own requests, cancellation, retry,
removal, stale callback protection and state updates. Disabled actions emit nothing.

## Keyboard and ARIA

- Native Tab order, Enter/Space activation. No custom keyboard map, trap or roving tabindex.
- Primary button identity survives cancel/retry changes. Removing a focused row focuses the
  next row, then the previous row at the end. Empty/disabled lists receive fallback focus.
  Other focused controls are not interrupted by external updates.
- The list has a name and explicit list role for engines that suppress unstyled list semantics.
- Native progress has a filename-specific name. Percentage updates are outside live regions.
- Each file has a polite status region including filename and optional message. Status names
  and icons convey completion/error without relying on color.
- The list has tabindex=-1 for recovery, without adding a normal Tab stop. Disabled controls,
  reduced motion, focus outlines and forced colors reuse Button/Progress behavior.

## Component tokens

--vd-upload-list-gap, --vd-upload-list-padding, --vd-upload-list-border, --vd-upload-list-fg,
--vd-upload-list-muted, --vd-upload-list-icon-size, --vd-upload-list-icon-bg,
--vd-upload-list-radius, --vd-upload-list-success, --vd-upload-list-error.
Button and Progress retain their own component tokens.

## Adapter notes

Angular: ul[vdUploadList] from @vadem/ui/upload-list, OnPush, controlled records and id-only
outputs. No forms accessor: this presents transfer state rather than a form value. Other
adapters reuse native markup/CSS; this simple presentation does not need a core engine.

```html
<ul
  vdUploadList
  label="Attachments"
  [files]="uploads()"
  (fileCancel)="cancelUpload($event)"
  (fileRetry)="retryUpload($event)"
  (fileRemove)="removeUpload($event)"
></ul>
```

For example, an uploading record is `{ id: 'contract', name: 'contract.pdf',
status: 'uploading', sizeText: '1.2 MB', progress: 38 }`. Store binary files/request handles
separately in the application, keyed by that id. Explicitly update the record after an
action; emitting an event alone does not cancel a request or change the visible state.

Numeric size uses shared File size decimal formatting. Nonempty sizeText overrides size; omitted
size is hidden, zero renders a real zero and explicit null renders localized unknown text.
See [File size](file-size.md).
