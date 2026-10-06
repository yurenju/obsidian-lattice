# Minimal 與 Things 的設計拆解

對應 issue #3（地圖：#1）。目的是參考，不是複製：拆出兩個 theme 做出這些效果的 CSS 變數、選擇器與實際數值，最後整理 Lattice 值得借用的做法。所有判斷以**深色模式**為準。

## 來源與方法

| 來源 | 版本 | 用途 |
|---|---|---|
| Minimal `theme.css`（[kepano/obsidian-minimal](https://github.com/kepano/obsidian-minimal)） | 8.2.1 | 主要來源，行號以此版本為準 |
| Things `theme.css`（[colineckert/obsidian-things](https://github.com/colineckert/obsidian-things)） | 2.1.19 | 主要來源，行號以此版本為準 |
| Obsidian 內建 `app.css`（從 Obsidian 1.13.7 安裝包取出） | 1.13.7 | 確認 theme 沒有覆寫時的預設值 |
| Style Settings plugin `main.js` | — | 確認 theme 內 Style Settings 區塊的預設值何時會生效 |

前提：

- 兩個 theme 都靠 **Style Settings** 提供可調參數。Style Settings 的行為（讀 `main.js` 確認）：`class-toggle` 型的設定若預設為 `true`，即使使用者沒動過，也會在 `body` 加上 class（`initClasses()`：`c===void 0&&l.default===!0`）；但 `variable-*` 型的設定**只有使用者改過才會輸出 CSS 變數**（`gl()` 只走訪已儲存的設定）。所以 theme 說明裡寫的「預設值」不一定等於畫面上的實際值，下面都以實際生效的值為準。
- Minimal 的許多開關（例如刪除線、彩色標題）是由另一個 plugin **Minimal Theme Settings** 加 class 控制。沒有裝那個 plugin 時，下列皆以「無 class」的預設狀態描述。
- 色彩換算：HSL 以 CSS 規格換成 sRGB；對比度以 WCAG 2.x 相對亮度公式計算，四捨五入到小數一位。

---

## Minimal

### 1. 整體的簡潔感

簡潔感不是來自某一條規則，而是幾個系統性選擇疊加的結果：

**(a) 全部顏色由兩組 HSL 參數推導**（`theme.css` 163–170、282–374）

```css
body {
  --base-h: 0;   --base-s: 0%;   --base-l: 96%;
  --accent-h: 201; --accent-s: 17%; --accent-l: 50%;
}
.theme-dark { --accent-l:60%; --base-l:15%; ... }
```

背景（`--bg1`～`--bg3`）、邊框（`--ui1`～`--ui3`）、文字（`--tx1`～`--tx4`）、強調色（`--ax1`～`--ax3`）全部是 `hsl(var(--base-h), var(--base-s), calc(var(--base-l) ± N%))`。再於 445–511 行把這些短名稱對應到 Obsidian 的語意變數（`--background-primary: var(--bg1)`、`--text-normal: var(--tx1)`、`--text-muted: var(--tx2)` …）。

結果是整個介面只有「一個灰階 + 一個極低彩度的強調色」：base 飽和度 0%（純灰），accent 飽和度只有 17%。

**(b) 深色模式的實際數值**（base-l = 15%，base-s = 0%；`calc(0% - 10%)` 會被夾到 0%）

| 變數 | 公式 | 實際值 | 語意對應 |
|---|---|---|---|
| `--bg1` | base-l | `hsl(0,0%,15%)` ≈ `#262626` | `--background-primary`（編輯區） |
| `--bg2` | base-l − 2% | ≈ `#212121` | `--background-secondary`（側欄） |
| `--ui1` | base-l + 6% | ≈ `#363636` | `--background-modifier-border` |
| `--ui2` | base-l + 12% | ≈ `#454545` | `--quote-opening-modifier`（引言邊線） |
| `--ui3` | base-l + 20% | ≈ `#595959` | 聚焦邊框 |
| `--tx1` | base-l + 67% | `hsl(0,0%,82%)` ≈ `#d1d1d1` | `--text-normal` |
| `--tx2` | base-l + 45% | `hsl(0,0%,60%)` ≈ `#999999` | `--text-muted`、`--text-blockquote` |
| `--tx3` | base-l + 20% | `hsl(0,0%,35%)` ≈ `#595959` | `--text-faint` |
| `--ax1` | accent | `hsl(201,17%,60%)` ≈ `#889eaa` | `--text-accent`（連結） |

背景與側欄只差 2% 亮度，分界靠 1px 的 `--ui1` 線，而不是色塊。

**(c) 字距與間距**

- `h1, h2, h3, h4 { letter-spacing: -0.02em; }`（1824–1826）
- 段落間距 `--p-spacing: 1.75rem`（118；Obsidian 預設 `1rem`），標題前距 `--heading-spacing: 2em`（117）。Live Preview 的標題行另加 `padding-top: calc(var(--p-spacing) / 2)`（664–666）。
- 行寬 `--line-width: 40rem`、`--max-width: 88%`（88、91），內容寬度取 `min(var(--line-width), var(--max-width))`（1902），套到 Reading view 與 Live Preview 兩邊（1925–1932），所以兩種模式寬度一致。

### 2. 深色模式下適中的對比

關鍵是**正文不用純白**：`--tx1` 只有 82% 亮度，底色 15% 而非純黑。

| 組合 | 對比度 |
|---|---|
| 正文 `#d1d1d1` on `#262626` | 約 9.9 : 1 |
| 次要文字 / 引言 `#999999` on `#262626` | 約 5.3 : 1 |
| faint `#595959` on `#262626` | 約 2.2 : 1（只用在格式符號、清單符號） |

正文 ~10:1 已遠超 WCAG AAA（7:1），但比純白配純黑（21:1）溫和許多，長時間閱讀不刺眼。層級（normal / muted / faint）間的亮度差大致等距（82% → 60% → 35%），所以三層文字一眼可分。

另外 `.theme-dark` 的 `--active-line-bg: rgba(255,255,255,0.04)`（551）、陰影 `rgba(0,0,0,0.3)`（555–557）也都是低調的數值。

### 3. 引言（blockquote）

變數（51–54、486、496）：

```css
--blockquote-style: normal;
--blockquote-color: var(--text-muted);          /* → #999999 */
--blockquote-border-thickness: 1px;             /* Obsidian 預設 2px */
--blockquote-border-color: var(--quote-opening-modifier); /* → --ui2 ≈ #454545 */
```

選擇器（1378–1387）：

```css
.markdown-preview-view blockquote {
  padding-inline-start: var(--nested-padding);  /* 1.1em（96 行） */
  font-size: var(--blockquote-size);
}
.markdown-source-view.mod-cm6 .HyperMD-quote { font-size: var(--blockquote-size); }
```

邊線本身沿用 Obsidian 的 `.markdown-rendered blockquote { border-inline-start: var(--blockquote-border-thickness) solid var(--blockquote-border-color); }` 與 Live Preview 的 `.HyperMD-quote:before`（app.css），Minimal 只換變數。`--blockquote-size` 未設定，即與正文同字級；背景沿用 Obsidian 預設 `transparent`；非斜體。

效果：**一條 1px、比邊框稍亮的灰線 + 降一階的灰色文字**，不用強調色、不用背景色塊。嵌入筆記（`.internal-embed .markdown-embed`，1594–1598）也用同一條 `1px solid var(--quote-opening-modifier)`，引言與嵌入在視覺上是同一套語言。

### 4. 內文字級與行高

```css
--line-height: 1.5;                  /* 89 */
--line-height-normal: var(--line-height);
--font-adaptive-normal: var(--font-text-size, var(--editor-font-size)); /* 602 */
--font-code: calc(var(--font-adaptive-normal) * 0.9);                   /* 606 */
--table-text-size: calc(var(--font-adaptive-normal) * 0.875);
```

- Minimal **不自訂正文字級**，用 Obsidian 設定裡的字級（`--font-text-size`，預設 16px）。
- 行高 1.5，與 Obsidian 預設相同。
- 標題刻意壓小，用字重而非字級區分層級（63–74）：

| | 大小 | 字重 | 其他 |
|---|---|---|---|
| H1 | 1.125em | 600 | |
| H2 | 1.05em | 600 | |
| H3 | 1em | 500 | |
| H4 | 0.90em | 500 | |
| H5 | 0.85em | 500 | `small-caps` |
| H6 | 0.85em | 400 | `small-caps` |

標題顏色不設定（沿用 `inherit`，即正文色）；彩色標題要 `body.colorful-headings` 才開（3160–3166）。

### 補充：Minimal 的任務與標籤（供與 Things 對照）

- 已完成任務（1440–1447）：預設把核心的 `--checklist-done-decoration` 設成 `none`，且 `--checklist-done-color: var(--text-normal)`——完成的任務跟未完成的長得一樣，只靠勾選框區分；要開啟 `body.minimal-strike-lists` 才恢復 `line-through`（詳見下方 Things 第 3 節）。
- 勾選框預設是圓形：`--checkbox-radius: 50%`（1426）。
- 標籤預設（1806–1817）：透明底、1px `--background-modifier-border` 邊框、`--text-muted` 文字、`--tag-size: 0.8em`。

---

## Things

### 1. 色彩基礎（深色）

```css
body {
  --base-h: 212; --base-s: 15%; --base-d: 13%;   /* 20–22 */
  --accent-h: 215; --accent-s: 75%; --accent-d: 70%;
  --blue: #2e80f2; --pink: #ff82b2; --green: #3eb4bf; ... /* 28–34 */
}
.theme-dark {
  --color-base-00: #1c2127;   /* 213，編輯區 */
  --color-base-30: #35393e;   /* 分隔線、邊框 */
  --color-base-100: #dadada;  /* 223，正文 */
  --text-muted: hsl(var(--base-h), var(--base-s), calc(var(--base-d) + 65%)); /* 259 → ≈ #bec6cf */
  --text-faint: hsl(var(--base-h), var(--base-s), calc(var(--base-d) + 30%)); /* 260 → ≈ #5d6d7e */
}
```

底色帶藍的冷灰（hue 212），正文 `#dadada` on `#1c2127` 約 11.6 : 1。與 Minimal 不同，Things 大量使用**飽和的語意色**：粗體與斜體 `--pink`（44–45、319–329），引言 `--green`（46、312–317）。

### 2. 標題層級（顏色、大小、底線）

大小與顏色（37–42、69–74）：

| | 大小 | 顏色（CSS 實際值） | 字重（未覆寫，沿用 Obsidian） |
|---|---|---|---|
| H1 | 1.7rem（27.2px） | `var(--text-normal)` → `#dadada` | 700 |
| H2 | 1.5rem（24px） | `var(--text-normal)` | 680 |
| H3 | 1.2rem（19.2px） | `var(--blue)` → `#2e80f2` | 660 |
| H4 | 1.1rem | `var(--yellow)` → `#e5b567` | 640 |
| H5 | 1rem | `var(--red)` → `#e83e3e` | 620 |
| H6 | 0.9rem | `var(--text-muted)` | 600 |

字重說明：Things 沒有設定 `--hN-weight`；Obsidian 1.13.7 在 `@supports (font-variation-settings: normal)` 下把 H2–H5 設為 680/660/640/620（否則 600），H1 700。Style Settings 區塊裡寫的 700/700/600/500 屬於 `variable-number`，使用者沒改過就不會生效。同理，設定區塊的 `h2-color` 預設 `#2E80F2` 也不會生效，畫面上的 H2 是正文色。

H2 底線（298–304）：

```css
body.h2-underline h2,
body.h2-underline .HyperMD-header.HyperMD-header-2.cm-line {
  border-bottom: 2px solid var(--background-modifier-border); /* → #35393e */
  width: 100%;
  padding-bottom: 2px;
}
```

`h2-underline` 是 `class-toggle`、預設 `true`（1366–1370），只要裝了 Style Settings 就會自動加上 class，所以 H2 底線在一般使用情境下是開著的。選擇器同時涵蓋 Reading view（`h2`）與 Live Preview（`.HyperMD-header-2`）。

效果來源：**字級跨度大**（H1 是正文的 1.7 倍，Minimal 只有 1.125 倍）、**H1/H2 用正文色＋H2 底線劃分區段、H3 以下改用彩色**。H3 藍 `#2e80f2` on `#1c2127` 約 4.2 : 1，夠醒目但不壓過 H1/H2。

### 3. 已完成任務的刪除線

**刪除線來自 Obsidian 核心預設，Things 沿用。** Obsidian 1.13.7 的 `app.css` 定義：

```css
--checklist-done-decoration: line-through;
--checklist-done-color: var(--text-muted);

ul > li.task-list-item[data-task="x"],
ul > li.task-list-item[data-task="X"] {
  text-decoration: var(--checklist-done-decoration);
  color: var(--checklist-done-color);
}
/* Live Preview 編輯行 */
.markdown-source-view.mod-cm6 .HyperMD-task-line[data-task="x"] { text-decoration: var(--checklist-done-decoration); ... }
```

Things 沒有覆寫 `--checklist-done-decoration`，所以 `[x]` 的刪除線是核心預設給的（使用者在 Things 下的截圖也看得到刪除線）。Things 自己只多做了「把完成任務調暗」：

```css
/* Completed checkboxes（369–376） */
.markdown-preview-view ul > li.task-list-item.is-checked,
.markdown-source-view.mod-cm6 .HyperMD-task-line[data-task='x'],
.markdown-source-view.mod-cm6 .HyperMD-task-line[data-task='X'],
.markdown-source-view.mod-cm6 .HyperMD-task-line[data-task='M'] {
  text-decoration: none;
  color: var(--text-faint);   /* → ≈ #5d6d7e，對比約 3.0 : 1 */
}
```

待確認：這條規則直接寫了 `text-decoration: none`，選擇器特異度不低於核心規則、又較晚載入，理論上會在 Reading view 與 Live Preview 編輯行蓋掉刪除線。它涵蓋不到的位置（例如 Tasks plugin 的查詢結果：`ul.contains-task-list.plugin-tasks-query-result > li.task-list-item[data-task="x"]`，在 Live Preview 裡不在 `.markdown-preview-view` 底下）則一定吃到核心的刪除線。截圖中看到的刪除線落在哪一種位置，需在樣本庫用 Things 實際比對；但無論哪一種，刪除線本身都是核心預設，不是 Things 加的。

**Minimal 則把它關掉**（1440–1447）：

```css
body.minimal-strike-lists { --checklist-done-decoration: line-through; }
body:not(.minimal-strike-lists) {
  --checklist-done-decoration: none;
  --checklist-done-color: var(--text-normal);
}
```

控制開關是 `minimal-strike-lists` 這個 class，Minimal 的 Style Settings 區塊定義為 `class-toggle`、`default: false`（7902–7906，「Strike completed tasks」），Minimal Theme Settings plugin 也能切換。預設沒有這個 class，所以 Minimal 的 `[x]` 沒有刪除線、顏色與正文相同。同檔另一處 `line-through`（2866）是取消任務 `[-]` 的規則，與 `[x]` 無關。

另外，**取消的任務 `[-]`**（815–826，與 Minimal 2862–2867 幾乎相同，應是沿用 Minimal）：

```css
body:not(.tasks) .markdown-source-view.mod-cm6 .HyperMD-task-line[data-task]:is([data-task='-']),
body:not(.tasks) li[data-task='-'].task-list-item.is-checked {
  color: var(--text-faint);
  text-decoration: line-through solid var(--text-faint) 1px;
}
```

重點細節：刪除線**顏色與文字同為 faint、粗 1px**，所以線不會比字搶眼。勾選框圖示方面，Things 借用 Minimal 的做法（註明「Credit Minimal theme」，664–728），用 `-webkit-mask-image` 為 `[-]`、`[>]`、`[!]` 等替代任務狀態畫圖示；勾選框圓角 `--checkbox-radius: 30%`（77）。

### 4. 標籤樣式

Things 只換顏色，形狀沿用 Obsidian（48–51、256–257）：

```css
--tag-background-color-d: #1d694b;  /* 深綠底 */
--tag-font-color-d: #ffffff;
.theme-dark { --tag-background: var(--tag-background-color-d); --tag-color: var(--tag-font-color-d); }
```

形狀來自 Obsidian 預設的 `a.tag`（app.css）：`border-radius: var(--tag-radius)`＝`2em`（膠囊形）、`padding: 0.25em 0.65em`、`font-size: var(--tag-size)`＝`0.875em`、`line-height: 1`、邊框 0px。白字 on `#1d694b` 約 6.6 : 1。另外 Live Preview 的 `#tag` 文字強制用內文字型（`.cm-hashtag.cm-meta { font-family: var(--font-text-theme); }`，306–310）。

效果：**實心、飽和度中等的綠色膠囊＋白字**，在灰藍底上像一顆按鈕，比 Obsidian 預設的 10% 半透明強調色底更醒目。

---

## 兩者對照（深色）

| 項目 | Minimal | Things | Obsidian 預設 |
|---|---|---|---|
| 編輯區底色 | `#262626`（純灰） | `#1c2127`（冷灰藍） | — |
| 正文 / 對比 | `#d1d1d1`，~9.9:1 | `#dadada`，~11.6:1 | — |
| 行高 | 1.5 | 1.5 | 1.5 |
| H1 / H2 大小 | 1.125em / 1.05em | 1.7rem / 1.5rem | 1.618em / 1.462em |
| 標題色 | 正文色 | H1–H2 正文色，H3–H5 彩色 | inherit |
| 引言 | 1px 灰線 `#454545`＋muted 文字 | 綠色斜體文字 `#3eb4bf`，邊線沿用預設 2px accent | 2px accent 線 |
| 完成任務 `[x]` | 關掉刪除線（`--checklist-done-decoration: none`）、正文色 | 沿用核心刪除線，另調成 faint 色 | `--checklist-done-decoration: line-through`、muted 色 |
| 取消任務 `[-]` | 1px faint 刪除線＋faint 色（2862–2867） | 1px faint 刪除線＋faint 色 | — |
| 標籤 | 透明底、1px 灰框、muted 字、0.8em | 實心 `#1d694b` 綠底白字、膠囊 | 10% accent 底、accent 字 |

---

## 值得 Lattice 借用的做法

1. **用少數 HSL 參數推導整套灰階（借 Minimal）**
   定義 `--base-h/s/l` 與 `--accent-h/s/l`，背景、邊框、三層文字都用 `calc()` 加減亮度推導，再對應到 Obsidian 語意變數。理由：#1 要求深色為主、淺色「可讀、不壞掉」——同一組公式只要換 `--base-l` 就能推出淺色版；也符合「不支援 Style Settings，參數直接寫在 CSS 變數」的決定。

2. **正文不用純白，三層文字亮度等距（借 Minimal）**
   參考 Minimal 的 82% / 60% / 35%（正文約 10:1）。理由：長篇的**文章**需要久讀不累；繁中筆畫密，純白高對比在深色底上更容易「發光」。Things 的 11.6:1 也在同一區間，可在 9.5～12:1 之間用樣本庫挑。

3. **底色帶一點色相（借 Things）**
   Things 的 `hsl(212,15%,…)` 冷灰比 Minimal 的純灰多一點質感，又不影響內容色。理由：只是改 `--base-h/--base-s`，在第 1 點的架構下幾乎零成本，值得在樣本庫比較。

4. **引言：細線＋降一階文字色，不用彩色斜體（借 Minimal）**
   1px、`--ui2` 等級的灰線，文字用 `--text-muted`。理由：CJK 沒有真正的斜體，Things 的 `font-style: italic` 對中文只會變成合成的傾斜字，難看；彩色文字在長篇引用時也太吵。

5. **標題層級要比 Minimal 明顯，H2 加底線（借 Things）**
   Minimal 的 H1 只比正文大 12.5%，對以標題切分結構的**專案筆記**不夠醒目。建議字級跨度介於兩者之間（例如 H1 ≈ 1.5em），並借用 Things 的 `body h2, .HyperMD-header-2 { border-bottom: 2px solid var(--background-modifier-border) }`——同時涵蓋 Reading view 與 Live Preview，符合「兩者外觀一致」。彩色標題則保守使用：若要用，只給 H3 一個與強調色同系的顏色，避免 Things 那種藍黃紅三色並陳。

6. **已完成任務：保留刪除線，但線與字同色調暗（借 Things）**
   沿用 Obsidian 核心的 `--checklist-done-decoration: line-through`（Things 的做法；不要像 Minimal 那樣設成 `none`），再借 Things「調成 faint」與 `[-]` 的寫法讓線不搶眼：`text-decoration: line-through solid var(--text-faint) 1px; color: var(--text-faint)`。注意 faint 對比只有 ~3:1，完成任務可接受，但需在樣本庫確認仍讀得出內容。選擇器要同時涵蓋 `li.task-list-item.is-checked` 與 `.HyperMD-task-line[data-task='x']`，Tasks plugin 的查詢結果也是 `li.task-list-item`，會一起套用。

7. **標籤：實心色塊膠囊（借 Things 的概念，不借顏色）**
   只覆寫 `--tag-background` / `--tag-color`，形狀交給 Obsidian 預設（`2em` 圓角、`0.25em 0.65em` 內距）。理由：專案筆記靠標籤分類，需要一眼辨識；但顏色應從 Lattice 自己的 accent 推導，而不是 Things 固定的 `#1d694b`，才能與第 1 點的參數系統一致。

8. **不要靠 Style Settings 的「預設值」**
   兩個 theme 都有「說明寫的預設」與「實際生效值」不一致的情況（Things 的 H2 顏色、標題字重）。Lattice 已決定不支援 Style Settings，所有數值直接寫在 CSS 變數，正好避開這個坑。
