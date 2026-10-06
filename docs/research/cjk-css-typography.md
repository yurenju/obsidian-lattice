# CSS 中文排版的最佳實踐與 Obsidian 的支援程度

> 研究票：[#11](https://github.com/yurenju/obsidian-lattice/issues/11)（地圖：[#1](https://github.com/yurenju/obsidian-lattice/issues/1)；結果供 [#7](https://github.com/yurenju/obsidian-lattice/issues/7)「內文節奏」使用）
> 調查日期：2026-10-05。環境：Windows 11（OS Build 26200）、Obsidian 1.13.7。

每一節最後標註來源。「本機驗證」指在上述 Windows 環境直接讀取 Obsidian 安裝檔或字型檔得到的結果。瀏覽器支援版本以 MDN 的資料來源 [mdn/browser-compat-data](https://github.com/mdn/browser-compat-data)（下稱 BCD）與 [Chrome Platform Status](https://chromestatus.com/)（下稱 chromestatus）為準，兩者不一致時兩個都列出。

## 1. 摘要

- **桌面版的 Chromium 版本取決於「安裝程式」，不是 app 版本。** 本機 Obsidian 1.13.7 跑的是 Electron 39.8.3／**Chromium 142**；官方 1.13.6 的安裝程式已升到 Electron 43.3.0（Chromium 150），但要手動重新安裝才會換。
- **Android 版**用系統的 Android System WebView，跟著 Play 商店更新；目前穩定版是 Chromium 154。
- 在 Chromium 142 上可以用：`text-spacing-trim`（123 起，**預設就開**）、`text-autospace`（140 起，只有 `normal`／`no-autospace`）、`line-break`、`word-break`、`overflow-wrap`、`font-feature-settings`、`text-align: justify`。
- `text-justify` 要 **Chromium 145**，本機的 142 沒有，重新安裝成 Electron 43 之後才有。`hanging-punctuation` Chromium 完全不支援。
- 本機安裝的 `Noto Sans CJK TC` 有 `halt`、`palt`，**沒有 `chws`**。`text-spacing-trim` 只需要 `halt` 就能動作。
- clreq：行距（行與行之間的空白）多半是字級的 50%–100%，換算成 CSS 就是 `line-height` 1.5–2；段首縮排兩字；中西文間距不超過 1/4 字寬；台灣出版品多半**不擠壓標點**，橫排也**不做行尾懸掛**。
- Han.css 與 heti 的標點擠壓、中西文間距、行尾懸掛都靠 JavaScript 改 DOM，theme 做不到。現在可以改用原生的 `text-spacing-trim` 與 `text-autospace`。純 CSS 的部分（行高、字距、兩端對齊、強調不用斜體）都能直接搬。

## 2. Obsidian 用的 Chromium 版本

### 2.1 桌面版（Windows）

Obsidian 有兩種更新：

- **App 更新**：自動更新，換的是 `obsidian.asar`（介面與功能）。
- **安裝程式更新**：決定 Electron 版本，也就決定 Chromium 版本。官方說明：Electron「cannot be updated by the automatic update process」，要下載安裝程式重新安裝。目前的安裝程式版本可以在「設定 → 一般」頁面最上方看到。

本機驗證（Obsidian 1.13.7）：

| 項目 | 值 | 怎麼得到 |
| --- | --- | --- |
| App 版本 | 1.13.7 | `%APPDATA%\obsidian\obsidian-1.13.7.asar` |
| Electron | 39.8.3 | `Obsidian.exe` 內嵌的 User-Agent 字串 `Electron/39.8.3` |
| Chromium | 142.0.7444.265 | 同上的 `Chrome/142.0.7444.265`；也和 Electron 官方 release 資訊一致 |

官方 changelog 中與安裝程式有關的紀錄：

| Obsidian 版本 | 日期 | 通道 | 安裝程式 Electron | 對應 Chromium |
| --- | --- | --- | --- | --- |
| 1.13.6（Desktop） | 2026-08-10 | 公開版 | 43.3.0 | 150.0.7871.212 |
| 1.14.1（Desktop） | 2026-09-08 | Catalyst（搶先版） | 43.7.5 | 150.0.7871.250 |

所以：

- **本機現況是 Chromium 142。** 以下的「能不能用」以 142 為準。
- 重新安裝目前的公開版安裝程式，就會升到 **Chromium 150**，多出 `text-justify`（145）等功能。
- 若 Lattice 想用 142 之後才有的功能，前提是先重新安裝；否則要把它當成「有就好」的漸進增強。

來源：
[Obsidian Help：Update Obsidian](https://obsidian.md/help/updates)、
[Obsidian changelog](https://obsidian.md/changelog/)、
[Obsidian 1.13.6 Desktop changelog](https://obsidian.md/changelog/2026-08-10-desktop-v1.13.6/)、
[Electron v39.8.3](https://releases.electronjs.org/release/v39.8.3)、
[Electron v43.3.0](https://releases.electronjs.org/release/v43.3.0)、
[Electron v43.7.5](https://releases.electronjs.org/release/v43.7.5)、本機驗證。

### 2.2 Android 版

- Obsidian 官方只寫支援 Android 5.1 以上，沒有寫 WebView 版本要求。
- Obsidian 行動版不是 Electron（官方開發文件說 Node.js 與 Electron API 在行動裝置上不能用），在 Android 上要用桌面 Chromium 的 `chrome://inspect` 除錯。也就是說，它跑在系統的 Android WebView 裡。
- Chromium 文件說明：從 Android 5.0 起，WebView 是可以獨立更新的系統元件，在有 Google Play 的裝置上預設的提供者是「Android System WebView」穩定版，透過 Play 商店更新。
- chromiumdash 顯示 2026-10-02 的 WebView 穩定版是 **154.0.8037.101**。只要裝置有正常更新 WebView，Android 上的 Chromium 會**比桌面版新**，桌面版能用的屬性 Android 也都能用。實際版本可以在裝置上查「Android System WebView」的 app 資訊。
- BCD 的 `webview_android` 欄位沒有另外標版本時，代表和 Chrome Android 同版本支援。

來源：
[Obsidian for Android](https://obsidian.md/help/android)、
[Obsidian Developer Docs：Mobile development](https://docs.obsidian.md/Plugins/Getting+started/Mobile+development)、
[Chromium：WebView providers](https://chromium.googlesource.com/chromium/src/+/HEAD/android_webview/docs/webview-providers.md)、
[chromiumdash（Stable／Webview）](https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Webview&num=1)。

## 3. 各屬性的支援程度與實際效果

### 3.1 總表

「142」欄是本機 Obsidian；「150」是重新安裝目前公開版之後；Android 以 WebView 154 計。

| 屬性／值 | Chromium 起始版本 | 142 | 150 | Android | 備註 |
| --- | --- | --- | --- | --- | --- |
| `text-spacing-trim`：`normal`、`space-all`、`space-first`、`trim-start` | 123 | ✅ | ✅ | ✅ | 初始值 `normal`，**不用寫就已經生效**；字型要有 `halt` 或 `chws` |
| `text-spacing-trim`：`trim-both`、`trim-all`、`auto` | — | ❌ | ❌ | ❌ | 規格有，沒有瀏覽器實作 |
| `text-autospace`：`normal`、`no-autospace` | 140 | ✅ | ✅ | ✅ | Chromium 的初始值是 `no-autospace`，**要自己寫 `normal`** |
| `text-autospace`：`ideograph-alpha`、`ideograph-numeric`、`punctuation`、`insert`、`replace`、`auto` | — | ❌ | ❌ | ❌ | Safari／Firefox 有，Chromium 沒有 |
| `line-break`：`auto`、`loose`、`normal`、`strict` | 58（無前綴）；值本身 25 起 | ✅ | ✅ | ✅ | |
| `line-break: anywhere` | 83（BCD）／80（chromestatus） | ✅ | ✅ | ✅ | |
| `word-break`：`normal`、`break-all`、`keep-all` | 1／1／44 | ✅ | ✅ | ✅ | |
| `word-break: auto-phrase` | 119 | ✅ | ✅ | ✅ | 只對 `ja`、`ko` 有效，中文等同 `normal` |
| `overflow-wrap`：`break-word`、`anywhere` | 1／80 | ✅ | ✅ | ✅ | |
| `hanging-punctuation` | 不支援 | ❌ | ❌ | ❌ | 只有 Safari；chromestatus 停在 Proposed |
| `font-feature-settings` | 48（無前綴） | ✅ | ✅ | ✅ | 效果取決於字型有沒有該 feature |
| `text-align: justify` | 1 | ✅ | ✅ | ✅ | 中文字之間也會被拉開，見 3.8 |
| `text-justify` | 145 | ❌ | ✅ | ✅ | |
| （相關）`text-wrap: pretty` | 117 | ✅ | ✅ | ✅ | 減少段落最後一行只剩一兩個字 |
| （相關）`text-emphasis`（著重號） | 99（無前綴） | ✅ | ✅ | ✅ | |
| （相關）`ic` 單位 | 106 | ✅ | ✅ | ✅ | 1ic = 一個「水」字的寬度，適合用來設行寬 |

來源：BCD `css/properties/*.json`（[text-spacing-trim](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-spacing-trim.json)、[text-autospace](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-autospace.json)、[line-break](https://github.com/mdn/browser-compat-data/blob/main/css/properties/line-break.json)、[word-break](https://github.com/mdn/browser-compat-data/blob/main/css/properties/word-break.json)、[overflow-wrap](https://github.com/mdn/browser-compat-data/blob/main/css/properties/overflow-wrap.json)、[hanging-punctuation](https://github.com/mdn/browser-compat-data/blob/main/css/properties/hanging-punctuation.json)、[font-feature-settings](https://github.com/mdn/browser-compat-data/blob/main/css/properties/font-feature-settings.json)、[text-align](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-align.json)、[text-justify](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-justify.json)、[text-wrap](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-wrap.json)、[text-emphasis](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-emphasis.json)）；chromestatus：[text-spacing-trim](https://chromestatus.com/feature/5170044014690304)、[text-autospace](https://chromestatus.com/feature/5202578236768256)、[text-justify](https://chromestatus.com/feature/5079678972985344)、[Japanese phrase line breaking](https://chromestatus.com/feature/5133892532568064)、[line-break: anywhere](https://chromestatus.com/feature/5668660729348096)、[hanging-punctuation](https://chromestatus.com/feature/5196301767278592)、[ic 單位](https://chromestatus.com/feature/5193188445257728)。

### 3.2 `text-spacing-trim`（全形標點擠壓）

**規格**（CSS Text 4 §8.5）：控制同一行內 CJK 全形標點的留白。

- `space-all`：全部標點維持全形，不擠壓。
- `normal`（初始值）：行首的開始標點（如「（」）維持全形；行尾的結束標點（如「。」）若放不下才縮成半形；**相鄰標點之間的多餘留白會被收掉**。
- `space-first`：只有區塊第一行與強制換行後的那一行，行首開始標點維持全形，其餘同 `normal`。
- `trim-start`：每一行行首的開始標點都縮成半形，其餘同 `normal`。

**Chromium 的實作**（`han_kerning.cc`，以 142 的 tag 為準）：

- 只有在字型有 `halt`（直排為 `vhal`）時才會動作；有 `chws` 時改用字型的 `chws` 處理同一個 run 內的擠壓。兩個都沒有，效果完全關閉。
- **標點屬於哪一類（靠左、靠右、置中），是 Chromium 實際量字型裡 glyph 的位置判斷出來的。** 程式註解特別寫到 Adobe 的慣例：「全形句號、逗號只有繁體中文是置中的」。所以用 `Noto Sans CJK TC` 時，置中的「，。、」會被當成「中間」類，不會像簡中、日文那樣被擠成半形。會被擠壓的主要是括號、引號（「」『』（）《》）這類開始／結束標點彼此相鄰的情況，例如「。」」或「」（」。
- **作者如果在同一段文字上開了 `halt`、`palt`、`hwid`、`pwid`、`qwid`、`twid`、`valt`、`vhal`、`vpal` 任何一個 `font-feature-settings`，Chromium 會整個停用 `text-spacing-trim`**，因為兩者會互相干擾。

**對 Lattice 的實際效果**：

- 本機驗證：已安裝的 `Noto Sans CJK TC`（Super OTC 內各字重）GPOS 有 `halt`、`palt`、`vhal`、`vpal`、`kern`，**沒有 `chws`**；Windows 內建的 `Noto Sans TC` 也一樣。所以 `text-spacing-trim` 會用 `halt` 那條路徑生效。
- 因為初始值就是 `normal`，**Obsidian 在 Chromium 123 之後已經預設擠壓相鄰標點**，theme 什麼都不寫也會有效果。若要符合 clreq 所說的台灣「不調整」風格，要明確寫 `text-spacing-trim: space-all`。

來源：
[CSS Text 4 §8.5 text-spacing-trim](https://drafts.csswg.org/css-text-4/#text-spacing-trim-property)、
[MDN text-spacing-trim](https://developer.mozilla.org/en-US/docs/Web/CSS/text-spacing-trim)、
[chromestatus 5170044014690304](https://chromestatus.com/feature/5170044014690304)、
[Chromium `han_kerning.cc`（142.0.7444.265）](https://chromium.googlesource.com/chromium/src/+/refs/tags/142.0.7444.265/third_party/blink/renderer/platform/fonts/shaping/han_kerning.cc)、本機驗證（讀取字型 GSUB／GPOS feature list）。

### 3.3 `text-autospace`（中英間距）

**規格**（CSS Text 4 §8.4）：

- `ideograph-alpha`、`ideograph-numeric` 在漢字（含假名、注音）與西文字母／數字**直接相鄰**時加間距；中間若有引號、空白，或非零的 margin／border／padding，就不加。
- 間距是 **1/8 個 CJK 字寬（`0.125ic`）**。規格註解說傳統上是 1/4，比例字排版常用 1/6 或更窄，CSS 因為預設開啟所以取保守的 1/8。
- 預設行為是 `insert`：原本已經有空白（Unicode 類別 Z）的地方不再加。
- 間距疊加在 `letter-spacing`、`word-spacing` 之上。元素邊界上的間距由包含該邊界的最內層元素負責繪製，所以 `中文<strong>English</strong>` 這種跨元素的情況也會加。

**Chromium 的實作**：

- 140 起只支援 `normal` 與 `no-autospace`。`normal` 等於 `ideograph-alpha ideograph-numeric`。
- **Chromium（以及 Safari、Firefox）的初始值是 `no-autospace`，不是規格的 `normal`**（BCD 註記，見 csswg-drafts #12386）。所以 theme 要自己寫 `text-autospace: normal` 才會生效。

**對 Lattice 的實際效果**：

- 筆記裡「Obsidian 的設定」這類沒打空白的混排，會自動多出 1/8 字寬的間距；已經手動打了空白的地方不會變成兩倍。
- 間距固定是 1/8，不能調。clreq 的上限是 1/4，1/8 在範圍內，但通常比手動打的空白窄。同一篇筆記裡有的地方手動打空白、有的地方沒打，寬度會不一致。

來源：
[CSS Text 4 §8.4 text-autospace](https://drafts.csswg.org/css-text-4/#text-autospace-property)、
[MDN text-autospace](https://developer.mozilla.org/en-US/docs/Web/CSS/text-autospace)、
[BCD text-autospace.json](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-autospace.json)、
[csswg-drafts #12386](https://github.com/w3c/csswg-drafts/issues/12386)、
[chromestatus 5202578236768256](https://chromestatus.com/feature/5202578236768256)。

### 3.4 `line-break`（換行嚴格度）

- 值：`auto`（初始值）、`loose`、`normal`、`strict`、`anywhere`。
- 規格只規定幾個差異，其餘交給瀏覽器依語言慣例決定。和中文有關的：
  - `normal`、`loose` 允許在 `〜`、`゠` 前斷行；`strict` 不允許。
  - `normal`、`strict` 禁止在日文小假名、長音符「ー」、疊字符「々」「ゝ」前斷行；`loose` 允許。
  - 只有 `loose` 允許在「：；！？」等置中標點前斷行。
  - `anywhere` 在任何字元間都能斷，連禁則都不管，像終端機。
- clreq 的「基本」行首行尾禁則（句號、逗號、結束括號不在行首；開始括號不在行尾）在 `auto`／`normal`／`strict` 下都由 Unicode 換行規則（UAX #14）處理，不需要額外設定。
- 對繁中為主、夾日文的筆記，`strict` 與預設的差別只在日文小假名、長音、疊字符與 `〜` 前後，差異很小。

來源：[CSS Text 4 §6.2 line-break](https://drafts.csswg.org/css-text-4/#line-break-property)、[BCD line-break.json](https://github.com/mdn/browser-compat-data/blob/main/css/properties/line-break.json)、[clreq §6.1.1](https://www.w3.org/TR/clreq/#prohibition_rules_for_line_start_end)。

### 3.5 `word-break`

- `normal`（初始值）：中文字之間都能斷；英文單字不斷。這正是中文內文要的。
- `keep-all`：CJK 字之間也不斷，只在空白與標點處斷。適合韓文，**不適合中文**（沒有空白的長句會整句不斷）。
- `break-all`：英文單字中間也能斷，會把夾在中文裡的英文單字切開，違反 clreq §6.1.4（西文單詞除了連字號處之外不得拆成兩行）。
- `auto-phrase`：Chromium 只對 `lang` 解析成 `ja`、`ko` 的文字有效，中文等同 `normal`。Obsidian 的 `<html lang>` 跟著介面語言，對 Lattice 沒有用處。

來源：[BCD word-break.json](https://github.com/mdn/browser-compat-data/blob/main/css/properties/word-break.json)、[clreq §6.1.4](https://www.w3.org/TR/clreq/#x6-1-4-handling-western-text-in-chinese-text-using-proportional-western-fonts)。

### 3.6 `overflow-wrap`

- `break-word`、`anywhere`：一個「字」（例如長網址）放不下整行時，允許在中間斷開。兩者差在 `anywhere` 斷出來的位置會算進最小內容寬度，`break-word` 不會。
- 不影響一般中文換行，只處理溢出。
- 本機驗證：Obsidian 1.13.7 的 `app.css` 已經在檔案樹、選單、搜尋結果等地方用了 `overflow-wrap: anywhere` 或 `word-break: break-word`；編輯器的外部連結也設了 `word-break: break-all`。內文不需要 theme 另外處理。

來源：[BCD overflow-wrap.json](https://github.com/mdn/browser-compat-data/blob/main/css/properties/overflow-wrap.json)、本機驗證（`obsidian-1.13.7.asar`）。

### 3.7 `hanging-punctuation`

- Chromium 完全沒有實作（BCD：`false`；chromestatus 仍是 Proposed）。只有 Safari 支援。
- 就算支援，clreq §6.1.3 也說：台灣、香港的點號置中，**橫排時不做行尾懸掛**，只用於直排。Han.css 預設也對 `zh-Hant` 關閉懸掛。所以對 Lattice 沒有損失。

來源：[BCD hanging-punctuation.json](https://github.com/mdn/browser-compat-data/blob/main/css/properties/hanging-punctuation.json)、[chromestatus 5196301767278592](https://chromestatus.com/feature/5196301767278592)、[clreq §6.1.3](https://www.w3.org/TR/clreq/#hanging_punctuation_marks_at_line_end)、[Han.css `_hanging.sass`](https://github.com/ethantw/Han/blob/master/src/sass/inline/_hanging.sass)。

### 3.8 `font-feature-settings`（`halt`、`palt`、`chws`）

`font-feature-settings` 本身 Chromium 48 起就無前綴支援；能不能用要看字型。

| feature | 作用（OpenType 規格） | `Noto Sans CJK TC` | 要不要用 |
| --- | --- | --- | --- |
| `halt` | 把全形 glyph 一律排成半形寬（非依上下文）。規格說：排版引擎若已經自己處理 clreq／jlreq 的進階排版，就**不應該**再開它。 | 有 | 不要在內文開。會讓所有標點都變半形，而且會讓 Chromium 停用 `text-spacing-trim`。 |
| `palt` | 把全形 glyph 改成各自的比例寬度（字與標點都會變窄）。屬於「可選」feature。 | 有 | 內文不要。可以考慮只用在大標題做視覺緊排，要 prototype 確認繁中效果。同樣會停用 `text-spacing-trim`。 |
| `chws` | 依上下文把相鄰的全形標點擠成半形（例如「）」後接「、」）。 | **沒有** | 字型沒有，寫了也沒效果。 |

另外 `fwid` 會把引號 `“”` 換成全形寬。Chromium 在判斷彎引號是不是全形時，註解寫明「Adobe 用 `fwid` 切換到 CJK 字形的慣例目前不支援」。

來源：
[OpenType feature registry：chws](https://learn.microsoft.com/en-us/typography/opentype/spec/features_ae#chws)、
[halt](https://learn.microsoft.com/en-us/typography/opentype/spec/features_fj#halt)、
[palt](https://learn.microsoft.com/en-us/typography/opentype/spec/features_pt#palt)、
[Chromium `han_kerning.cc`（`ExclusiveFeatures()`）](https://chromium.googlesource.com/chromium/src/+/refs/tags/142.0.7444.265/third_party/blink/renderer/platform/fonts/shaping/han_kerning.cc)、本機驗證。

### 3.9 `text-align: justify` 與 `text-justify`

- **`text-align: justify` 在 142 就能讓中文正確兩端對齊。** Chromium 計算對齊的可伸展位置時，除了空白之外，還會把每個 CJK 漢字與符號（`IsCJKIdeographOrSymbol`）兩側算進去，所以中文行會平均拉開字距，而不是只拉開英文詞距。
- `text-justify`（145 起）：`auto`、`none`、`inter-word`、`inter-character`。`inter-character` 會連英文字母之間也拉開，對中英混排**不好看**；預設 `auto` 已經是我們要的行為。所以 142 沒有 `text-justify` 不影響 Lattice。
- clreq §6.2.2.1：中文書籍內文「原則上應該進行兩端對齊」，很少靠左不齊。heti 也是 CJK 段落 `text-align: justify`、非 CJK 段落改回 `start`。
- 注意：兩端對齊時，最後一行以外，若一行只有少數幾個字加上一個長英文單字或網址，字距會被拉得很開。

來源：
[Chromium `character.cc`（`ExpansionOpportunityCount`）](https://chromium.googlesource.com/chromium/src/+/refs/tags/142.0.7444.265/third_party/blink/renderer/platform/text/character.cc)、
[Chromium `shape_result_spacing.cc`](https://chromium.googlesource.com/chromium/src/+/refs/tags/142.0.7444.265/third_party/blink/renderer/platform/fonts/shaping/shape_result_spacing.cc)、
[CSS Text 4 §7.5 text-justify](https://drafts.csswg.org/css-text-4/#text-justify-property)、
[BCD text-justify.json](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-justify.json)、
[chromestatus 5079678972985344](https://chromestatus.com/feature/5079678972985344)、
[clreq §6.2.2](https://www.w3.org/TR/clreq/#line_adjustment)、
[heti `lib/_base.scss`](https://github.com/sivan/heti/blob/master/lib/_base.scss)。

## 4. clreq 的建議

clreq（W3C〈中文排版需求〉，Group Note Draft，2026-09-01 版）只寫原則，不給 CSS 寫法。和 #7 有關的重點：

| 項目 | clreq 的說法 | 換算成 CSS |
| --- | --- | --- |
| 字的排列 | 原則上漢字與標點都是 1:1 正方形，字框緊貼排列（密排）。（§6.3.1） | `letter-spacing: 0` 是基準；疏排是特殊用途。 |
| 行長 | 行長應為字級的整數倍，行首行尾對齊。（§7.1.1） | 可用 `ic`／`em` 設行寬，例如 `40ic`。螢幕上無法完全保證整數倍。 |
| 行距 | 版心的行距（兩行之間的空白）**多半介於字級的 50%–100%**；行長短或字小時取小一點；超過字級也不會更好讀。（§7.1.1 注） | `line-height` = 1 + 行距比例，也就是 **1.5–2.0**。Obsidian 預設 `--line-height-normal: 1.5`，在範圍下限。 |
| 段首縮排 | 標準是兩個漢字；欄寬窄時可縮一字。（§6.2.1.1） | `text-indent: 2em`。 |
| 段距 | 書籍原則上段落之間**不加間距**，空一行代表一節結束；不縮排時才用段距區分段落。（§6.2.1.1） | Obsidian 用段距不用縮排（`--p-spacing: 1rem`），屬於 clreq 所說的「首行不縮排、加段距」做法；兩者擇一，不要同時用。 |
| 中西文間距 | 漢字與西文字母、數字之間用**不多於 1/4 字寬**的字距或空白；在行首行尾不加；中文標點前後、括號內側不加。（§6.3.3） | `text-autospace: normal` 的 1/8 字寬符合上限。 |
| 標點寬度 | 標點通常佔一個漢字寬。**台灣很多印刷品採用不調整的風格**，中國大陸與香港多半調整。（§6.3.2） | 想要台灣風格就寫 `text-spacing-trim: space-all`；想緊湊就用預設 `normal`。 |
| 相鄰標點 | 不論哪種風格，夾注符號（括號、引號）相鄰時，兩個佔 2 字寬的應縮成 1.5 字寬。（§6.3.2.2） | Chromium 的 `normal` 會做這件事。 |
| 行首行尾禁則 | 「基本」級：點號、結束引號／括號、連接號、間隔號不在行首；開始引號／括號不在行尾。這是最推薦的級別。（§6.1.1） | 瀏覽器預設已處理。 |
| 行尾懸掛 | 港台點號置中，**橫排不做行尾懸掛**。（§6.1.3） | 不需要 `hanging-punctuation`。 |
| 刪節號 | 佔兩字，用兩個 `…`（U+2026），不可拆成兩行。（§5.4.1） | 屬於書寫習慣，theme 不處理。 |
| 字級 | 內文最小可接受約 7.875pt（≒ 2.8mm）。（§7.1.1） | 螢幕上 16px 以上不成問題。 |

來源：[clreq](https://www.w3.org/TR/clreq/)（本文引用的節次都在同一份文件內：[§5.4.1](https://www.w3.org/TR/clreq/#h_ellipsis)、[§6.1.1](https://www.w3.org/TR/clreq/#prohibition_rules_for_line_start_end)、[§6.1.3](https://www.w3.org/TR/clreq/#hanging_punctuation_marks_at_line_end)、[§6.2.1.1](https://www.w3.org/TR/clreq/#first_line_indents)、[§6.3](https://www.w3.org/TR/clreq/#x6-3-text-spacing)、[§7.1.1](https://www.w3.org/TR/clreq/#page_design)）。

## 5. Han.css 與 heti：哪些能用純 CSS 做到

兩個專案的做法分成「純 CSS」與「要 JavaScript 改 DOM」兩類。Lattice 不寫 plugin，所以只能用前者；後者有一部分可以用新的原生屬性取代。

| 功能 | Han.css | heti | 在 Lattice 能不能做 |
| --- | --- | --- | --- |
| 中西文間距 | JS 插入 `<h-hws>` 元素，寬度約 1/4em | JS（`heti-addon.js`）插入 `<heti-spacing>`，左右 `0.25em` margin | ❌ 不能插元素。✅ 改用 `text-autospace: normal`（1/8 字寬，不能調）。 |
| 標點擠壓 | JS 把標點包成 `<h-char>` 再用負 margin／`letter-spacing: -.5em`；`zh-Hant` 的句讀不擠 | JS 插入 `<heti-adjacent>`，負 margin；同時對它設 `text-spacing-trim: space-all` 避免和瀏覽器原生擠壓疊加 | ❌ 不能插元素。✅ 改用原生 `text-spacing-trim`。 |
| 行尾懸掛 | JS + 絕對定位；`zh-Hant` 預設關閉 | 有 mixin，但同樣需要包元素 | ❌，而且 clreq 也說繁中橫排不需要。 |
| 行高 | `1.3` | `1.5`（`$line-height-normal`） | ✅ |
| 字距 | — | CJK 段落 `letter-spacing: 0.02em`；`a`、`code`、英文段落歸零 | ✅ 但 theme 抓不到「這段是中文」，見 6.2。 |
| 兩端對齊 | — | CJK 段落 `text-align: justify`，非 CJK 回到 `start` | ✅（只能整體套用）。 |
| 段首縮排 | `2em` 常數 | `$text-indent-length: 2em` | ✅ `text-indent`，但要決定和段距擇一。 |
| 行寬 | — | `$line-length: 42em` | ✅ Obsidian 的 `--file-line-width`（預設 700px，16px 字約 44 字）。 |
| 強調不用斜體 | `em:lang(zh)` 改成著重號（`text-emphasis`） | `em` 改粗體、`font-style: normal`；非 CJK 才斜體 | ✅ `font-style: normal` 加粗或改用 `text-emphasis`；但 Obsidian 不知道哪段是中文，見 6.2。 |
| 中文引號 | — | `q` 的 `quotes` 設成「」『』 | Markdown 沒有 `<q>`，用不到。 |

來源：
[Han.css `_hws.sass`](https://github.com/ethantw/Han/blob/master/src/sass/inline/_hws.sass)、
[`_jiya.sass`](https://github.com/ethantw/Han/blob/master/src/sass/inline/_jiya.sass)、
[`_hanging.sass`](https://github.com/ethantw/Han/blob/master/src/sass/inline/_hanging.sass)、
[`_em.sass`](https://github.com/ethantw/Han/blob/master/src/sass/inline/_em.sass)、
[`_const.sass`](https://github.com/ethantw/Han/blob/master/src/sass/locale/_const.sass)；
[heti `_variables.scss`](https://github.com/sivan/heti/blob/master/lib/_variables.scss)、
[`_base.scss`](https://github.com/sivan/heti/blob/master/lib/_base.scss)、
[`_inline.scss`](https://github.com/sivan/heti/blob/master/lib/_inline.scss)、
[`helpers/_add-on.scss`](https://github.com/sivan/heti/blob/master/lib/helpers/_add-on.scss)；
Obsidian 預設值為本機讀取 1.13.7 `app.css` 得知。

## 6. 對 Lattice 的建議

以下是建議，最終決定由 #7 的 grilling／prototype 負責。

### 6.1 可以直接採用

- **`text-autospace: normal`**：142 就能用，Android 也能用。中英之間沒打空白的地方自動補 1/8 字寬，有打空白的不重複加。套在內文容器（閱讀模式與編輯器）即可。
- **明確決定 `text-spacing-trim`**：不寫也已經是 `normal`（擠壓相鄰標點）。建議在 prototype 裡把 `normal` 和 `space-all` 並排比較，然後**明確寫出來**，免得以後換字型或 Chromium 改預設時行為變了。用 `Noto Sans CJK TC` 時，置中的「，。、」本來就不會被擠，差別只在括號、引號相鄰的地方。
- **`text-align: justify`**：142 就能正確拉開中文字距，符合 clreq「原則上兩端對齊」。
- **`line-height` 落在 1.5–2.0**：clreq 的行距範圍。Obsidian 預設 1.5 是下限，可以在 prototype 裡試 1.6–1.8。
- **行寬用 `ic` 或 `em` 思考**：例如 `--file-line-width` 設成約 35–45 個字寬，讓一行的字數可預期。
- **`text-wrap: pretty`**（117 起）：減少段落最後一行只剩一兩個字（clreq §7.1.2 的孤字問題）。
- **`word-break`、`line-break`、`overflow-wrap` 維持預設**：預設就符合中文需求，Obsidian 也已經處理長網址。

### 6.2 要小心

- **`text-justify` 需要 145**：本機 142 沒有。好在預設的 `auto` 已經足夠，不需要用；若一定要用，先重新安裝 Obsidian（Electron 43／Chromium 150）。
- **`letter-spacing`（heti 的 0.02em）**：會同時加在英文上，拉開 Inter 的字距；heti 是靠 `:lang()` 只套在中文段落，但 Obsidian 的 `lang` 跟著介面語言，不知道內容是什麼語言。若要加，只能全域加一個很小的值，或乾脆維持 0（clreq 的密排原則）。
- **兩端對齊遇到長英文詞或網址**：該行的中文字距會被拉得很開。要在樣本庫裡放這類段落實測。
- **段首縮排與段距擇一**：clreq 的書籍慣例是縮排兩字、段落間不留空；Obsidian 預設是加段距不縮排。專案筆記（清單、標題、任務多）不適合縮排，可能只對文章用，這要在 #7 決定。
- **強調（`*斜體*`）的處理**：中文沒有斜體字形，`Noto Sans CJK TC` 只能由瀏覽器用合成斜體（把正體字形斜切）顯示。改成粗體或 `text-emphasis` 會連英文也一起改，因為 theme 判斷不出語言。
- **`palt` 只考慮用在大標題**：會讓 `text-spacing-trim` 在該元素上失效，也會改變繁中置中標點的寬度，要實際看效果。
- **編輯器（CodeMirror 6）裡的效果**：`text-autospace`、`text-spacing-trim` 會改變字元寬度。CodeMirror 靠 DOM 量測游標位置，理論上沒問題，但要在 Live Preview 裡實際打字、選取、移動游標確認。
- **Android**：WebView 通常比桌面新，屬性都能用；但字型由系統 fallback 決定（見 [noto-sans-cjk 研究](https://github.com/yurenju/obsidian-lattice/blob/research/noto-sans-cjk/docs/research/noto-sans-cjk.md)），標點位置與擠壓效果可能和桌面不同。依地圖的原則，盡力而為。

### 6.3 不能用

- **`hanging-punctuation`**：Chromium 不支援；clreq 也說繁中橫排不需要。
- **`text-autospace` 的細項值**（`ideograph-alpha`、`ideograph-numeric`、`punctuation`、`replace`、`auto`）：Chromium 只有 `normal`／`no-autospace`。也就是說，**不能只對數字加、只對字母加，也不能改間距大小**。
- **`text-spacing-trim` 的 `trim-both`、`trim-all`、`auto`**：沒有瀏覽器實作。
- **在內文開 `halt`／`palt`**：會停用 `text-spacing-trim`，而且 `halt` 會把所有標點都變半形。
- **`chws`**：`Noto Sans CJK TC` 沒有這個 feature。
- **`word-break: keep-all`、`break-all`、`auto-phrase`**：前兩者破壞中文或英文換行；`auto-phrase` 對中文無效。
- **Han.css／heti 的 JavaScript 功能**（插入元素的中西文間距、標點擠壓、行尾懸掛）：theme 不能執行 JS，用 6.1 的原生屬性取代。
