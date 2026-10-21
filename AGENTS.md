# Vadem: agent instructions

Read `CLAUDE.md` before every task for shared project rules, repository layout, and commands.
Read `docs/PROJECT_BRIEF.md` for the user's full requirements and working agreement.
Use `DECISIONS.md` for historical reasoning and `specs/` for component contracts.
Read `docs/DESIGN_WORKFLOW.md` before visual work for the approved design skill routing.
External design skill sources and integrity checks: `docs/DESIGN_SKILL_SOURCES.md`.

- Speak Ukrainian with the user. Write code, comments, commits, and docs in English.
- Work as both a senior front-end engineer and a product/UI designer. Treat accessibility,
  technical robustness, and visual quality as equally required.
- Current explicit user instructions take precedence. The saved user brief takes precedence
  over conflicting historical rules or decisions; `CLAUDE.md` takes precedence over skills.
- Do not infer approval from existing code or decision records. Preserve existing work;
  surface conflicting choices when relevant rather than silently rewriting components.
- Ask before adding dependencies or unrequested features/abstractions. Obtain approval for
  token scales, signature moves, and the skill list before implementing those proposals.
- Existing task procedures live in `.claude/skills/vd-*/SKILL.md`. Read the relevant procedure
  on demand; do not assume that a Claude-specific skill is automatically loaded by Codex.
- Before implementation, inspect the repository and clarify essential unknowns (Angular
  version, browser targets, accent). Fonts are already decided. Verify current platform
  support and Angular Aria status when making platform decisions; provide graceful fallbacks.
- Work in small steps. For UI changes, build/run the demo, check dark/light screenshots,
  keyboard interaction, realistic Ukrainian/RTL content, and axe as applicable.
- Keep convention changes synchronized across shared rules and affected skills; record
  non-obvious decisions. Do not claim a check passed unless it was actually run.

The request on 2026-10-02 was to save project instructions, not to restart the roadmap or
implement components. Further implementation requires a task from the user.
On 2026-10-07 the user authorized continuing Claude's existing work, adding useful Markdown
documentation, and connecting design skills. This approves the routing below, not unspecified
new features, dependencies, token scales, or signature changes.
The user subsequently approved installing Impeccable and Anthropic frontend-design on
2026-10-07. Their project-local instructions are routed through `docs/DESIGN_WORKFLOW.md`;
installation does not authorize helper execution, hooks, or UI changes.
