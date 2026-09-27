# Antigravity CLI Permission Observations

この台帳は、Issue Flowの実行中にAntigravity CLIが表示した権限確認を記録する。
記録は観測事実と判断を分け、許可リストを自動変更する根拠にはしない。

## Observed prompts

| Date | Command | Workflow step / reason | Observation source | Outcome | Assessment |
|---|---|---|---|---|---|
| 2026-09-27 | `npm run build` | Build verification | User-provided permission prompt screenshot | Approval choice not visible | `.agents/automation.md` now marks Build as `Not configured.` and this repository has no `package.json`; compliant runs should not invoke it. Do not add an allow rule. |
| 2026-09-27 | `Test-NetConnection -ComputerName 127.0.0.1 -Port 8080` | Check whether the configured local development server is reachable | User-provided permission prompt screenshot | Approval choice not visible | Do not add a permission rule. Verifier will use browser navigation to the configured URL as its readiness check, avoiding a separate shell port probe. |
| 2026-09-27 | `git add index.html` | Stage the explicitly reviewed Issue #31 file | User-provided permission prompt screenshot and follow-up confirmation | Allowed once by user; narrow project-scoped rule added afterward | This is an explicit single-file staging command and matches the Issue Flow rule. The Project allow rule now permits one explicit repository file path per command; bulk-stage flags, wildcard pathspecs, and parent traversal do not match. |
| 2026-09-27 | `git add docs/ANTIGRAVITY_PERMISSION_LOG.md` | Stage the permission-observation log | User-provided permission prompt screenshot | Approval choice not visible | This is a single explicit repository path covered by the Project `git add` allow rule. The screenshot does not show the user's choice or whether the active CLI session had reloaded the updated Project permissions. |
| 2026-09-27 | `git add AGENTS.md` | Stage the project-level agent instructions | User-provided permission prompt screenshot | Approval choice not visible | This is a single explicit repository path covered by the Project `git add` allow rule. The screenshot does not show the user's choice or whether the active CLI session had reloaded the updated Project permissions. |
| 2026-09-27 | `git add .agents/skills/verifier/SKILL.md` | Stage the Verifier workflow instructions | User-provided permission prompt screenshot | Approval choice not visible | This is a single explicit repository path covered by the Project `git add` allow rule. The screenshot does not show the user's choice or whether the active CLI session had reloaded the updated Project permissions. |
| 2026-09-27 | `git add docs/ANTIGRAVITY_PERMISSION_LOG.md` | Stage the updated permission-observation log | User-provided permission prompt screenshot | Approval choice not visible; same command prompted again | This repeated prompt suggests the current CLI session may not have loaded the updated Project rule, or that its regex did not match Antigravity's parsed command. The rule must be checked against the live permission configuration before relying on it. |
| 2026-09-27 | `npm run lint` | Lint verification during Verifier step | Antigravity CLI permission prompt | Denied by user | `.agents/automation.md` marks Lint as `Not configured.` and this repository has no `package.json`; compliant runs should not invoke it. Do not add an allow rule. |

## Recording procedure

For each new permission prompt during an Issue Flow run, append one row with:

- Date and exact command as shown by Antigravity.
- Workflow step and why the operation is needed.
- Whether it was a one-time, conversation-scoped, persistent, or denied action, if known.
- Whether the operation succeeded, based on observed state rather than exit code alone.
- Whether the same command was prompted for again during that run.
- A short assessment of whether the command is required, can be replaced, or should remain denied.

Default permission choice: allow the command once only. Do not select conversation-scoped or persistent allow unless the user explicitly changes this preference. The approval choice does not change the recorded observation of whether the command was prompted.

The user later requested an Issue-to-Pull-Request workflow without approval prompts. After recording observed commands, narrowly scoped Project-level allow/deny rules may be added for commands that the workflow requires or must suppress. Do not use global grants or blanket command access.

## Current Project permission changes

- Allow `git add` for one explicit file path under the repository's existing files/directories. The rule does not match bulk-stage options or `.`/`..` path components.
- Deny `npm run build`, `npm run lint`, and `npm test`; these are not configured in this repository.
- Deny `Test-NetConnection`; browser navigation to the configured development URL is the readiness check.
- Keep the existing denies for force-push, destructive Git commands, and PR merge/close.

Do not record secrets, tokens, or unrelated command output. When the outcome is unknown, state that it is unknown rather than infer approval.

## Allowlist review rule

Do not broaden permissions in response to a single prompt. First check whether the operation follows the repository's `.agents/automation.md` and the Issue Flow skill. Exclude stale or unconfigured commands. After observations from a complete workflow run are available, recommend the narrowest useful project-scoped allow rules, while retaining the deny rules for destructive Git operations and PR merging.
