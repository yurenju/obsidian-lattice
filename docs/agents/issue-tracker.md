# Issue tracker：GitHub

本 repo 的 issue 與規格都放在 GitHub Issues，所有操作都使用 `gh` CLI。

## 慣例

- **建立 issue**：`gh issue create --title "..." --body "..."`。內容有多行時使用 heredoc。
- **讀取 issue**：`gh issue view <number> --comments`，用 `jq` 篩選留言，並一併取得 label。
- **列出 issue**：`gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`，視需要加上 `--label` 與 `--state` 篩選。
- **留言**：`gh issue comment <number> --body "..."`
- **加上／移除 label**：`gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **關閉**：`gh issue close <number> --comment "..."`

repo 從 `git remote -v` 推斷，在 clone 下來的目錄裡執行 `gh` 會自動判斷。

## 把 Pull request 當成 triage 來源

**PR 是否作為需求來源：否。** _（如果本 repo 把外部 PR 當成功能需求，改成 `是`；`/triage` 會讀這個設定。）_

設為 `是` 時，PR 與 issue 使用相同的 label 和狀態，改用對應的 `gh pr` 指令：

- **讀取 PR**：`gh pr view <number> --comments`，diff 用 `gh pr diff <number>`。
- **列出要 triage 的外部 PR**：`gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`，只保留 `authorAssociation` 為 `CONTRIBUTOR`、`FIRST_TIME_CONTRIBUTOR` 或 `NONE` 的（排除 `OWNER`/`MEMBER`/`COLLABORATOR`）。
- **留言／label／關閉**：`gh pr comment`、`gh pr edit --add-label`/`--remove-label`、`gh pr close`。

GitHub 的 issue 和 PR 共用同一組編號，所以單獨的 `#42` 可能是兩者之一：先用 `gh pr view 42` 判斷，失敗再用 `gh issue view 42`。

## 當 skill 說「發布到 issue tracker」

建立一個 GitHub issue。

## 當 skill 說「取得相關的票」

執行 `gh issue view <number> --comments`。

## Wayfinding 操作

`/wayfinder` 使用。**map** 是一個 issue，底下的 **child** issue 就是票。

- **Map**：一個加上 `wayfinder:map` label 的 issue，內容包含 Notes／目前的決定／迷霧區。用 `gh issue create --label wayfinder:map` 建立。
- **子票**：以 GitHub sub-issue 連結到 map 的 issue（用 `gh api` 呼叫 sub-issues endpoint）。如果沒有開啟 sub-issues，就把子票加到 map 內文的 task list，並在子票內文最上方寫 `Part of #<map>`。Label：`wayfinder:<type>`（`research`/`prototype`/`grilling`/`task`）。被認領後，票會指派給負責推進的開發者。
- **Blocking**：使用 GitHub **原生的 issue dependencies**，這是標準、在 UI 上看得到的表示方式。用 `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` 加上一條關係，其中 `<blocker-db-id>` 是擋住它的 issue 的數字 **database id**（`gh api repos/<owner>/<repo>/issues/<n> --jq .id`，_不是_ `#number` 也不是 `node_id`）。GitHub 會回報 `issue_dependencies_summary.blocked_by`（只計算還開著的 blocker，也就是實際的卡關狀態）。如果沒有 dependencies 功能，就退而在子票內文最上方寫一行 `Blocked by: #<n>, #<n>`。所有 blocker 都關閉時，這張票就解除封鎖。
- **Frontier 查詢**：列出 map 底下還開著的子票（`gh issue list --state open`，限定在 map 的 sub-issues／task list 範圍內），排除有開著的 blocker（`issue_dependencies_summary.blocked_by > 0`，或 `Blocked by` 那行裡有開著的 issue）或已有負責人的票；照 map 的順序取第一張。
- **認領**：`gh issue edit <n> --add-assignee @me`，這是每個 session 的第一個寫入動作。
- **解決**：`gh issue comment <n> --body "<answer>"`，接著 `gh issue close <n>`，再把一則 context 指標（摘要加連結）附加到 map 的「目前的決定」。
