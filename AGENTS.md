# Project Instructions

## Skill Use

- For a GitHub Issue or a request to implement a change, use the `issue-flow` skill in `.agents/skills/issue-flow/SKILL.md` as the required workflow.
- The Issue Flow skill must use the `planner`, `executor`, `verifier`, and `reviewer` skills in their defined order. Read each skill before delegating its stage.
- Follow the project-specific commands and branch settings in `.agents/automation.md`. That file is the source of truth for repository automation settings.
- Do not substitute commands from another project or infer package scripts that are not present in this repository.

## Approval Boundary

- Do not ask the user to approve the plan, implementation, verification, commit, push, or Pull Request creation when the Issue Flow preconditions pass.
- Create the Pull Request after verification passes and review is approved. Do not merge it; the user makes the final merge decision.
- Stop only for the clarification, safety, authentication, or permission conditions listed in the Issue Flow skill.
- Repository instructions cannot grant operating-system, Codex, GitHub, or shell permissions. If the active runtime blocks a required operation, report the exact blocked operation and continue only after that permission is made available; never try to bypass the runtime control.
- In Antigravity CLI headless mode (`agy -p`), inspect permission notices on stderr. A denied action may not make the process exit nonzero; verify each required commit, push, and Pull Request against Git/GitHub state before reporting completion.

## Existing Work

- Preserve pre-existing user changes. Apply the Issue Flow dirty-working-tree rule before starting issue work; do not stash, reset, discard, or commit changes that are outside the current issue.
