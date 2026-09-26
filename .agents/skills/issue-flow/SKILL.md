---
name: issue-flow
description: GitHub Issueやユーザー要求を起点として、Planner・Executor・Verifier・Reviewerを統括し、計画、実装、検証、レビュー、Git操作、Pull Request作成までを自律的に進めるSkill。
---

# Issue Flow

## 役割

Issueまたはユーザー要求を受け取り、
Planner、Executor、Verifier、Reviewerを統括して
開発フロー全体を自律的に進める。

Issue Flow自身はコードを実装しない。

各工程を適切なSkillへ委譲し、
工程間の情報を引き継ぎ、
必要に応じて修正・再検証・再レビューを行う。

通常の実装判断では人間へ確認を求めない。

安全性、仕様、権限などの理由により
自律的な判断が適切でない場合のみ停止する。


# Workflow

基本フロー:

Issue
  ↓
Planner
  ↓
Implementation Plan
  ↓
Git Safety Check
  ↓
Issue Branch
  ↓
Executor
  ↓
Execution Report
  ↓
Verifier
  │
  ├─ FAIL
  │    ↓
  │  Executor
  │    ↓
  │  Verifier
  │
  ├─ INCOMPLETE
  │    ↓
  │  原因確認
  │
  └─ PASS
       ↓
    Reviewer
       │
       ├─ CHANGES_REQUESTED
       │        ↓
       │     Executor
       │        ↓
       │     Verifier
       │        ↓
       │     Reviewer
       │
       ├─ BLOCKED
       │        ↓
       │     原因確認
       │
       └─ APPROVED
              ↓
          Git Safety Check
              ↓
            Stage
              ↓
            Commit
              ↓
             Push
              ↓
        Pull Request
              ↓
       Workflow Report


# 1. Issue

対象となるGitHub Issueまたはユーザー要求を取得する。

Issueを使用する場合は以下を確認する。

- Issue番号
- Title
- Description
- Requirements
- Acceptance Criteria
- その他の制約

Issueの要求をIssue Flow自身が変更してはいけない。

要求に重大な曖昧さが存在しない限り、
通常の実装詳細について人間へ確認しない。


# 2. Planner

最初にPlanner Skillを使用する。

Plannerには以下を渡す。

- Issueまたはユーザー要求
- リポジトリの現在状態

PlannerからImplementation Planを取得する。

Implementation Planが作成されるまで
Executorを開始してはいけない。

Plannerが重大な仕様上の不明点を報告した場合は、
人間への確認が必要か判断する。


# 3. Git Branch

Implementation Plan作成後、
Executorを開始する前にIssue専用branchを準備する。


## Base Branch

このプロジェクトのBase Branchは `master` とする。

`master` 上で直接実装してはいけない。


## Branch Name

Issueを処理する場合は以下の形式を使用する。

`issue/<issue-number>-<short-description>`

例:

`issue/12-add-dark-mode`

short-descriptionには
Issueの内容を表す短いkebab-caseの英語名を使用する。


## Branch Safety Check

branch作成前に以下を確認する。

- 現在のbranch
- Working Treeの状態
- Base Branchが存在すること
- Issueと無関係な未commit変更が存在しないこと

Issue専用branchが存在しない場合は作成する。

既に対象Issueのbranchが存在する場合は、
安全に再利用できることを確認して使用する。


## Existing Changes

Issueと無関係な未commit変更が存在する場合、
勝手に以下を行ってはいけない。

- 削除
- stash
- commit
- 上書き

既存変更との衝突リスクがある場合は
BLOCKEDとして人間へ報告する。


# 4. Executor

Issue専用branchへ移動した後、
Implementation PlanをExecutor Skillへ渡す。

Executorには以下を渡す。

- 元のIssueまたはユーザー要求
- Implementation Plan
- 必要なリポジトリ情報

初回実装ではImplementation Planに従って
Taskを実装させる。

ExecutorからExecution Reportを取得する。

