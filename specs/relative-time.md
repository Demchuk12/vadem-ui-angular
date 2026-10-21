# Relative time

Status: stable · Pattern: native time, passive localized text.

## API and input contract

`vdFormatRelativeTime(value, now, options?)` accepts epoch milliseconds (number/null/undefined).
Both timestamps must be finite safe integers within Gregorian years 0001–9999. No strings,
implicit date parsing, browser time zone or Date.now fallback. Invalid value/reference returns
unknownText. Explicit reference time makes server rendering and client hydration deterministic.
Options: locale (default en), justNowText (Just now), unknownText (Unknown time).
Malformed locale falls back to English. Locale selects Intl unit grammar; just-now/unknown
copy stays independently configurable (the pure function defaults to English copy).

Zero difference and elapsed past time below 5 seconds use justNowText. Future values never
use past-tense just-now copy. Otherwise use Intl.RelativeTimeFormat with numeric=always,
style=long and whole units truncated toward zero, with magnitude at least one. Choose units
by absolute elapsed duration: second below 60 seconds; minute below 60 minutes; hour below
24 hours; day below 7 days; week below 30 days; month below 365 days; year thereafter.
A month is 30 days and a year 365 days. These are approximate elapsed durations, not calendar
boundaries, scheduling, deadlines or DST-aware date arithmetic. No early rounded promotion.

## Anatomy, props and states

`<time vdRelativeTime [vdRelativeTime]="timestamp" [now]="reference">` owns plain bdi text.
Its class is vd-relative-time. Inputs: vdRelativeTime (timestamp), now (required timestamp),
locale (default VD_LOCALE.code), justNowText and unknownText (locale:relativeTime entries).
The adapter derives UTC ISO datetime from a valid value, removing it for invalid values.
An invalid reference makes text unknown but retains valid source datetime. Consumer datetime
and projected content must not be supplied: this component owns both. data-state is valid or
unknown according to both timestamp inputs. No events, slots, interaction or loading state.

## Keyboard and accessibility

Native passive time semantics; no tabindex, ARIA role, live region or automatic focus change.
Bdi isolates localized text in mixed-direction content. Updating now updates text quietly.
Consumer can show the exact date visibly nearby; datetime is machine-readable metadata, not a
replacement for visible precision when users need it. No reliance on a hover tooltip.
There is no custom motion, CSS or token surface; color and typography inherit from the parent.

## Adapter notes

Export VdRelativeTime, VdRelativeTimePipe (vdRelativeTime), vdFormatRelativeTime and
VdRelativeTimeOptions from `@vadem/ui/relative-time`. Pipe signature:
`value | vdRelativeTime:now:locale:justNowText:unknownText`.
The pipe is pure; consumers change the reference timestamp to refresh. The native component
uses signals/OnPush/None and coexists with vdTimelineTime without changing Timeline's contract.
No timers, clock service, subscriptions, document listeners or browser globals. Do not mutate
Date instances; pass epoch numbers. Server/client must share reference and Intl locale data.
