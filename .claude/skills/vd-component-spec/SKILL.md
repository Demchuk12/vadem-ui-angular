---
name: vd-component-spec
description: Use when creating or changing a Vadem component's public API, states, keyboard behavior, or ARIA - writes or updates the framework-agnostic spec in specs/<component>.md that future React/Vue adapters follow.
paths:
  - specs/**
---

# Vadem component spec

The spec describes the component independent of Angular. Write it in terms of attributes,
properties, events, and DOM, not decorators or signals. Update it in the same change as the code.

## Template (`specs/<component>.md`)

```md
# <Component>

Status: draft | stable · Pattern: <WAI-ARIA APG link or "native <element>">

## Anatomy
Rendered markup with classes and data attributes (the CSS contract).

## Props
| Name | Type | Default | Notes |

## Events
| Name | Payload | When |

## Slots / content
Named content areas and what they accept.

## States
Table of states -> data attributes / ARIA reflecting them
(default, hover, focus-visible, active, disabled, loading, invalid, empty...).

## Keyboard
| Key | Action |

## ARIA contract
Roles, required attributes, labelling, live regions, focus management.

## Component tokens
`--vd-<component>-*` with what they map to by default.

## Adapter notes
Anything framework-specific (forms integration, controlled/uncontrolled, SSR).
```

## Checklist

- [ ] Names follow shared conventions (`variant`, `size`, `disabled`, `invalid`, `loading`)
- [ ] Text props list the locale entry as their default (`locale: toast.closeLabel`), not a literal
- [ ] Every visual state maps to a `data-*` or ARIA attribute (CSS never depends on framework classes)
- [ ] Keyboard map matches the APG pattern (or native behavior is preserved)
- [ ] ARIA contract states who sets what (component vs consumer)
- [ ] Component tokens listed
- [ ] No Angular-specific terms outside "Adapter notes"
