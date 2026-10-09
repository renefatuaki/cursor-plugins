# team-kit plugin

Internal-style workflows for CI, code review, shipping, and test reliability. The kit is designed to be plug and play without requiring third-party service integrations.

## Installation

Requires Claude Code. Add this repository as a marketplace, then install the plugin:

```text
/plugin marketplace add renefatuaki/cursor-plugins
/plugin install team-kit@cursor-plugins
```

Skills run as `/team-kit:<skill>` (or the bare `/<skill>` when no other command uses that name). `pstack` declares team-kit as a dependency, so installing pstack installs it too.

## Components

### Skills

| Skill | Description |
|:------|:------------|
| `loop-on-ci` | Watch CI runs and iterate on failures until checks pass |
| `review-and-ship` | Run a structured review, commit changes, and open a PR |
| `pr-review-canvas` | Generate an interactive HTML PR walkthrough with annotated, categorized diffs |
| `verify-this` | Prove or disprove claims with baseline/treatment artifacts and a clear verdict |
| `control-cli` | Build or adapt a local harness to drive and profile interactive CLIs or TUIs |
| `control-ui` | Build or adapt a local browser/CDP harness for web or Electron UIs |
| `make-pr-easy-to-review` | Clean noisy PR history, improve descriptions, and add reviewer guidance |
| `run-smoke-tests` | Run Playwright smoke tests and triage failures |
| `fix-ci` | Find failing CI jobs, inspect logs, and apply focused fixes |
| `new-branch-and-pr` | Create a fresh branch, complete work, and open a pull request |
| `get-pr-comments` | Fetch and summarize review comments from the active pull request |
| `check-compiler-errors` | Run compile and type-check commands and report failures |
| `what-did-i-get-done` | Summarize authored commits over a given time period into a concise status update |
| `weekly-review` | Generate a weekly recap of shipped work with bugfix/tech-debt/net-new highlights |
| `fix-merge-conflicts` | Resolve merge conflicts, validate build/tests, and summarize decisions |
| `deslop` | Remove AI-generated code slop and clean up code style |
| `workflow-from-chats` | Extract durable working preferences from Claude Code sessions into skills, CLAUDE.md rules, hooks, or docs |
| `thermo-nuclear-code-quality-review` | Run an unusually strict maintainability review (code-judo, 1k-line rule, spaghetti, boundaries) |

### Agents

| Agent | Description |
|:------|:------------|
| `ci-watcher` | Monitor GitHub Actions runs and return concise pass/fail summaries |
| `thermo-nuclear-code-quality-review` | Subagent (`team-kit:thermo-nuclear-code-quality-review`) that runs the thermo-nuclear code quality rubric against a diff |

### Coding-rule skills

These were always-applied Cursor rules. Claude Code plugins cannot ship always-on rules, so they are skills whose descriptions trigger them while editing matching code.

| Skill | Description |
|:-----|:------------|
| `typescript-exhaustive-switch` | Require exhaustive switch handling for unions/enums |
| `no-inline-imports` | Keep imports at module top-level for readability and consistency |

To make either one always-on for a project, copy its text into the project's `CLAUDE.md` or a file under `.claude/rules/`.

## License

MIT
