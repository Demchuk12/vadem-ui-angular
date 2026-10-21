# Form error summary

Status: stable · Pattern: named region, heading and native fragment links.

## Anatomy

```html
<vd-form-error-summary
  class="vd-form-error-summary"
  role="region"
  tabindex="-1"
  aria-labelledby="summary-title"
  aria-describedby="summary-description"
>
  <h2 class="vd-form-error-summary__title" id="summary-title">
    <svg aria-hidden="true"></svg><span>Check the form</span>
  </h2>
  <p id="summary-description">Correct the following fields before continuing.</p>
  <ul class="vd-form-error-summary__list" role="list">
    <li><a href="#contact-email">Enter an email address.</a></li>
  </ul>
</vd-form-error-summary>
```

## Props

| Name        | Type                                                  | Default                              | Notes                                                                          |
| ----------- | ----------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| errors      | readonly array of { target: string, message: string } | empty                                | Consumer-owned ordered errors; target is a raw field ID, not a selector or URL |
| title       | string                                                | locale: formErrorSummary.title       | Visible h2 and region name                                                     |
| description | string                                                | locale: formErrorSummary.description | Instructions; empty string omits the paragraph/description association         |

## Methods and events

`focus()` requests focus on the summary after the next render if errors remain. The consumer
calls it after a failed submit, including when the errors have just been updated. The next
animation frame aligns the summary's start instantly after layout anchoring, only while focus
still belongs to the summary. Consumers with sticky headers set scroll-margin-block-start. There is no
autofocus on creation or input changes, and no document-level form interception or events.

## Content and states

All messages are plain text. The summary preserves order and duplicates (multiple errors may
refer to the same field). Messages should match the inline Field error. Empty errors hide the
host and remove its content, role, associations and tabindex; there is no empty-state alert.
Nonempty errors render a named region with a danger border, title/icon and underlined links.
Hover and focus-visible retain link affordance; an explicitly focused summary has an outline.
No loading, dismissible or disabled variant is needed for this navigation surface.

The consumer owns validation, submit timing, errors, page title and field visibility. This
works independently of any form library. It neither marks controls invalid nor discovers
errors. Keep visible inline errors with the same wording and use unique, stable field IDs.

## Keyboard and navigation

| Action                                                 | Behavior                                                                                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Failed submit                                          | Consumer sets errors, then calls focus(); summary is programmatically focusable, outside normal Tab order |
| Tab / Shift+Tab                                        | Native sequence through links and onward to the form; no trap or roving focus                             |
| Enter / ordinary click on error link                   | Focus its visible, enabled field in the same document without changing hash/history                       |
| Modified / middle click                                | Native fragment-link behavior                                                                             |
| Missing, hidden, inert, disabled or unfocusable target | Keep focus on the link; do not redirect to another control or mutate the document                         |
| Updates while editing                                  | No automatic focus movement or live announcements                                                         |

Targets are actual focusable controls (or application-owned tabindex=-1 targets). For groups,
link to the first invalid control; do not target an unfocusable Field wrapper. Reveal hidden
panels before supplying their targets. Only an ordinary unmodified primary activation is
intercepted; encoded native fragment hrefs remain usable without custom key handling.

## ARIA contract

A region labelled by its h2, optionally described by instructions. Native list/link semantics;
role=list preserves list semantics with the CSS reset. The icon is decorative. There is no
role=alert or live region: explicit focus on failed submission conveys context without
announcing the entire list again on each keystroke. Inline Field owns input aria-invalid and
aria-describedby. Heading remains h2; place it under the page/form's h1.

## Component tokens

`--vd-form-error-summary-bg` → color-danger-subtle; `border` → color-danger-border;
`fg` → color-text; `accent` → color-danger-text; `padding` → space-4;
`gap` → space-3; `radius` → radius-lg; `title-size` → text-base.
Inline padding is capped at 5% of the container to preserve room at narrow widths. The title
wraps below its icon when necessary. Existing focus tokens supply outlines. Logical spacing and wrapping support Ukrainian/RTL,
320px and enlarged text. Forced colors retains native border/text/outline; no added motion.

## Adapter notes

Angular: `VdFormErrorSummary`, `VdFormError` from `@vadem/ui/form-error-summary`.
Input errors are controlled; strings resolve with vdTexts('formErrorSummary'). Use a view query
and call focus() in the submit handler after updating errors. DOM access is scoped to the
host's ownerDocument. Scheduled focus is after-render and cancelled on destruction; no global
window/document, custom CVA, dependency or form-engine integration is added.