Issue Flow自身はコードを変更しない。


# 5. Verifier

Implementation PlanとExecution Reportを
Verifier Skillへ渡す。

Verifierには以下を渡す。

- 元のIssueまたはユーザー要求
- Implementation Plan
- 最新のExecution Report
- 現在の実装

VerifierにAcceptance Criteriaを検証させ、
Verification Reportを取得する。

Web UIに関係するAcceptance Criteriaが存在し、
Playwrightが利用可能な場合は、
Verifierのルールに従って実ブラウザ検証を行う。


## PASS

Verification ReportのFinal DecisionがPASSの場合、
Reviewerへ進む。


## FAIL

Verification ReportがFAILの場合、
Issue Flow自身ではコードを修正しない。

Verification ReportのFailuresを
Executorへ修正要求として渡す。

Executorには以下を渡す。

- 元のImplementation Plan
- 最新のExecution Report
- Verification Report
- 修正対象となるFailure

ExecutorはFailureを解消するために
必要な範囲だけ修正する。

修正後は必ずVerifierを再実行する。


## INCOMPLETE

Verification ReportがINCOMPLETEの場合、
原因を確認する。

以下のような実行環境上の問題であり、
安全に自律解決できる場合は解決してVerifierを再実行する。

- 開発サーバーが起動していない
- 必要なローカルプロセスが起動していない
- 一時的な実行失敗
- 検証手順の不足

以下の場合は人間へ確認する。

- Secretsが必要
- 外部サービスの認証が必要
- 新しい権限付与が必要
- 本番環境への操作が必要
- 要求自体が曖昧で検証不能

未検証項目をPASSとして扱ってはいけない。


# 6. Reviewer

VerifierのFinal DecisionがPASSの場合のみ、
Reviewer Skillを使用する。

Reviewerには以下を渡す。

- 元のIssueまたはユーザー要求
- Implementation Plan
- 最新のExecution Report
- 最新のVerification Report
- 実際のコード変更

ReviewerからReview Reportを取得する。


## APPROVED

Review ReportのDecisionがAPPROVEDの場合、
Git Commit工程へ進む。


## CHANGES_REQUESTED

Review ReportのDecisionがCHANGES_REQUESTEDの場合、
BLOCKERおよびMAJORの指摘をExecutorへ渡す。

Executorには以下を渡す。

- 元のImplementation Plan
- 最新のExecution Report
- 最新のVerification Report
- Review Report
- 修正対象となるBLOCKER / MAJOR

Executorは指摘を解消するために
必要な範囲だけコードを修正する。

修正後はReviewerへ直接戻してはいけない。

必ず以下の順序で処理する。

Executor
  ↓
Verifier
  ↓ PASS
Reviewer

修正によって既存動作を壊していないことを
Verifierで再確認する。

MINORおよびNOTEだけを理由として
自動修正ループを開始しない。


## BLOCKED

Review ReportのDecisionがBLOCKEDの場合、
原因を確認する。

情報不足を安全に自律解決できる場合は解決し、
Reviewerを再実行する。

以下の場合は人間へ確認する。

- Issueの仕様判断が必要
- セキュリティ上の重大な判断が必要
- Secretsまたは外部認証が必要
- 本番環境への操作が必要
- 自律的に安全な判断ができない


# 7. Retry Policy

Executorによる修正は、
VerifierとReviewerからの修正要求を合計して
最大3回までとする。

初回実装はRetry Countに含めない。

以下の場合にRetry Countを1増やす。

- VerifierのFAILを受けてExecutorが修正した
- ReviewerのBLOCKER / MAJORを受けてExecutorが修正した

同じFailureが繰り返される場合、
Retry Limitまで闇雲に修正を続けてはいけない。

以下の場合はRetry Limit到達前でも停止できる。

- 同じ修正を繰り返している
- 修正によって問題が増えている
- 根本的な設計変更が必要
- Implementation Plan自体に問題がある
- Executorの責務を超える変更が必要

