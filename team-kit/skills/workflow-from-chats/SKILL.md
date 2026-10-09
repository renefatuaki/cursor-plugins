---
name: workflow-from-chats
description: Extract durable working preferences from recent Claude Code sessions and convert them into skills, CLAUDE.md or `.claude/rules/` instructions, hooks, or workflow docs. Use when asked to learn preferences, mine feedback, personalize workflows, or generate team/person-specific agent guidance.
---

# Workflow From Chats

Infer durable working preferences from recent chats. Do not summarize chats; extract reusable workflow guidance.

## Scope

- Default to the last 7 days unless the user asks for a different window.
- Read parent transcripts and relevant subagent transcripts. Claude Code stores them as JSONL under `~/.claude/projects/<project>/`: parent sessions are `<session-id>.jsonl`, and subagent transcripts are `<session-id>/subagents/agent-<id>.jsonl`. `<project>` is the working directory with every non-alphanumeric character replaced by `-` (so `/Users/you/proj` becomes `-Users-you-proj`). Use file mtimes for the time window. The record format is internal and changes between versions, so parse defensively and skip records you cannot read.
- Stay inside the current project's directory unless the user asks for a cross-project review.
- Use subagent content as evidence, but cite only parent conversations.
- Do not expose local transcript paths, secrets, customer data, private chat content, or credentials.

## Workflow

1. State the target workflow or preference surface in one paragraph.
2. Build an internal transcript inventory: title/topic, parent conversation ID, approximate date, completion state, relevant subagents, and why it may contain preference evidence.
3. Scan for explicit preferences, corrections, and workflow markers such as "I prefer", "always", "never", "not what I asked", "stop", "review", "PR", "CI", "logs", and "skill".
4. Extract preference atoms: trigger, workflow step, decision rule, quality bar, stop condition, evidence, and confidence.
5. Rate confidence as strong, medium, weak, or contradicted.
6. Cluster by workflow shape rather than transcript: shipping, review, simplification, debugging, capture, communication, delegation, or validation.
7. Choose the artifact: new skill, skill edit, CLAUDE.md or `.claude/rules/` instruction, hook, workflow doc, or no artifact.
8. Draft only the reusable guidance. Filter anecdotes that will not help future tasks.

## Confidence

- Strong: explicit user preference, workflow-changing correction, repeated parent-chat pattern, or direct request to encode behavior.
- Medium: accepted workflow, repeated tool/model/validation preference, or subagent consensus that the parent used successfully.
- Weak: agent-chosen behavior with no user feedback, one ambiguous transcript, or a likely task-specific correction.
- Contradicted: evidence points in incompatible directions; ask the user before writing files.

## Artifact Choice

- Skill: recurring multi-step workflow with clear triggers.
- CLAUDE.md or `.claude/rules/` instruction: general behavior that should apply broadly. Use a `paths:` rule when it only applies to certain files.
- Hook: a check that must run every time, regardless of what the model remembers.
- Workflow doc: useful context that is not reliably triggerable.
- No artifact: situational, stale, or low-confidence observation.

## Output

Return a concise synthesis first:

- Target workflow.
- Evidence corpus with parent conversation citations only.
- Preference profile.
- Adopt, consider, dismissed.
- Proposed artifacts.
- Open questions only if they block writing.
