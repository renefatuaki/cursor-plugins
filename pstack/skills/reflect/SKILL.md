---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

## When to invoke

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## Process

### 1. Locate the active transcript

The parent finds its own transcript file before fanning out. Use the `transcript_path` from the `pstack session:` line in your context. If that line is missing, follow the fallback in `${CLAUDE_PLUGIN_ROOT}/skills/poteto-mode/references/transcripts.md`. Do not read other directories under `~/.claude/projects/`. They hold private sessions from unrelated projects.

If no path resolves, write a tight digest of the session and pass that instead.

### 2. Spawn three reviewers in parallel

One message, three `Agent` calls, `subagent_type: "general-purpose"`, with `model` and `effort` set as below. Do not use `Explore`. Reviewers need full MCP access for context lookups (tickets, chat threads, observability traces referenced in the transcript), and their templates already forbid writes.

Each reviewer and the synthesizer name a model role and a default. Resolve the role per `${CLAUDE_PLUGIN_ROOT}/skills/poteto-mode/references/model-roles.md`.

| Lens | Role | Default | Prompt template |
|---|---|---|---|
| Judgment | `reflect judgment, divergent, synthesizer` | `opus/xhigh` | `references/judgment-reviewer.md` |
| Tooling | `reflect tooling` | `sonnet/high` | `references/tooling-reviewer.md` |
| Divergent | `reflect judgment, divergent, synthesizer` | `opus/xhigh` | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in their final message.

### 3. Synthesize

One `Agent` call, `subagent_type: "general-purpose"`, with the `reflect judgment, divergent, synthesizer` role (default `opus/xhigh`). The synthesizer's quality check includes spot-verifying citations, which can require MCP access, so do not use `Explore`. Use `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. The synthesizer returns a structured Accepted / Rejected / Backlog list.

### 4. Structural enforcement check

Sanity-check the synthesizer's Accepted list. For any item that would be enforced more reliably by a lint rule, script, metadata flag, or runtime check, move it from Accepted to Backlog. See the **encode-lessons-in-structure** principle skill.

### 5. Apply

Before applying any Accepted edit, present the synthesizer's full Accepted/Rejected/Backlog output to the user and wait for explicit approval. The user picks which subset to apply and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

Backlog items file to whatever devex / backlog tracker your team uses automatically. Only the Accepted list waits for approval.

For each approved Accepted item, follow the Routing field exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): parent does directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): hand to Anthropic's `skill-creator` skill (`skill-creator:skill-creator`, installed with pstack) and run its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): hand to `skill-creator` and run its description-optimization loop.
- `new skill via skill-creator: <kebab-name>`: hand creation to `skill-creator`. Do not invent the shape ad hoc.

Validate every touched plugin with `claude plugin validate <plugin-dir>` before declaring done. For a project or user skill outside a plugin, check that its frontmatter has `name` and `description` and that `/<name>` lists it.

### 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
