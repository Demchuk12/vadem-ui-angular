# Design workflow

The user authorized connecting design skills and continuing Claude's existing work on
2026-10-07. Use the existing library as the starting point. Apply this routing when a concrete
visual task is requested; this document does not select a new component or start the roadmap.

## Instruction priority

Current user instructions take precedence, followed by `PROJECT_BRIEF.md`, shared project
rules in `CLAUDE.md` and `AGENTS.md`, then skill procedures. Historical decisions explain
existing work; they do not approve conflicting changes. Preserve the established identity.

## Approved skill routing

| Skill                  | When to read and apply                                                        | Source                                                      |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `frontend-skill`       | Composition, hierarchy, spacing, useful copy, and restrained app/demo design  | Codex skill catalog (resolve from the current session)      |
| `frontend-design`      | Direction and composition for a requested new surface or substantive redesign | [SKILL.md](../.claude/skills/frontend-design/SKILL.md)      |
| `impeccable`           | Focused design audit, UX critique, responsive refinement, or final polish     | [SKILL.md](../.claude/skills/impeccable/SKILL.md)           |
| `vd-design-principles` | Every component, screen, or token visual change                               | [SKILL.md](../.claude/skills/vd-design-principles/SKILL.md) |
| `vd-design-review`     | Screenshot critique and iteration after visual changes                        | [SKILL.md](../.claude/skills/vd-design-review/SKILL.md)     |
| `vd-a11y-check`        | Interactive behavior, focus, ARIA, contrast, and completion checks            | [SKILL.md](../.claude/skills/vd-a11y-check/SKILL.md)        |
| `vd-tokens`            | Adding or changing design tokens                                              | [SKILL.md](../.claude/skills/vd-tokens/SKILL.md)            |
| `vd-component-spec`    | Component API, states, keyboard, or markup contract changes                   | [SKILL.md](../.claude/skills/vd-component-spec/SKILL.md)    |
| `vd-new-component`     | A requested new component implemented end to end                              | [SKILL.md](../.claude/skills/vd-new-component/SKILL.md)     |

Read these files explicitly when applicable; `.claude/skills/` is not automatically loaded
by Codex. Resolve `frontend-skill` from the current session catalog if its local path changes.
Announce skill use when first applying it in a conversation. The user approved adding
Impeccable and Anthropic frontend-design on 2026-10-07. Their pinned sources, licenses and
verification manifest are recorded in [DESIGN_SKILL_SOURCES.md](DESIGN_SKILL_SOURCES.md).
Select the relevant general design skill rather than loading all overlapping skills for a
small control edit. Vadem's component, token and accessibility procedures remain applicable.

## Applying frontend guidance to Vadem

- Use the app guidance for galleries, settings, dashboards, and other working surfaces.
  Organize around the user's task; use clear labels and purposeful information density.
- Start with hierarchy, alignment, typography, and whitespace. Use cards where grouping or
  interaction requires them, including demonstrations of the existing Card component.
- Retain Manrope, JetBrains Mono, the existing token architecture, and reusable components.
  Improve shared styles through tokens rather than isolated decorative overrides.
- Landing-page hero, photography, and storytelling guidance applies only to a requested
  marketing surface. A component gallery does not need a hero or imagery to satisfy a skill.
- Use existing CSS motion tokens and native behavior. Do not add Framer Motion or introduce
  a motion quota. Motion must support interaction and respect reduced-motion requirements.
- Propose token scale and signature changes before implementing them. Skill routing does not
  resolve the historical icon/signature/reduced-motion differences recorded in the brief.

## External skill boundaries

- Keep upstream skill files unchanged; apply Vadem-specific constraints here. Their generic
  typeface, hex palette, decorative eyebrow and new token-system suggestions do not replace
  Manrope, JetBrains Mono, OKLCH tokens, or the existing identity. Interpret a design plan as
  reuse of the current system; propose any scale or signature change separately.
- For Impeccable, read the requested command's playbook; read `reference/craft-floor.md`
  immediately before a UI edit. Prefer Operate for working screens and Read for documentation;
  choose the gallery's mode from the actual requested task. Refinement preserves existing
  identity, behavior and factual copy outside the requested scope.
- Impeccable's bundled launcher can download a standalone executable. Installing the skill
  instructions does not approve running or installing that helper, hooks, pinned shortcuts,
  browser bridges, or replacement PRODUCT/DESIGN files. Review and obtain approval if extra
  tooling is needed. While the launcher is unavailable under this boundary, announce that
  context loading did not run, then read `PROJECT_BRIEF.md`, `CLAUDE.md`, this workflow and the
  relevant specs directly. Do not invent missing context or block a permitted design task.
- Skill instructions do not independently authorize agent delegation or external service
  calls. Follow the current session's authorization requirements. Installation does not invoke
  a design command, a critique, or a UI migration.
- Codex reads these project-local files explicitly. They are available for that routing on
  the next turn; catalog discovery depends on the runtime and may require a new session.

## Small-step review loop

1. Inspect the relevant implementation, spec, tokens, and historical decisions. Define the
   concrete visual or usability problem and the scope of the requested change.
2. For screen composition, state a brief visual direction, content hierarchy, and interaction
   purpose. Reuse existing controls and preserve their accessibility contracts.
3. Implement a focused change with the applicable component and token procedures.
4. Build the library/demo as appropriate and run the demo. Check actual dark/light screenshots,
   realistic Ukrainian and long/short content, narrow layouts, and RTL. For interaction changes,
   exercise keyboard behavior and applicable axe, reduced-motion, and forced-colors checks.
5. Apply `vd-design-review`: critique hierarchy, grayscale/squint views, consistency, and both
   themes; fix concrete issues and inspect new screenshots after those fixes.
6. Report the change and the checks actually run. Distinguish source inspection, automated
   results, and observed browser behavior. Record non-obvious choices in `DECISIONS.md`.
