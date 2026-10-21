# File preview

Status: stable · Pattern: native modal dialog, image and PDF object.

## Props and events

| Name                                                                                              | Type             | Default                                  | Meaning                                                       |
| ------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------- | ------------------------------------------------------------- |
| open                                                                                              | boolean, two-way | false                                    | Open the modal                                                |
| file                                                                                              | Blob or null     | null                                     | Consumer-owned immutable source; use File for its native name |
| name                                                                                              | string           | locale: filePreview.title                | Overrides File.name and dialog name                           |
| alt                                                                                               | string           | resolved file name                       | Image description; supply meaningful content description      |
| titleText, closeLabel, downloadLabel, loadingText, errorText, emptyText, unsupportedText, pdfText | string           | corresponding filePreview locale entries | Override UI copy                                              |
| openChange                                                                                        | boolean          | —                                        | Modal state changes                                           |

No upload, fetch, remote URL, type override, editing, zoom, pagination or persistence API.
Images: image/png, image/jpeg, image/gif, image/webp, image/avif. PDF: application/pdf.
MIME type selects presentation; extensions never override it. SVG/HTML are download-only.
MIME is not malware validation: consumers remain responsible for accepted content and limits.

## Anatomy and states

`vd-file-preview` contains `dialog.vd-dialog.vd-file-preview__dialog`, a native heading,
close button, body and download footer. The body exposes data-state: empty, preparing,
loading, ready, error, unsupported or pdf. Closed dialogs contain no embedded file or link.
A browser-only object URL exists only while the modal is open with a file. Source changes,
close and destruction revoke it. Stale image events cannot overwrite a newer source state.

Image errors show a quiet message with the download action retained. PDF uses an object with
explicit application/pdf MIME and a resource URL generated exclusively from the provided
Blob, copied with PDF MIME. The PDF notice and download remain outside the object at all
times: PDF plugin availability, rendering success and document accessibility cannot be
reliably detected. `pdf` means offered to the browser, never verified loaded. Object fallback
also explains that the file can be downloaded. No live region claims PDF success.

## Keyboard and accessibility

Native Dialog supplies modal semantics, Tab containment, Escape/backdrop dismissal and
trigger focus restoration. Initial focus is the explicit close button, before embedded
content. A persistent close button and download link precede/follow the preview. Browser PDF
viewer keyboard behavior is browser-owned; a focused plugin may consume Escape. Use the
close action after leaving the viewer. No custom keyboard interception in the embedded file.
The named body region is a Tab stop for keyboard scrolling. The title is the dialog's accessible name; filenames use bdi and wrap without truncation.
Image alt is caller-authored or defaults to filename. Loading/error copy is a polite status;
no automatic focus is moved on file load. The download link uses the source filename and
native download semantics. Missing source has no download action.

The compact header keeps Close visible. The full filename is the heading in the scrollable body, so long names cannot consume the fixed header at enlarged text sizes.

## Component tokens

--vd-file-preview-bg → color-surface-sunken; --vd-file-preview-fg → color-text-muted;
--vd-file-preview-gap → space-4; --vd-file-preview-height → calc(space-24 * 5). Dialog and Button retain their own tokens.
No animation is added. Native object viewport may scroll; surrounding UI reflows at 320px/200%.

## Adapter notes

Angular uses signals, OnPush, afterRenderEffect and injected DOCUMENT for browser-owned URL
lifecycle. No URL globals during SSR; closed/SSR render has no source URL. Resource trust is
limited to an internally created PDF Blob URL, never a supplied string. No CDK/Aria dependency.

The scrollable body shows the current Blob.size through shared [File size](file-size.md) decimal
formatting in `.vd-file-preview__size`, with native bdi isolation. No file means no size metadata.
This is actual byte count, independent of MIME support, loading status or download availability.
