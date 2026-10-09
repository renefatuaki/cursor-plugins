#!/bin/sh
# Emits this session's transcript location and the pstack plugin root as SessionStart context.
input=$(cat)
exec python3 -c '
import json, os, sys

try:
    data = json.loads(sys.argv[1] or "{}")
except ValueError:
    data = {}
root = os.environ.get("CLAUDE_PLUGIN_ROOT", "")
lines = [
    "pstack session: session_id=%s transcript_path=%s" % (data.get("session_id", "unknown"), data.get("transcript_path", "unknown")),
    "pstack root: %s. pstack skills are user-invocable only. When a pstack skill, playbook, or principle names another pstack skill (such as the **how** skill or principle-prove-it-works), read %s/skills/<name>/SKILL.md and follow it instead of calling the Skill tool. A principle such as **prove-it-works** lives in skills/principle-prove-it-works." % (root, root),
]
print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "\n".join(lines)}}))
' "$input"
