# Issue Flow v1.0

## 1. Overview

Issue Flowは、GitHub Issueを入力として受け取り、
計画・実装・検証・レビュー・Git操作・Pull Request作成までを
自律的に実行する開発ワークフローである。

Pull RequestのMergeは自動化対象に含めず、
最終判断は人間が行う。

基本フロー:

Issue
↓
Working Tree Safety Check
↓
Planner
↓
Planning Gate
↓
Base Branch Synchronization
↓
Issue Branch
↓
Executor
↓
Verifier
↓
Reviewer
↓
Stage
↓
Commit
↓
Push
↓
Pull Request
↓
Human Merge


## 2. Components

### issue-flow

ワークフロー全体を制御するOrchestrator。

各Skillの実行順序、状態遷移、Git操作、安全停止、
Pull Request作成を管理する。

### planner

IssueのRequirementsおよびAcceptance Criteriaを解析し、
Implementation Planを作成する。

実装は行わない。

### executor

Implementation Planに基づいてコードを変更する。

以下の実行モードを持つ。

- Initial Implementation
- Verification Fix
- Review Fix

最終的な検証・レビュー・Git操作は行わない。

### verifier

実装結果がRequirementsおよびAcceptance Criteriaを
満たしているか検証する。

必要に応じて実コマンドおよびPlaywright MCPを使用する。

判定:

- PASS
- FAIL
- NOT VERIFIED

### reviewer

VerifierがPASSした実装について、
コード品質・保守性・安全性・Scopeをレビューする。

判定:

- APPROVED
- CHANGES_REQUESTED
- BLOCKED


## 3. Planning Gate

PlannerがImplementation Planを作成した後、
実装可能な仕様として確定しているか確認する。

以下の場合はPlanning Gateを通過しない。

- Requirements間の矛盾
- Acceptance Criteria間の矛盾
- 実装方針を決定できない重大な曖昧さ
- Issueの要求変更を必要とする問題
- 人間による仕様判断が必要な問題

この場合、Issue Flow自身が仕様を推測してはならない。

Result:

WAITING_FOR_CLARIFICATION

Workflow Status:

BLOCKED

人間による仕様確定後、Plannerから再開する。


## 4. Working Tree Safety

Issue処理開始時にWorking Treeを確認する。

既存の変更が存在する場合、
Issue Flowは処理を開始してはならない。

禁止される自動処理:

- stash
- reset
- clean
- 既存変更のcommit
- branch切り替え
- Base Branch同期
- Issue実装

既存の人間作業を保護した状態でBLOCKEDとして終了する。


## 5. Git Safety

危険なGit操作は自動実行しない。

禁止対象:

- git reset --hard
- git push --force
- git push -f
- git clean -f
- git clean -fd
- git rebase
- git add .
- git add -A
- git add --all

Stageでは変更対象ファイルを明示する。

例:

git add index.html


## 6. Verification Loop

Executor
↓
Verifier
├─ PASS
│   ↓
│ Reviewer
│
└─ FAIL
    ↓
Verification Fix
    ↓
Verifier

VerifierがFAILした場合、
Verification ReportをExecutorへ渡して修正する。

修正後は必ず再検証する。


## 7. Review Loop

Reviewer
├─ APPROVED
│   ↓
│ Git / PR
│
└─ CHANGES_REQUESTED
    ↓
Review Fix
    ↓
Verifier
    ↓
Reviewer

Reviewerの修正後は、
直接APPROVED扱いにせずVerifierによる再検証を行う。


## 8. Browser Verification

ブラウザ検証にはPlaywright MCPを使用する。

開発サーバーの起動方法およびURLは
`.agents/automation.md` をSingle Source of Truthとする。

Start CommandおよびURLは `.agents/automation.md` の値を使用する。
現在の構成は `pwsh -File scripts/serve.ps1`、
`http://127.0.0.1:8080/`。

このリポジトリには `package.json` がないため、npmコマンドを実行しない。
Build、Lint、Testの正式なコマンドが設定されていない場合は、
設定済みの静的・ブラウザ検証を行い、未設定項目を未実施として報告する。

検証完了後はIssue Flowが起動した開発サーバーを停止する。


## 9. Pull Request

Verifier PASSおよびReviewer APPROVED後にのみ
Pull Requestを作成する。

Pull RequestにはIssueとの関連付けを含める。

例:

Closes #123

Pull RequestのMergeは自動実行しない。

禁止対象:

- gh pr merge
- gh pr close
- gh issue close

Merge判断は人間が行う。


## 10. Result Model

### COMPLETE

正常にPull Request作成まで完了した。

### BLOCKED

Git状態、権限、外部依存などにより
Workflowを安全に継続できない。

### FAILED

Workflowが回復不能な失敗で終了した。

### WAITING_FOR_CLARIFICATION

RequirementsまたはAcceptance Criteriaに
重大な曖昧さ・矛盾があり、人間の判断を待っている。


## 11. Workflow Status

Workflow Statusは以下のいずれかとする。

- COMPLETE
- BLOCKED
- FAILED

仕様確認待ちの場合:

Result: WAITING_FOR_CLARIFICATION
Workflow Status: BLOCKED
Automation Blocked: Yes
Human Action Required: Yes


## 12. Verified Scenarios

v1.0では以下のE2Eシナリオを実証済み。

| Scenario | Result |
|---|---|
| Happy Path | PASS |
| Verifier FAIL → Verification Fix | PASS |
| Reviewer CHANGES_REQUESTED → Review Fix | PASS |
| Dirty Working Tree Safety | PASS |
| Contradictory Requirements | PASS |
| Playwright Browser Verification | PASS |
| Explicit Git Staging | PASS |
| Automatic PR Creation | PASS |
| Automatic Merge Prevention | PASS |


## 13. Human Responsibility

Issue Flowが自動化する範囲:

Issue
→ Planning
→ Implementation
→ Verification
→ Review
→ Commit
→ Push
→ Pull Request

人間が担当する範囲:

Specification Clarification
→ Pull Request Final Review
→ Merge
