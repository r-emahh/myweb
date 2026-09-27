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

Planning Gateを通過し、VerificationがPASS、ReviewがAPPROVEDで、
GitHubおよび実行環境の必要な権限が利用可能な場合は、
ユーザーへの追加承認を求めずcommit・push・Pull Request作成まで実行する。
Pull Requestのmergeは行わず、人間の判断に委ねる。

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
Base Branch Synchronization
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


## Planning Gate

Plannerの結果を確認し、
Implementation Planが実行可能な状態で確定している場合のみ
Git Branch工程へ進んでよい。

Plannerが以下のいずれかを報告した場合、
Planning GateはPASSしていないものとして扱う。

- Requirements間の矛盾
- Acceptance Criteria間の矛盾
- 実装方針を決定できない重大な曖昧さ
- Issueの要求を変更しなければ解決できない問題
- 人間による仕様判断が必要な問題

Planning GateがPASSしていない場合、
Issue Flow自身が仕様を推測・補完・選択してはいけない。

必要な仕様を人間へ確認し、
回答が得られるまでWorkflowを停止する。

この状態では以下を行ってはいけない。

- Base Branchの同期
- branchの切り替え
- Issue専用branchの作成
- Executorの開始
- ファイルの変更
- stage
- commit
- push
- Pull Requestの作成

人間から回答を得た場合、
回答を元のIssue要求に対する追加仕様としてPlannerへ渡し、
Plannerを再実行する。

再実行したPlannerが実行可能なImplementation Planを作成した場合のみ、
Planning GateをPASSとして次工程へ進む。

人間への確認待ちで停止する場合は、
以下を報告する。

- `Result: WAITING_FOR_CLARIFICATION`
- `Workflow Status: BLOCKED`
- `Automation Blocked: Yes`
- `Human Action Required: Yes`
- 確定できないRequirementsまたはAcceptance Criteria
- 人間に確認する具体的な質問
- Implementationを開始していないこと

# 3. Git Branch

### Dirty Working Tree Safety

Issue processing MUST NOT begin unless the working tree is clean.

At workflow start, run:

`git status --porcelain`

If the command returns any output, including:

- modified tracked files
- staged changes
- untracked files
- deleted files
- renamed files

the workflow MUST immediately stop with `BLOCKED`.

The agent MUST NOT attempt to determine whether the existing changes are related or unrelated to the Issue.

When blocked by a dirty working tree, the agent MUST NOT:

- modify files
- create or switch branches
- stage files
- commit
- stash
- reset
- restore
- clean
- discard existing changes
- push
- create a Pull Request

The agent MUST leave the working tree unchanged and report:

- `Workflow Status: BLOCKED`
- `Automation Blocked: Yes`
- the paths reported by `git status --porcelain`
- `Human Action Required: Yes`

Only the user may decide how the pre-existing working tree changes should be handled.

Implementation Plan作成後、
Executorを開始する前にIssue専用branchを準備する。


## Base Branch

このプロジェクトのBase Branchは `master` とする。

`master` 上で直接実装してはいけない。

## Working Tree Safety Check

Base Branchの同期、branch切り替え、Issue専用branchの作成を行う前に、
Working Treeが完全にcleanであることを確認する。

以下を実行する。

`git status --porcelain`

出力が空の場合のみWorkflowを継続してよい。

1行でも出力が存在する場合、
変更内容がIssueと関係するかどうかを判断してはいけない。

以下を含むすべての既存変更をdirtyとして扱う。

- modified files
- staged files
- untracked files
- deleted files
- renamed files

Working Treeがdirtyの場合、
Workflowを直ちにBLOCKEDとして停止する。

この場合、以下を行ってはいけない。

- ファイルの変更
- ファイルの削除
- stash
- reset
- restore
- clean
- 既存変更のcommit
- stage
- Base Branchの同期
- branchの切り替え
- Issue専用branchの作成
- push
- Pull Requestの作成

既存変更がIssueと無関係であり、
安全に分離できるように見える場合でもWorkflowを継続してはいけない。

既存変更をどのように扱うかは人間が判断する。

Workflow Reportには以下を記録する。

- `Result: BLOCKED`
- `Workflow Status: BLOCKED`
- `Automation Blocked: Yes`
- `Human Action Required: Yes`
- `git status --porcelain` で検出した対象ファイル
- Git操作および実装を開始していないこと


## Base Branch Synchronization

新しいIssueの作業を開始する前に、
Base Branchを安全に最新化する。

このプロジェクトでは以下の順序を使用する。

1. `git switch master`
2. `git pull --ff-only origin master`

通常の `git pull origin master` は使用しない。

`--ff-only` で更新できない場合、
merge、rebase、reset等による自動解決を行わない。

その場合はWorkflowを停止し、
BLOCKEDとして報告する。

Base Branchの同期が完了してから
Issue専用branchを作成する。


## Branch Name

Issueを処理する場合は以下の形式を使用する。

`issue/<issue-number>-<short-description>`

