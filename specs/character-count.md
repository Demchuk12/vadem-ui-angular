# Character count

Status: stable · Pattern: descriptive text and a separate polite status.

## Anatomy

```html
<vd-character-count class="vd-character-count" data-state="within">
  <span class="vd-character-count__content" id="comment-count">
    <bdi class="vd-character-count__used" dir="ltr">12 / 200</bdi>
    <span class="vd-character-count__message">188 characters remaining.</span>
  </span>
  <span class="vd-visually-hidden" role="status" aria-atomic="true"></span>
</vd-character-count>
```

## Props

| Name          | Type                                   | Default                              | Notes                                                                                                  |
| ------------- | -------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| value         | string                                 | empty                                | Current bound text; no value mutation, DOM reading or form accessor                                    |
| maxLength     | number or null                         | null                                 | Advisory limit; finite nonnegative integers, fractions floor, other limits mean unlimited              |
| descriptionId | string                                 | generated                            | ID of the visible description, not the host; connect with Field.descriptionIds or aria-describedby     |
| controlId     | string or undefined                    | absent                               | Raw ID of the native input/textarea; enables announcements only while that editable control is focused |
| countText     | function(used, limit or null) → string | locale: characterCount.countText     | Used count; unlimited text includes units                                                              |
| remainingText | function(remaining) → string           | locale: characterCount.remainingText | Remaining allowance                                                                                    |
| overText      | function(excess) → string              | locale: characterCount.overText      | Explicit over-limit message                                                                            |
| limitText     | string                                 | locale: characterCount.limitText     | Exactly at the limit                                                                                   |

## Counting and validation

Counts UTF-16 units like native maxlength and Angular's maxLength validator: a supplementary
emoji counts as two; combining characters are not collapsed. No trimming, normalization or
truncation. Bind the actual form value. Native textarea value normalizes line endings; a
programmatic model containing CRLF is counted as provided. This is not a grapheme/word counter.

The limit is advisory. Users may paste a long answer and edit it down. The application owns
validation, error timing and submission. Add a matching validator to block submission, or
native maxlength if deliberate hard input restriction is required; the counter adds neither.
Reactive/Signal Forms remain native. No outputs, focus changes or key interception.

## States and content

| State       | Reflection           | Appearance                                                      |
| ----------- | -------------------- | --------------------------------------------------------------- |
| No limit    | data-state=unlimited | Used count only                                                 |
| Below limit | data-state=within    | Used count and remaining text                                   |
| Exact limit | data-state=limit     | Used count and explicit limit text                              |
| Above limit | data-state=over      | Used count, decorative error icon and excess text; danger color |

Empty text is counted as zero; zero is a valid limit. Disabled/readonly controls keep their
visible count, with no announcements. Counts wrap and use tabular digits. Limited used/maximum numbers are LTR-isolated so RTL
does not visually reverse the fraction; unlimited localized text uses auto direction. Messages are plain
text, defaulting to the English/Ukrainian pack; no progress meter, warning threshold or motion.

## ARIA and keyboard

Counter is not a tab stop or form control. Native input/textarea keyboard, IME, selection,
clipboard, undo and focus are left to the platform/form binding. Use the committed form value
for IME buffering. The visible description has a stable ID and no live-region role. The hidden
polite atomic status is a sibling, outside that description, so it is not read twice on focus.

Initial render is silent. Updates are visually immediate and announced after 1000ms without
another value/limit/text update, only if controlId identifies the focused editable native
input/textarea both when scheduling and when publishing. Blur, readonly, disabled, missing targets or destruction suppress pending speech.
There are no focus or document event listeners. Unlinked/static counts do not announce.
This reduces speech frequency; automated DOM checks do not establish actual screen-reader speech.

Field gains optional descriptionIds (space-separated IDs). It appends/deduplicates these IDs
alongside its current hint or error ID; existing fields without this input are unchanged. The
counter's ID remains described when the hint is replaced by an error. Inline validation remains
Field's responsibility; over-limit color alone never marks the control invalid.

## Component tokens

`--vd-character-count-fg` → color-text-muted; `danger` → color-danger-text;
`font-size` → text-sm; `gap` → space-2. Logical wrapping supports Ukrainian/RTL and enlarged
text. Forced colors preserves excess text/icon; reduced motion has no animation to disable.

## Adapter notes

Angular: VdCharacterCount from `@vadem/ui/character-count`. Inputs are controlled, OnPush and
strings resolve through vdTexts('characterCount'). Rendering is SSR-safe; timers use the host's
ownerDocument.defaultView and are cleaned up by the effect. The consumer binds Field's
`[descriptionIds]="count.descriptionId()"` and the counter's `[value]` to its form value.
