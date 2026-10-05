# Domain Docs

說明 engineering skills 在探索程式碼時，應該如何使用本 repo 的 domain 文件。

## 探索之前先讀

- repo 根目錄的 **`CONTEXT.md`**，或
- repo 根目錄的 **`CONTEXT-MAP.md`**（如果存在）。它會指向每個 context 各自的 `CONTEXT.md`，讀與主題相關的那幾份。
- **`docs/adr/`**：讀與你即將動到的範圍有關的 ADR。在多 context 的 repo 裡，也要檢查 `src/<context>/docs/adr/` 裡屬於單一 context 的決定。

如果這些檔案不存在，**直接繼續，不要提**。不要指出它們不存在，也不要建議先建立。`/domain-modeling` skill（經由 `/grill-with-docs` 與 `/improve-codebase-architecture` 觸發）會在詞彙或決定真正確定時，才建立這些檔案。

## 檔案結構

單一 context 的 repo（大多數 repo）：

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

多 context 的 repo（根目錄有 `CONTEXT-MAP.md`）：

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← 整個系統層級的決定
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← 單一 context 的決定
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## 使用詞彙表的用語

當你的產出提到某個 domain 概念時（issue 標題、重構提案、假設、測試名稱），使用 `CONTEXT.md` 定義的詞彙。不要改用詞彙表明確列為「避免」的同義詞。

如果需要的概念還不在詞彙表裡，這是一個訊號：可能是你在發明專案沒在用的說法（請重新考慮），也可能是真的有缺口（記下來交給 `/domain-modeling`）。

## 標出與 ADR 的衝突

如果你的產出與現有的 ADR 矛盾，要明確指出，不要默默推翻：

> _與 ADR-0007（event-sourced orders）矛盾，但值得重新討論，因為……_