例:

`issue/12-add-dark-mode`

short-descriptionには、
Issueの内容を表す短いkebab-caseの英語名を使用する。


## Branch Safety Check

branch作成前に以下を確認する。

- 現在のbranch
- Working Treeの状態
- Base Branchが存在すること
- Working Tree Safety CheckをPASSしていること

Issue専用branchが存在しない場合は作成する。

既に対象Issueのbranchが存在する場合は、
安全に再利用できることを確認して使用する。

## Existing Changes

Workflow開始時に既存変更が検出された場合は、
Working Tree Safety Checkの規則に従う。

既存変更がIssueと関係するか、
安全に分離可能かをIssue Flow自身で判断してはいけない。

Working Treeがcleanになるまで
Issueの実装を開始してはいけない。


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


## Automation-safe Git Commands

Git操作では、Permission Policyで許可された
単純な単一コマンドを優先する。

複数のGit操作を `;`、`&&`、`||` 等で
1つのShell Commandへ結合してはいけない。

例:

使用する:

`git switch master`

`git pull --ff-only origin master`

使用しない:

`git switch master; git pull origin master`

`git switch master && git pull origin master`

Permission確認を回避する目的で
別コマンドへ置き換えてはいけない。

Antigravity CLIのheadless mode (`agy -p`) では、
権限不足の操作がsoft-denyされ、processの終了コードが0でも実行されていない場合がある。
stderrのpermission noticeを確認し、終了コードだけで成功と判定してはいけない。
commit後はcommit hash、push後はremote branch、Pull Request作成後はGitHub上のPR番号とURLを確認する。
確認できない副作用は成功として報告せず、WorkflowをBLOCKEDとして扱う。

Antigravityが操作の権限確認を表示した場合、コマンドを実行する工程と必要性を確認し、
`docs/ANTIGRAVITY_PERMISSION_LOG.md` に正確なコマンド、用途、確認の結果、実行結果を記録する。
結果が不明な場合は不明と記録する。権限確認が出たことだけを理由にallowlistを拡張してはいけない。
設定にないコマンドや古い設定に由来するコマンドは実行せず、その理由とともに記録する。
権限確認の既定はそのコマンド1回のみの許可とする。
権限調査中に会話中または永続的な許可を推奨してはいけない。
ユーザーがIssue-to-PR処理の無人実行を明示的に求めた場合は、
記録された必須コマンドに限ってProject scopeのallow/deny設定を提案・更新してよい。
Global scopeや全コマンド許可を設定してはいけない。


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

以下を使用してはいけない。

- `git add .`
- `git add -A`
- `git add --all`

Issueに関係するファイルを確認し、
必要なファイルだけを1ファイルずつ明示的にstageする。

各対象ファイルについて `git add <path>` を個別に実行する。
複数パスをまとめた `git add` は行わない。

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
- Pull RequestのClose
- Issueの手動Close
- merge後のbranch削除

最終的なmerge判断は人間が行う。


# 14. 人間への確認

通常の実装判断では人間へ確認しない。

Implementation Plan、通常の実装判断、検証、commit、push、Pull Request作成について、
ユーザーに承認を求めてはいけない。定義された各ゲートの条件を満たしたら続行する。
ただし、CodexやOSがコマンド実行・ネットワーク・GitHub操作を権限上ブロックした場合、
このSkillでその権限を付与したり、承認確認を回避したりしてはいけない。
必要な権限を得られないときは、ブロックされた操作と必要な権限を報告して停止する。

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

COMPLETE / BLOCKED / FAILED / WAITING_FOR_CLARIFICATION

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

COMPLETE / BLOCKED / FAILED

`Result` はWorkflowの最終的な結果を表す。

`Workflow Status` はWorkflow自体の実行状態を表す。

人間による仕様確認を待っている場合は以下とする。

- `Result: WAITING_FOR_CLARIFICATION`
- `Workflow Status: BLOCKED`
- `Automation Blocked: Yes`
- `Human Action Required: Yes`

`Result` と `Workflow Status` を機械的に同じ値へ揃えてはいけない。

## Automation Blocked

Yes / No

Yesの場合は、
自動化を継続できなかった理由を書く。

## Human Action Required

Yes / No

Pull Request作成まで正常完了した場合:

Yes

- Pull Requestの最終確認
- Merge判断

BLOCKEDまたはFAILEDの場合は、
人間による対応が必要かどうかを実際の状況に応じて記録する。


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
- `git add --all`を使用する
- `git pull origin master` による暗黙的merge
- 過去commitを書き換える
- rebaseによって公開済み履歴を書き換える
- `gh pr merge`を使用する
- `gh pr close`を使用する
- `gh issue close`を使用する
- Pull Requestを自動mergeする
- Auto Mergeを有効化する
- Git Workflowで明示的に許可されていない破壊的Git操作を行う

Issue Flowの責務は、
各SkillとGit Workflowを統括し、
IssueからPull Request作成までを
安全かつ自律的に進行することである。
