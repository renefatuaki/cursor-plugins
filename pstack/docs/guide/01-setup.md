# Set up pstack

In this page you install the plugin, pick which models pstack uses, and run your first task. Setup is one command plus a short conversation.

## Install the plugin

pstack expects the latest Claude Code. In a Claude Code session, run:

```text
/plugin marketplace add openai/codex-plugin-cc
/plugin marketplace add renefatuaki/cursor-plugins
/plugin install pstack@cursor-plugins
/codex:setup
```

Claude Code confirms the plugin is installed. Installing pstack also installs `team-kit`, Anthropic's `skill-creator`, and OpenAI's `codex` plugin, which adds a second model family to the review panels. The Codex marketplace comes first so that dependency resolves. `/codex:setup` signs you in to Codex. Skills run as `/pstack:<skill>`, or the bare `/<skill>` when no other command uses that name.

## Pick your models

Run:

```text
/setup-pstack
```

[`/setup-pstack`](../../skills/setup-pstack/SKILL.md) shows what your Codex config runs by default, asks for a reasoning budget, shows you each role (code delegates, judgment, the review panels), and asks what you want. Answer the questions. It writes `~/.claude/rules/pstack-models.md`, a small rule Claude Code loads into every session and every pstack skill reads.

Each role holds `<model>/<effort>`, such as `opus/xhigh`. The defaults are `sonnet/high` for code roles, `opus/xhigh` for judgment and prose, and `fable/xhigh` for the hardest tasks. The review panels default to `opus/xhigh, codex/xhigh`. A Codex entry sets Codex's reasoning effort and can name a Codex model, as in `codex:gpt-6-astra/high`. A bare `codex` uses whatever `~/.codex/config.toml` sets. If a Codex run fails, its slot falls back to `sonnet`, and the panel runs single-family. The defaults match the `large` budget. `unlimited` moves every effort one step up, so `opus/xhigh` becomes `opus/max`. `medium` moves one step down and `small` two, which spends fewer tokens. Codex efforts top out at `xhigh`.

You only override what you care about. A role with no line in the rule keeps the skill's default. To restore a default, delete that role's line. A rerun of `/setup-pstack` keeps any role whose model differs from the default. When a default changes, a rule written before the change still pins the old default, so delete those role lines, or delete the file, then run `/setup-pstack` again.

You might be wondering how to run a role on your session's own model. Set it to `inherit` and pstack omits the subagent `model` and `effort`, so the subagent runs on the parent session's model. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size. Setup also configures `swarm workers`, the default model for every `/swarm` worker unless a race names a model for each arm.

## Accept the verification offer, or don't

At the end of setup, `/setup-pstack` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `.claude/skills/verify-<app>/`, a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

If you're new to pstack, say yes. An agent that can check its own work keeps going until the check passes. An agent that can't hands every result back to you to check by hand. Of everything in this guide, the verification skill pays off the most.

After setup, start a new session. The model rule applies to new sessions.

## Keep the cost in check

pstack spends extra tokens on subagents and review panels. That's the price of the rigor. To spend fewer:

- Rerun `/setup-pstack` and pick a smaller reasoning budget or cheaper models. A strong model in the main session with cheaper, faster models in the code roles is a good split.
- Set a role to `inherit` so it runs on the session's own model.
- Shorten a panel list. Each entry runs one subagent.
- Save `/poteto-mode` for work that needs rigor. A small, obvious edit doesn't.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/poteto-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. You invoke `/poteto-mode` once, and it stays on for the rest of the session. It applies itself when a playbook matches or the task needs rigor, and stays out of the way on casual turns. Say so to opt out.

Next: [Route work through `/poteto-mode`](./02-poteto-mode.md).