Retry Countが3に達した状態で
さらにExecutorによる修正が必要になった場合は停止し、
人間へ報告する。


# 8. Plannerへの差し戻し

実装・検証・レビュー中に
Implementation Plan自体の問題が判明した場合、
Executorへ無理に修正させない。

Plannerへ問題を戻し、
Implementation Planを再作成する。

再計画が必要な例:

- PlanではAcceptance Criteriaを満たせない
- リポジトリ構造とPlanが大きく異なる
- 想定していたAPIが存在しない
- 設計上の前提が誤っていた
- Reviewerが根本的な設計問題を発見した

再計画後もIssueのRequirementsと
Acceptance Criteriaを変更してはいけない。

再計画によって大幅な仕様変更が必要になる場合は
人間へ確認する。


# 9. 修正時のルール

VerifierまたはReviewerからの修正では、
報告された問題の解消だけを目的とする。

以下は禁止する。

- Acceptance Criteriaの変更
- テスト条件の緩和
- Verifierの判定基準変更
- Reviewerの判定基準変更
- 問題を隠すための実装
- 無関係なコード変更
- Issueの仕様変更
- テストを通すためだけの不正な処理

修正によって別の機能を壊してはいけない。


# 10. Commit

VerifierがPASSし、
ReviewerがAPPROVEDした場合のみcommitを許可する。


## Commit Preconditions

commit前に以下をすべて確認する。

- VerifierのFinal DecisionがPASS
- ReviewerのFinal DecisionがAPPROVED
- 現在のbranchが対象Issue専用branch
- BLOCKERまたはMAJORが残っていない
- Working Treeの変更内容を確認済み
- Issueと無関係な変更が含まれていない
- Secretsや認証情報が変更に含まれていない

条件を満たさない場合はcommitしない。


## Staging

原則として以下を使用しない。

- `git add .`
- `git add -A`

Issueに関係するファイルを確認し、
必要なファイルだけを明示的にstageする。

以下を誤ってstageしてはいけない。

- `.env`
- Secrets
- API Key
- Token
- 認証情報
- 一時ファイル
- Build生成物
- Issueと無関係な変更


## Commit Message

以下を基本形式とする。

`<type>: <summary> (#<issue-number>)`

type:

- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: 挙動を変えないリファクタリング
- `test`: テスト
- `docs`: ドキュメント
- `chore`: その他の保守作業

例:

`feat: add dark mode toggle (#12)`

summaryは変更内容を簡潔に表現する。


# 11. Push

commit成功後、
現在のIssue専用branchをremote `origin` へpushする。

初回pushではupstreamを設定してよい。

対象branch以外をpushしてはいけない。


## Push Failure

pushに失敗した場合は原因を確認する。

安全に自動解決可能な一時的問題であれば
必要な範囲で再試行してよい。

以下のような問題を
force pushで解決してはいけない。

- remote conflict
- branch history conflict
- permission failure
- authentication failure

安全に解決できない場合は停止し、
Workflow Reportへ記録する。


# 12. Pull Request

Issue専用branchのpushに成功した後、
GitHub上にPull Requestを作成する。

Base Branch:

`master`

Head Branch:

現在のIssue専用branch


## Pull Request Preconditions

Pull Requestは以下をすべて満たした場合のみ作成する。

- VerifierのFinal DecisionがPASS
- ReviewerのFinal DecisionがAPPROVED
- 現在のbranchがIssue専用branch
- commitが成功している
- pushが成功している
- 対象Issueが明確
- 同じIssueに対するOpen Pull Requestが存在しない

既存のOpen Pull Requestが存在する場合、
重複したPull Requestを作成してはいけない。


## Pull Request Title

Issueの内容を簡潔に表すタイトルを使用する。

例:

`Add dark mode toggle`

`Fix mobile navigation`


## Pull Request Body

以下の情報を含める。

### Summary

実装内容の概要。

