# Obsidian theme 變數與 Tasks plugin 的 DOM 結構

> 對應 issue：[#4](https://github.com/yurenju/obsidian-lattice/issues/4)（地圖：[#1](https://github.com/yurenju/obsidian-lattice/issues/1)）
> 調查日期：2026-10-05

## 來源與版本

所有結論都追到下列一手來源。標示「app.css」或「app 程式碼」的，指的是 Obsidian 桌面版 **1.13.7** 安裝檔內附的 `app.css` 與編譯後的 JS（從本機的 `obsidian-1.13.7.asar` 取出閱讀）。這是 Obsidian 實際執行的樣式；官方文件只列出變數名稱，沒有列出預設值與選擇器，所以預設值與選擇器都以 app.css 為準。

| 代號 | 來源 |
| --- | --- |
| [Build a theme] | https://docs.obsidian.md/Themes/App+themes/Build+a+theme |
| [Theme guidelines] | https://docs.obsidian.md/Themes/App+themes/Theme+guidelines |
| [Theme checklist] | https://docs.obsidian.md/oo/theme（Obsidian October theme self-critique checklist） |
| [Manifest] | https://docs.obsidian.md/Reference/Manifest |
| [CSS variables] | https://docs.obsidian.md/Reference/CSS+variables/CSS+variables 與其下各子頁 |
| [devdocs repo] | https://github.com/obsidianmd/obsidian-developer-docs （commit `c56c7e7`，`en/Reference/CSS variables/`、`en/Themes/`） |
| [sample-theme] | https://github.com/obsidianmd/obsidian-sample-theme （`manifest.json`、`theme.css`、`README.md`） |
| [Tasks Styling] | https://publish.obsidian.md/tasks/Advanced/Styling （原始檔：[docs/Advanced/Styling.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/Advanced/Styling.md)） |
| [Tasks Sample HTML] | [docs/snippets-embedded-in-multiple-pages/Sample HTML - Full mode.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/snippets-embedded-in-multiple-pages/Sample%20HTML%20-%20Full%20mode.md) |
| [Tasks src] | https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src （`Renderer/TaskLineRenderer.ts`、`Renderer/HtmlQueryResultsRenderer.ts`、`Renderer/Renderer.scss`、`Obsidian/InlineRenderer.ts`；Tasks 8.4.0） |
| app.css / app 程式碼 | Obsidian 1.13.7 安裝檔內的 `app.css` 與 `app.js`（非公開 repo，無連結） |
| Things | 本機安裝的 Things theme 2.1.19 的 `theme.css`，只當作「別人怎麼寫」的參考，不當事實來源 |

---

## 1. Theme 檔案結構與本機開發

### 1.1 檔案

- 一個 theme 就是 `<vault>/.obsidian/themes/<名稱>/` 底下的 `manifest.json` + `theme.css`。[Build a theme] [sample-theme]
- **資料夾名稱必須和 `manifest.json` 的 `name` 完全一致**，否則 Obsidian 不會認得。[Build a theme]；app 程式碼在讀取 themes 時也只接受 `manifest.name === 資料夾名稱` 的項目。
- `manifest.json` 必要欄位（theme 適用）：`name`、`version`（`x.y.z`）、`minAppVersion`、`author`；選用：`authorUrl`、`fundingUrl`。`id`、`description`、`isDesktopOnly` 只有 plugin 才有。[Manifest]
- 範例（官方 sample theme）：

  ```json
  {
    "name": "Sample Theme",
    "version": "1.0.0",
    "minAppVersion": "1.10.6",
    "author": "Obsidian",
    "authorUrl": "https://obsidian.md"
  }
  ```

- 上架才需要的東西（`versions.json`、`screenshots/`、`LICENSE`、GitHub release workflow、theme 名稱不得含「Theme」「Obsidian」）對 Lattice 都不需要（#1 已排除上架）。[sample-theme] [Manifest]

### 1.2 本機開發與重新載入

- **改 `theme.css`：不必重開。** app 程式碼中的 CustomCss 模組監聽 vault 的原始檔案事件（`onRaw`），當變動的路徑等於目前啟用 theme 的 `theme.css` 時，會在 100ms 的 debounce 後重新載入 theme。存檔即生效。
- **改 `manifest.json`：官方文件要求重開 Obsidian。**[Build a theme]（app 程式碼會在 2 秒 debounce 後重讀 theme 清單，但官方的說法仍是重開，以官方為準。）
- 需要整個重載時，可以用指令面板的 **Reload app without saving**（官方在 plugin 教學中提到的指令）。
- 找變數：DevTools（`Ctrl+Shift+I`）→ Sources → `app.css`，搜尋 `  --ribbon-`（前面兩個空格，只找定義處）；或用元素選取器看 Styles 面板的 `var(--…)`。[Build a theme]
- **尚待驗證**：如果把 repo 用 junction／symlink 掛到 vault 的 `.obsidian/themes/Lattice`，Obsidian 的檔案監聽是否會跟著觸發。來源都沒有提到。保守的作法是讓樣本庫（Sample vault）本身就是一個 vault，把 theme 放在它的 `.obsidian/themes/Lattice/` 裡。

### 1.3 官方寫法建議

- 一般變數寫在 `body`，顏色寫在 `.theme-dark` / `.theme-light`；`:root` 盡量少用。[Theme guidelines] [Build a theme]
- 選擇器越簡單越好：版本更新最常壞的，就是依賴 class 名稱與巢狀結構的複雜選擇器。[Theme guidelines]
- 不要用 `!important`；Live Preview 用到的 class 不要改垂直 margin，要改用 padding；`:has()` 除非必要不用（效能問題，Canvas 尤其明顯）；字型等資源要放在本機，不要從網路載入。[Theme checklist] [Theme guidelines]

---

## 2. CSS 變數的分層（深淺色怎麼疊）

app.css 的實際結構：

1. **`.theme-dark` / `.theme-light`**：放基礎色盤 `--color-base-00…100`、擴充色 `--color-red…pink`、`--mono-0/100`、accent 衍生色 `--color-accent(-1/-2)`，以及少數**依模式不同的語意變數**。
2. **`body`**：放語意變數，大多引用第 1 層，例如 `--background-primary: var(--color-base-00)`、`--text-normal: var(--color-base-100)`、`--text-muted: var(--color-base-70)`、`--text-faint: var(--color-base-50)`。字型、字級、標題、checkbox、引言、標籤等元件變數也都在 `body`。
3. **`:root`**：只有標題字重 `--h1-weight…--h6-weight`（支援可變字重時是 700/680/660/640/620/600）。
4. **行動版覆寫**：`.is-mobile`、`.is-mobile.theme-dark`、`.is-phone`、`.is-tablet` 等。

由此推導出幾個陷阱（皆依 app.css 與 CSS 權重規則）：

- **陷阱 A：有些語意變數 app.css 在 `.theme-dark` 裡又設了一次**，包括 `--background-secondary-alt`、`--background-modifier-form-field`、`--interactive-normal`、`--interactive-hover`、`--interactive-accent`、`--interactive-accent-hover`、`--text-accent`、`--text-selection`。`.theme-dark` 的權重（0,1,0）高於 `body`（0,0,1），所以 theme 如果只在 `body` 設這些變數，深色模式下會被 Obsidian 預設值蓋掉。**這些變數要寫在 `.theme-dark` / `.theme-light`。**
- **陷阱 B：Android（`.is-mobile.theme-dark`，權重 0,2,0）會覆寫** `--color-base-00/10/20`、`--tag-background`、`--interactive-normal`、`--interactive-hover`、`--background-modifier-form-field`、`--background-modifier-hover` 等。只寫在 `.theme-dark` 的值到了 Android 會被換掉。Things 的作法是寫成 `.theme-dark, body.theme-dark.is-mobile { … }` 來提高權重。
- **陷阱 C：1.13 起改用 OKLCH 混色**，`--color-*-rgb`、`--color-accent-hsl`、`--mono-rgb-*`、`--interactive-accent-hsl`、`--text-highlight-bg-rgb` 等已標為 deprecated。要做半透明色時改用 `color-mix(in oklch, var(--color-red) 20%, transparent)`。[CSS variables › Colors]
- accent 色（`--accent-h/s/l`）可以由使用者在設定裡改。[CSS variables › Colors]

---

## 3. Lattice 會用到的變數（依類別）

預設值取自 app.css 1.13.7；說明取自 [CSS variables] 各子頁。

### 3.1 字型（Typography）

| 變數 | 預設 | 說明 |
| --- | --- | --- |
| `--font-text-theme` | `'??'`（佔位） | 編輯器內文字型，**theme 用這個** |
| `--font-interface-theme` | `'??'` | 介面字型 |
| `--font-monospace-theme` | `'??'` | 等寬字型 |
| `--font-text` | `var(--font-text-override), var(--font-text-theme), var(--font-default)` | 最終組合；`*-override` 是使用者在設定裡填的字型，**優先序高於 theme** |
| `--font-default` | `ui-sans-serif, …, "Segoe UI", …, "Segoe UI Emoji", …, sans-serif` | 系統預設串列 |
| `--font-text-size` | `16px` | 使用者在外觀設定調整的字級 |
| `--font-smallest` / `--font-smaller` / `--font-small` | `0.8em` / `0.875em` / `0.933em` | 編輯器內的相對字級 |
| `--font-ui-smaller/small/medium/large` | `12/13/15/20px` | 介面固定字級 |
| `--font-weight` | `var(--font-normal)`（400） | 內文字重 |
| `--bold-modifier` | `200` | 粗體＝`--font-weight + --bold-modifier`；1.6 起官方建議用這個調粗體 |
| `--bold-color` / `--italic-color` | — | 粗體／斜體顏色 |
| `--line-height-normal` | `1.5` | 內文行高 |
| `--line-height-tight` | `1.3` | 介面行高 |
| `--p-spacing` | `1rem` | 段落間距（Source mode 被設為 `0rem`） |
| `--heading-spacing` | `calc(var(--p-spacing) * 2.5)` | 標題上方間距（**只有 Reading view 用到**，見 §4） |
| `--file-line-width` | `700px` | 開啟「可讀行寬」時的行寬 |

注意：`--font-text-theme` 的值會被串進 `--font-text` 的 fallback 串列，所以它可以是一整串字型（例如拉丁字型在前、Noto Sans CJK TC 在後）。

### 3.2 顏色（Colors）

- 基礎色盤：`--color-base-00, 05, 10, 20, 25, 30, 35, 40, 50, 60, 70, 100`（深色預設 `#1C1C1C` → `#dadada`）。
- 擴充色：`--color-red/orange/yellow/green/cyan/blue/purple/pink`。
- Accent：`--accent-h`（258）、`--accent-s`（88%）、`--accent-l`（66%）→ `--color-accent`、`--color-accent-1`、`--color-accent-2`。
- 背景：`--background-primary`、`--background-primary-alt`、`--background-secondary`、`--background-secondary-alt`、`--background-modifier-hover`、`--background-modifier-border(-hover/-focus)`。
- 文字：`--text-normal`、`--text-muted`、`--text-faint`、`--text-accent(-hover)`、`--text-on-accent`、`--text-selection`、`--text-highlight-bg`（預設 `rgba(255, 208, 0, 0.4)`）、`--caret-color`。
- 互動：`--interactive-normal`、`--interactive-hover`、`--interactive-accent(-hover)`。

最省事的作法：在 `.theme-dark` 重新定義整組 `--color-base-*`，語意變數就會自動跟著變；只有陷阱 A 列出的那幾個需要另外指定。

### 3.3 標題（Headings）與 inline title

| 變數 | 預設 |
| --- | --- |
| `--h1-size … --h6-size` | `1.618em, 1.462em, 1.318em, 1.188em, 1.076em, 1em` |
| `--h1-weight … --h6-weight` | `700, 680, 660, 640, 620, 600`（在 `:root`） |
| `--h1-line-height … --h6-line-height` | `1.2, 1.2, 1.3, 1.4, 1.5, 1.5` |
| `--h1-color … --h6-color` | `inherit` |
| `--h1-font … --h6-font` | `inherit` |
| `--h1-style`、`--h1-variant` … | 字體樣式／font-variant |
| `--h1-letter-spacing … --h4-letter-spacing` | `-0.015em, -0.011em, -0.008em, -0.005em`（**官方文件沒有列出**，但 app.css 有使用） |
| `--heading-formatting` | Live Preview／Source 中 `#` 符號的顏色 |
| `--inline-title-font/size/weight/color/line-height/style/variant` | 預設跟著 `--h1-*` |

### 3.4 Checkbox 與任務

| 變數 | 預設 |
| --- | --- |
| `--checkbox-size` | `var(--font-text-size)` |
| `--checkbox-radius` | `var(--radius-s)` |
| `--checkbox-color` / `--checkbox-color-hover` | `var(--interactive-accent)` / `var(--interactive-accent-hover)`（勾選後的底色） |
| `--checkbox-marker-color` | `var(--background-primary)`（勾勾本身的顏色） |
| `--checkbox-border-color` / `-hover` | `var(--text-faint)` / `var(--text-muted)` |
| `--checkbox-margin-inline-start` | Live Preview 中 checkbox 的起始 margin |
| `--checklist-done-decoration` | `line-through` |
| `--checklist-done-color` | `var(--text-muted)` |

**陷阱**：Obsidian 只會對 `data-task="x"` / `"X"` 套用 `--checklist-done-*`（見 §5）。

### 3.5 引言（Blockquote）

`--blockquote-border-thickness`（`2px`）、`--blockquote-border-color`（`var(--interactive-accent)`）、`--blockquote-color`（`inherit`）、`--blockquote-background-color`（`transparent`）、`--blockquote-font-style`（`normal`）。

### 3.6 標籤（Tag）

`--tag-size`（`var(--font-smaller)`）、`--tag-color`（`var(--text-accent)`）、`--tag-color-hover`、`--tag-background`（accent 10% 的 color-mix）、`--tag-background-hover`、`--tag-border-color(-hover)`、`--tag-border-width`、`--tag-padding-x`（`0.65em`）、`--tag-padding-y`（`0.25em`）、`--tag-radius`（`2em`）、`--tag-weight`、`--tag-decoration(-hover)`。

### 3.7 清單與連結（任務會用到）

- 清單：`--list-indent`、`--list-indent-editing`（Live Preview，`0.75em`）、`--list-indent-source`、`--list-spacing`、`--list-marker-color(-hover/-collapsed)`、`--list-bullet-size/radius/border/transform`。
- 連結：`--link-color(-hover)`、`--link-decoration(-hover/-thickness)`、`--link-weight`、`--link-unresolved-*`、`--link-external-*`。

### 3.8 其他（#1 尚未明確，先列出位置）

callout（`--callout-*`）、程式碼（`--code-*`）、表格（`--table-*`）、embed、Properties、horizontal rule 都在 [CSS variables] › Editor 下有各自的頁面。介面 token 在 Window 與 Components 分類下。

---

## 4. Live Preview 與 Reading view 的選擇器對照

### 4.1 容器

| | Reading view | Live Preview | Source mode |
| --- | --- | --- | --- |
| 外層 | `.markdown-reading-view > .markdown-preview-view.markdown-rendered > .markdown-preview-sizer` | `.markdown-source-view.mod-cm6.is-live-preview .cm-content` | `.markdown-source-view.mod-cm6:not(.is-live-preview)` |
| 每個區塊 | 每個區塊用 `div.el-<標籤>` 包起來（app.css 中出現的有 `.el-p`、`.el-ul`、`.el-ol`、`.el-pre`、`.el-table`、`.el-blockquote`），裡面才是真正的 HTML 元素 | 每一行都是一個 `.cm-line`，區塊類型由行上的 class 表示 | 同 Live Preview |
| Code block／查詢區塊 | `div.block-language-<lang>` | widget：`div.cm-preview-code-block.cm-embed-block.markdown-rendered.cm-lang-<lang>`，裡面是 `div.block-language-<lang>` | 原始文字 |

（來源：app.css 的選擇器，以及 app 程式碼中建立這些元素時用的 class 字串。）

`.markdown-rendered` 同時出現在 Reading view 與 Live Preview 的渲染 widget（code block、Tasks 查詢、嵌入）上；`.markdown-preview-view` 則出現在 Reading view 與嵌入筆記（`.markdown-embed-content`）上。

### 4.2 元素對照

| 元素 | Reading view | Live Preview |
| --- | --- | --- |
| 標題 | `.markdown-rendered h1`…`h6`（app.css 直接寫 `h1, .markdown-rendered h1 {…}`） | `.cm-line.HyperMD-header.HyperMD-header-1`…`-6`（整行）；文字是 `span.cm-header.cm-header-1`；`#` 是 `.cm-formatting-header` |
| Inline title | `.inline-title`（兩邊相同） | `.inline-title` |
| 引言 | `.markdown-rendered blockquote` | 行：`.HyperMD-quote`；文字：`span.cm-quote`；`>` 符號：`span.cm-formatting-quote`；左線是 `.HyperMD-quote::before` |
| 任務 | `ul > li.task-list-item[data-task="x"]`（加上 `.is-checked`），checkbox 是 `input.task-list-item-checkbox` | `.cm-line.HyperMD-task-line[data-task="x"]`，checkbox 是 `.task-list-label > input.task-list-item-checkbox` |
| 標籤 | `a.tag` | `span.cm-hashtag`（`.cm-hashtag-begin` / `.cm-hashtag-end` 分成兩段） |

### 4.3 常見的「兩邊長得不一樣」陷阱

1. **標題間距的機制不同。** Reading view 用 `margin-top: var(--heading-spacing)`，而且只在標題前面是 `p/pre/table/ul/ol` 時才套用；Live Preview 的標題行改用 `padding-top: var(--p-spacing)`，**`--heading-spacing` 在 Live Preview 不起作用**。要讓兩邊一致，必須分別設定。（app.css）
2. **Live Preview 不能用垂直 margin。** 官方 checklist 明確要求 Live Preview 用到的 class 改用 padding。CodeMirror 靠行高計算捲動位置，margin 會讓游標與點擊位置錯開。[Theme checklist]
3. **引言的斜體變數名稱不一致（app.css 的 bug）。** Reading view 用 `font-style: var(--blockquote-font-style)`；Live Preview 的 `.HyperMD-quote` 用的是 `font-style: var(--blockquote-style)`，**而這個變數在 app.css 裡從未定義**。所以只設 `--blockquote-font-style` 只會影響 Reading view。Lattice 要同時設兩個變數，或直接對 `.HyperMD-quote` 寫規則。
4. **引言的顏色在 Live Preview 套在 `span.cm-quote` 上，不是套在整行。** 行內的連結、粗體等其他 span 可能不會繼承到。
5. **Live Preview 的標題是「整行」。** `.HyperMD-header-N` 上的字級、行高也會套用到同一行裡的 `#` 與其他 span；Reading view 則只作用在 `h1`。
6. **Source mode 的 `--p-spacing` 是 0**（`.markdown-source-view:not(.is-live-preview)`）。這不影響 Lattice，因為 Source mode 只要求字型正確。
7. **程式碼語法上色是兩套程式庫**，兩邊無法完全一致。[CSS variables › Code]
8. **`.markdown-preview-view` 不等於「Reading view」**：嵌入筆記也有這個 class；而 Live Preview 裡的 Tasks 查詢區塊沒有它，只有 `.markdown-rendered`。（見 §5.4 的 Things 案例）

---

## 5. Tasks plugin 的 DOM 與已完成狀態

Tasks 8.4.0 為準（本機安裝的也是 8.4.0）。

### 5.1 查詢結果的結構

（[Tasks Styling]，並以 [Tasks Sample HTML] 與 [Tasks src] 核對。）

```text
div.block-language-tasks                      ← Obsidian 的 code block 容器
└─ div
   ├─ div.plugin-tasks-toolbar                 ← 篩選框、複製按鈕
   ├─ pre.plugin-tasks-query-explanation       ← 有 `explain` 時才出現
   ├─ h4|h5|h6.tasks-group-heading             ← 有分組時（可能含 span.tasks-group-count）
   ├─ ul.contains-task-list.plugin-tasks-query-result
   │     [.tasks-layout-short-mode] [.tasks-layout-hide-<元件>] [data-task-group-by="due,…"]
   │  └─ li.task-list-item.plugin-tasks-list-item[.is-checked]
   │        data-task="<狀態符號>"  data-line  data-task-status-name  data-task-status-type
   │        data-task-priority="normal|…"  data-task-due="past-1d|today|future-far…" …
   │     ├─ input.task-list-item-checkbox[type=checkbox]
   │     ├─ span.tasks-list-text
   │     │  ├─ span.task-description > span（內含 a.tag[data-tag-name="#…"]）
   │     │  ├─ span.task-id / .task-dependsOn / .task-priority[data-task-priority]
   │     │  ├─ span.task-recurring / .task-onCompletion
   │     │  ├─ span.task-created / .task-start / .task-scheduled / .task-due / .task-cancelled / .task-done
   │     │  │     （各自帶 data-task-<欄位>，內層 span 是「emoji＋日期」文字）
   │     │  └─ span.task-block-link（預設 display:none）
   │     └─ span.task-extras
   │        ├─ span.tasks-urgency
   │        ├─ span.tasks-backlink > a.internal-link[.internal-link-short-mode]   ← 反向連結
   │        ├─ a.tasks-edit                    ← 編輯按鈕（::after 內容是 📝）
   │        └─ a.tasks-postpone[.tasks-postpone-short-mode]  ← 延後按鈕（::after 內容是 ⏩）
   └─ div.task-count                           ← 「N tasks」
```

要點：

- **日期與優先度的 emoji 不是獨立元素**：例如 `span.task-due > span` 的文字就是 `📅 2023-07-04`。要單獨調整 emoji 大小或基線，只能從整個內層 span 下手。Short mode 會只留 emoji、省略後面的文字。[Tasks Styling]
- 日期屬性的值是相對今天：`today`、`past-1d`…`past-7d`、`past-far`、`future-1d`…`future-far`，可用 `[data-task-due^="past-"]` 選出逾期。這些屬性同時掛在元件 span 與 `li` 上；`data-task-priority` 沒有設定時，`li` 上預設是 `normal`。[Tasks Styling]
- **文件與程式碼的不一致**：Tasks 文件與 `Renderer.scss` 寫的是 `.tasks-count`（設為 `--text-faint`），但程式碼實際產生的是 `div.task-count`（[Tasks src] `HtmlQueryResultsRenderer.ts` 的 `addTaskCount`；Sample HTML 與本機 `main.js` 也都是 `task-count`）。所以 Tasks 自己那條 `.tasks-count` 樣式其實沒有生效；**Lattice 要用 `.task-count`**。
- Tasks 自帶的樣式很少：`.tasks-edit/.tasks-postpone` 用 `--text-accent`、`--font-interface`；`.tasks-urgency` 用 `--background-secondary`、`--font-ui-smaller`；`.tasks-group-count` 用 `--text-muted`。（[Tasks src] `Renderer.scss`）

### 5.2 Reading view 中的一般任務

- Tasks 會用 markdown post processor 把 Reading view 中**符合 global filter** 的 `li.task-list-item` 換成自己渲染的 `li`。結構和查詢結果相同，但**沒有 `task-extras`**（沒有反向連結、編輯按鈕）。不符合 filter 的任務維持 Obsidian 原生的 `li`。（[Tasks Styling]；[Tasks src] `Obsidian/InlineRenderer.ts`）
- **Live Preview 與 Source mode 的一般 markdown 任務完全沒有 Tasks 的 class 與 data 屬性**，這是 Tasks 官方列出的限制（issue #3676、#3677）。Live Preview 中只有 Tasks **查詢區塊**會有。[Tasks Styling]

### 5.3 已完成任務的標記：三種情境比較

| 情境 | 任務元素 | 已完成的標記 |
| --- | --- | --- |
| Obsidian 原生，Reading view | `li.task-list-item` | `data-task="x"`；只要狀態字元不是空白就會加 `.is-checked`（所以 `[-]`、`[/]` 也會有 `.is-checked`） |
| Obsidian 原生，Live Preview | `.cm-line.HyperMD-task-line` | 只有 `data-task="x"`，**沒有 `.is-checked`、沒有 status type** |
| Tasks 渲染（查詢結果，以及 Reading view 中符合 filter 的任務） | `li.task-list-item.plugin-tasks-list-item` | `data-task="x"`、`.is-checked`（同樣是「符號不是空白」就加）、`data-task-status-type="DONE"`、`data-task-status-name="Done"`；有完成日期時另有 `span.task-done[data-task-done]` |

（app 程式碼：Reading view 的 markdown 轉換與勾選切換都是 `checked → is-checked`、`data-task = 狀態字元`；Live Preview 以 decoration 只加 `data-task`。Tasks：`TaskLineRenderer.ts` 中 `if (task.status.symbol !== ' ') li.classList.add('is-checked')`。）

Obsidian 預設的刪除線規則（app.css）：

```css
ul > li.task-list-item[data-task="x"], ul > li.task-list-item[data-task="X"] { … }
.markdown-source-view.mod-cm6 .HyperMD-task-line[data-task="x"], … [data-task="X"] { … }
```

第一條**沒有限定在 Reading view**，所以 Tasks 查詢結果（`ul > li[data-task="x"]`）也會吃到同一組 `--checklist-done-*`。

**結論：標記方式「部分相同」。** `data-task="x"` 在三種情境都有，是唯一的共同點；`.is-checked` 只有 Reading view 與 Tasks 渲染才有，而且意義比「已完成」寬（取消、進行中也會有）；`data-task-status-type="DONE"` 只有 Tasks 渲染才有，但能涵蓋自訂的完成符號。

若要在三種情境都讓「已完成任務」一眼可辨，可以用這組選擇器（只依賴 `data-task`，最穩）：

```css
ul > li.task-list-item[data-task="x" i],
.markdown-source-view.mod-cm6 .HyperMD-task-line[data-task="x" i]
```

需要涵蓋自訂完成狀態時，再補上 `li.task-list-item[data-task-status-type="DONE"]`（只在 Reading view 與查詢中有效）。最簡單的作法是直接設定 `--checklist-done-color` / `--checklist-done-decoration`，三種情境都會吃到。

### 5.4 參考：Things theme 的作法與它的漏洞

Things 2.1.19 對已完成任務寫了：

```css
.markdown-preview-view ul > li.task-list-item.is-checked,
.markdown-source-view.mod-cm6 .HyperMD-task-line[data-task='x'], …
```

依照上面的事實，這條規則有兩個副作用：(1) Reading view 用 `.is-checked`，會把 `[-]`、`[/]` 等所有非空白狀態都當成已完成；Live Preview 卻只認 `x`，兩邊不一致。(2) `.markdown-preview-view` 不會出現在 Live Preview 的 Tasks 查詢區塊上（那裡只有 `.markdown-rendered`），所以在 Live Preview 看查詢結果時，這條規則不會生效。Things 另外用 `input[data-task='…']:checked` 與 `li[data-task='…'] > input:checked` 為各種自訂狀態畫 checkbox 圖示。

---

## 6. 給後續票的摘要

- 色彩：在 `.theme-dark`（以及 `body.theme-dark.is-mobile`）重新定義 `--color-base-*` 與 accent；陷阱 A 列出的語意變數也放在模式選擇器裡，不要放在 `body`。
- 字型：只設 `--font-text-theme` / `--font-interface-theme` / `--font-monospace-theme`；使用者的 override 永遠優先。
- 內容區要兩邊一致時，標題間距與引言斜體必須針對 Live Preview 另外處理（§4.3 第 1、3 點）。
- 已完成任務：以 `data-task="x"` 為主軸，`--checklist-done-*` 已經涵蓋三種情境；Tasks 的 `data-task-status-type` 是加分項。
- Tasks 的 emoji 和日期在同一個 span 裡；任務數量的 class 是 `.task-count`，不是文件上寫的 `.tasks-count`。
