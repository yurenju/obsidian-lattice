# 樣本庫（Sample vault）

用來驗證 Lattice 每一個設計決定的替身筆記。結構仿照真實的文章與專案筆記，內容全部改寫，不含任何個人資訊。

## 開啟方式

1. 開啟 Obsidian，在 vault 選單選「Open folder as vault」。
2. 選擇本 repo 的 `sample-vault/` 資料夾。
3. 第一次開啟時，Obsidian 會詢問是否信任這個 vault 的 plugin，選「Trust author and enable plugins」，Tasks plugin 才會啟用並渲染查詢結果。

## 內容

| 檔案 | 類型 | 用來檢查 |
|---|---|---|
| `專案筆記/2026-10-05.md` | 專案筆記（每日） | emoji 標題、已完成與未完成任務、Tasks 查詢結果、巢狀清單 |
| `專案筆記/2026-10.md` | 專案筆記（每月） | 包在可收合 callout 裡的 Tasks 查詢、日記式巢狀清單 |
| `專案筆記/2026-10-weekly.md` | 專案筆記（每週） | 大量連續的 `##` 標題與空的查詢結果 |
| `專案/植物園導覽手冊/植物園導覽手冊.md` | 專案筆記（專案頁） | 各種優先度、日期、重複、取消的任務；表格；properties |
| `文章/2026-09-14_窗櫺/窗櫺.md` | 文章 | 長段落、圖片、引言、粗體、書名號、日文詞彙 |
| `混排測試.md` | 混排文字 | 地區字形、缺字、同一行混排、標點、行內樣式 |
| `元素總覽.md` | 所有元素 | 六級標題、清單、任務狀態、引言、callout、程式碼、表格（含置中與靠右欄）、行內樣式、註腳 |

`專案筆記/2026-10-05.md` 的「今日工作」查詢會抓到 `植物園導覽手冊.md` 裡排程在 2026-10-05 的任務，以及自己「臨時」段落下的任務。

## Plugin

`.obsidian/plugins/obsidian-tasks-plugin/` 是 Tasks plugin 8.4.0 的官方發行檔（MIT 授權），直接放在 repo 裡，開啟樣本庫就能使用，不必另外安裝。

## Theme 開發

開發 Lattice 時，theme 會放在 `.obsidian/themes/Lattice/`，存檔後 Obsidian 會自動重新載入 `theme.css`。
樣本庫已在 `.obsidian/appearance.json` 指定使用 Lattice；改了 `manifest.json` 要重開 Obsidian。

## 用檢查腳本確認樣式

repo 根目錄的 `tools/lattice-check.js` 會讀出每個元素實際套用的樣式（computed style），逐項對照規格。

1. 打開「元素總覽」，分成左右兩欄，一欄 Live Preview、一欄 Reading view。想一併檢查 Tasks 查詢，再開一個分頁放 `專案筆記/2026-10-05.md`。
2. 按 `Ctrl+Shift+I` 打開 DevTools 的 Console，貼上整個檔案執行。
3. 腳本會自動從頭捲到尾逐段量測，並暫時切到另一種色彩模式再量一次，量完恢復原狀。結果會印在 console（也會嘗試複製到剪貼簿）：`✗` 是不符合規格的項目，`?` 是開著的筆記裡都沒有這種元素。

改了規格裡的數值時，記得同步更新腳本裡的期望值。

## Theme 需要的字型

theme 不打包任何字型，以下三套要自行安裝。Inter 由 Obsidian 內建，不用另外裝。

| 字型 | 用途 | 備註 |
|---|---|---|
| Noto Sans CJK TC（完整版，建議 notofonts/noto-cjk 的 Super OTC） | 中日文正文、標題 | Windows 內建的 `Noto Sans TC` 是缺字的子集版 |
| Noto Serif CJK TC（完整版） | 引言 | 沒裝時退回新細明體 |
| JetBrains Mono | 程式碼 | 從 JetBrains/JetBrainsMono 的 GitHub releases 下載；winget 上的 Nerd Font 版名稱對不上 |