### Changes

主要な変更内容。

### Verification

実行した検証と結果。

例:

- Build
- Lint
- Tests
- Playwright
- Acceptance Criteria

### Review

Reviewerの最終結果。

### Issue

対象Issueを以下の形式で関連付ける。

`Closes #<issue-number>`

IssueはPull Request作成時点では手動でCloseしない。

Pull RequestがBase Branchへmergeされた場合に
GitHubのIssue連携によってCloseされるようにする。


## Pull Request Safety

Pull Request作成直前に
Base BranchとHead Branchを再確認する。

以下の場合はPull Requestを作成しない。

- Head Branchが `master`
- Base Branchが `master` ではない
- VerifierがPASSしていない
- ReviewerがAPPROVEDしていない
- pushが失敗している
- 対象Issueが不明
- 同じIssueに対するOpen Pull Requestが存在する


# 13. Merge Policy

Issue FlowはPull Requestをmergeしない。

以下は禁止する。

- Pull Requestの自動merge
- Auto Mergeの有効化
- `master`への直接merge
- Pull Request承認の代行
- merge後のbranch削除

最終的なmerge判断は人間が行う。


# 14. 人間への確認

通常の実装判断では人間へ確認しない。

以下の場合のみ確認する。

- Issueの要求が重大な意味で曖昧
- 破壊的なデータ変更が必要
- 認証・権限設計の重大な変更が必要
- Secretsが必要
- 外部サービスへの新しい認証が必要
- 本番環境への操作が必要
- 大幅な仕様変更が必要
- Retry Limitへ到達した
- Gitの状態を安全に処理できない
- 自律的に安全な判断ができない

人間への確認が不要な問題については
可能な範囲で自律的に処理を継続する。


# 15. Workflow Report

正常終了時または停止時に
Workflow Reportを作成する。

形式:

# Workflow Report

## Result

COMPLETE / BLOCKED / FAILED

## Issue

対象Issueまたはユーザー要求。

## Planning

Implementation Planの概要。

## Implementation

実装したTaskの概要。

## Verification

最終Verification Reportの概要。

## Review

Reviewerの最終判定。

## Retry Count

0 / 1 / 2 / 3

## Changed Files

変更されたファイル。

## Git

### Branch

使用したIssue branch。

### Commit

commit hashとcommit message。

commitしていない場合は理由を書く。

### Push

SUCCESS / FAILED / NOT EXECUTED

### Pull Request

Pull Request番号とURL。

作成していない場合は理由を書く。

## Remaining Issues

残っている問題。

なければ:

None.

## Workflow Status

COMPLETE

## Automation Blocked

No

## Human Action Required

Yes

- Pull Requestの最終確認
- Merge判断

# 16. Safety Rules

Issue Flowは以下を行わない。

- 自分自身でコードを実装する
- IssueのRequirementsを変更する
- Acceptance Criteriaを変更する
- FAILを無視する
- 未検証項目をPASSとして扱う
- ReviewerのBLOCKER / MAJORを無視する
- Retry Limitを超えて修正を続ける
- Secretsを生成・推測する
- Secretsをcommitする
- 本番環境を操作する
- 無関係な変更を削除する
- 無関係な変更をstashする
- 無関係な変更をcommitする
- 他Issueのbranchを変更する
- `master`上で直接実装する
- `master`へ直接commitする
- `master`へ直接pushする
- `master`へ直接mergeする
- `git reset --hard`を使用する
- `git push --force`を使用する
- `git push --force-with-lease`を使用する
- `git add .`を使用する
- `git add -A`を使用する
- 過去commitを書き換える
- rebaseによって公開済み履歴を書き換える
- Pull Requestを自動mergeする
- Auto Mergeを有効化する
- Git Workflowで明示的に許可されていない破壊的Git操作を行う

Issue Flowの責務は、
各SkillとGit Workflowを統括し、
IssueからPull Request作成までを
安全かつ自律的に進行することである。