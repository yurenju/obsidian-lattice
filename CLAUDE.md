## 語言

- 與使用者對話一律使用繁體中文。
- 文件一律以繁體中文撰寫，包含 issue、`CONTEXT.md`、ADR 與 `docs/` 底下的檔案。指令、程式碼、label 名稱與檔名維持原文。

## Agent skills

### Issue tracker

Issue 放在 GitHub Issues（yurenju/obsidian-lattice），使用 `gh` CLI 操作。詳見 `docs/agents/issue-tracker.md`。

### Triage labels

使用五個預設的 triage label（`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`）。詳見 `docs/agents/triage-labels.md`。

### Domain docs

單一 context：repo 根目錄一份 `CONTEXT.md` 加上 `docs/adr/`。詳見 `docs/agents/domain.md`。
