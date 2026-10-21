# External design skill sources

The user approved these two project-local skills on 2026-10-07. They were installed with
the Codex `skill-installer` helper using explicit revisions and `.claude/skills` as the
destination. Supporting references and scripts are retained as upstream source, not executed
as part of installation. No runtime dependency was added.

| Skill                     | Repository                                                                                                | Revision                                   | Upstream path               | Local path                                             | License                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Impeccable 4.5.0          | [pbakaus/impeccable](https://github.com/pbakaus/impeccable/tree/ffeda44b00b1e39bd901621dcd3a7e44ba184ce1) | `ffeda44b00b1e39bd901621dcd3a7e44ba184ce1` | `.agents/skills/impeccable` | [SKILL.md](../.claude/skills/impeccable/SKILL.md)      | [Apache-2.0](../.claude/skills/impeccable/LICENSE), [notice](../.claude/skills/impeccable/NOTICE.md) |
| Anthropic frontend-design | [anthropics/skills](https://github.com/anthropics/skills/tree/683bc88e56f3e09ba94f7055977f3d3aa499f202)   | `683bc88e56f3e09ba94f7055977f3d3aa499f202` | `skills/frontend-design`    | [SKILL.md](../.claude/skills/frontend-design/SKILL.md) | [Apache-2.0](../.claude/skills/frontend-design/LICENSE.txt)                                          |

Impeccable's license and notice originate at its repository root and were preserved alongside
the installed skill. Anthropic's license is included in its skill subtree. Upstream contents
are unchanged; Vadem's overrides live in [DESIGN_WORKFLOW.md](DESIGN_WORKFLOW.md).

## Integrity and updates

Installation verification compares every installed upstream file against the pinned GitHub
archive, including the separately retained Impeccable license and notice. The resulting
[SHA-256 manifest](DESIGN_SKILL_CHECKSUMS.txt) covers both installed directories. From the
repository root, verify the local installation with:

```sh
sha256sum --check docs/DESIGN_SKILL_CHECKSUMS.txt
```

For an update, inspect upstream changes, licenses and compatibility with the project rules
first. Stage the proposed revision separately; do not overwrite an existing installation
blindly. Update this provenance, the manifest and affected routing together after the update
is authorized. Do not format vendored upstream files with the project's Prettier settings.

Codex explicitly reads these `.claude/skills/` files through the approved routing. Installation
does not imply automatic catalog loading. Extra CLI downloads, hooks and browser helpers
require separate review and approval; the existing project context remains authoritative.
