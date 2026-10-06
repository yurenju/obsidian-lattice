# Noto Sans CJK 在 Windows 與 Android 上的載入方式

> 研究票：[#2](https://github.com/yurenju/obsidian-lattice/issues/2)（地圖：[#1](https://github.com/yurenju/obsidian-lattice/issues/1)）
> 調查日期：2026-10-05。環境：Windows 11（OS Build 26200）、Obsidian 1.13.7。

每一節最後標註來源。「本機驗證」指在上述 Windows 環境以 WPF `GlyphTypeface` 讀取字型檔的 name 表與 cmap 得到的結果。

## 1. 有哪些版本、`font-family` 名稱各是什麼

Noto Sans CJK 與 Adobe 的 Source Han Sans 是同一套字型，由 [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk) 發行。同一套字型有好幾種封裝方式，名稱也不一樣，分成兩大類：

| 類別 | `font-family` 名稱 | 收錄的字 | 地區字形 | 字重 |
| --- | --- | --- | --- | --- |
| 語言專用（Language-specific）OTF／OTC／Super OTC／VF | `Noto Sans CJK TC`（另有 `SC`、`JP`、`KR`、`HK`） | 全部 CJK 字（每個字型 65,535 個 glyph 上限） | **五個地區的字形都在檔案裡**，預設用名稱上的地區，其他地區靠 OpenType `locl` + 語言標記切換 | 7 個：Thin、Light、DemiLight、Regular、Medium、Bold、Black（VF 為 wght 100–900） |
| 地區子集（Region-specific Subset）OTF／VF | `Noto Sans TC`（另有 `SC`、`JP`、`KR`、`HK`） | 只收該地區字集需要的字 | 只有該地區的字形 | 同上 |

- Google Fonts 上的「Noto Sans Traditional Chinese」就是地區子集版，`font-family` 名稱是 `Noto Sans TC`，單一 variable font（`NotoSansTC[wght].ttf`，wght 100–900）。
- 等寬版 `Noto Sans Mono CJK TC` 只有 Regular 與 Bold。
- 本機驗證：使用者安裝的 Super OTC（`NotoSansCJK.ttc`，約 117 MB）裡共 45 個 face，typographic family 名稱是 `Noto Sans CJK TC`／`SC`／`JP`／`KR`／`HK` 與 `Noto Sans Mono CJK *`；Win32 舊式 family 名稱則把非 Regular/Bold 的字重拆成 `Noto Sans CJK TC Light`、`Noto Sans CJK TC Medium` 等。CSS 寫 `"Noto Sans CJK TC"` 再用 `font-weight` 指定字重即可。
- 下載大小（Sans 2.004 release）：Super OTC zip 約 95 MB；`NotoSansCJKtc-VF.ttf` 約 36 MB；子集 `NotoSansTC-Regular.otf` 單一字重約 5.7 MB。

來源：
[noto-cjk README](https://github.com/notofonts/noto-cjk/blob/main/README.md)、
[noto-cjk Sans/README](https://github.com/notofonts/noto-cjk/blob/main/Sans/README.md)、
[Source Han Sans README（部署格式說明）](https://github.com/adobe-fonts/source-han-sans/blob/release/README.md)、
[noto-cjk Sans2.004 release](https://github.com/notofonts/noto-cjk/releases/tag/Sans2.004)、
[google/fonts `ofl/notosanstc/METADATA.pb`](https://github.com/google/fonts/blob/main/ofl/notosanstc/METADATA.pb)、本機驗證。

## 2. Windows 11 已內建 `Noto Sans TC`（子集版），不是 `Noto Sans CJK TC`

Microsoft 在 2025 年 3 月的預覽更新（Windows 11 24H2 為 [KB5053656](https://support.microsoft.com/en-us/topic/march-27-2025-kb5053656-os-build-26100-3624-preview-4c35f1c4-1ae6-41ef-a317-3d8ee2e73975)，OS Build 26100.3624）與 Google 合作加入 Noto CJK 字型，作為網站或 app 沒指定字型時的 CJK fallback。

本機驗證（`C:\Windows\Fonts`）：

| 檔案 | family | glyph 數 | 版本 |
| --- | --- | --- | --- |
| `NotoSansTC-VF.ttf`（約 11.9 MB） | `Noto Sans TC` | 20,950 | 2.04 |
| `NotoSansHK-VF.ttf` | `Noto Sans HK` | 20,940 | 2.04 |
| `NotoSerifTC-VF.ttf`、`NotoSerifHK-VF.ttf` | `Noto Serif TC`／`HK` | — | — |

這是**地區子集版**。本機以 cmap 檢查各字型是否收錄下列字：

| 字 | Windows 內建 `Noto Sans TC` | `Noto Sans CJK TC`（Super OTC） | `Microsoft JhengHei` |
| --- | --- | --- | --- |
| 简、这、们（簡體字） | 無 | 有 | 有 |
| あ、ア、々（假名） | 有 | 有 | 有 |
| 込、働、畑（日本國字） | 有 | 有 | 有 |
| 峠（日本國字） | 無 | 有 | 有 |
| 한（韓文） | 無 | 有 | 無 |
| 𠮷（U+20BB7，CJK Ext. B） | 無 | 有 | 無 |

也就是說，只靠 Windows 內建的 `Noto Sans TC`，**簡體中文與部分日文漢字會掉到下一個字型**，同一行混排文字（Mixed-script text）裡會混進別套字型的字。`Noto Sans CJK TC` 才能涵蓋 Lattice 要處理的繁中／簡中／日文混排。

已知問題：同一份 KB 說明，在 96 DPI（100% 縮放）下，Chromium 系瀏覽器顯示 Noto CJK 會模糊，Microsoft 建議提高顯示縮放比例。Firefox 也因為同樣的原因，把 Windows 上 CJK 預設字型清單裡的 Noto 降到 Microsoft YaHei／JhengHei 之後（[Bugzilla 1974034](https://bugzilla.mozilla.org/show_bug.cgi?id=1974034)）。

來源：[KB5053656](https://support.microsoft.com/en-us/topic/march-27-2025-kb5053656-os-build-26100-3624-preview-4c35f1c4-1ae6-41ef-a317-3d8ee2e73975)、[Bugzilla 1974034](https://bugzilla.mozilla.org/show_bug.cgi?id=1974034)、本機驗證。（注意：[Microsoft 的 Windows 11 字型清單](https://learn.microsoft.com/en-us/typography/fonts/windows_11_font_list) 最後更新於 2022 年，尚未列出 Noto。）

## 3. 怎麼指定成 TC 地區字形

- 直接寫 `font-family: "Noto Sans CJK TC"`。語言專用版的**預設**字形就是名稱上的地區，不需要 `lang` 屬性。
- 同一個 `Noto Sans CJK TC` 檔案裡也有 SC／JP／KR／HK 的字形。瀏覽器會依元素的語言（`lang` 屬性）套用 OpenType `locl`，所以標成 `lang="ja"` 的文字即使用 `Noto Sans CJK TC` 也會顯示 JP 字形。這點和地圖「日文字形的手動切換」有關：之後若要讓某段改用 JP 字形，可以考慮靠 `lang`，也可以直接換成 `Noto Sans CJK JP`。
- Obsidian 會把 `<html lang>` 設為介面語言（設定裡的語言；未設定時取 `navigator.language`）。所以介面是英文時 `lang="en"`，`locl` 不會被觸發，`Noto Sans CJK TC` 會維持 TC 字形——符合地圖的決定（日文漢字照台灣寫法顯示也接受）。
- 地區子集版 `Noto Sans TC` 只有 TC 字形，`lang` 不會讓它變成 JP 字形。

來源：[noto-cjk Sans/README（language-tagging、locl）](https://github.com/notofonts/noto-cjk/blob/main/Sans/README.md)、[Source Han Sans README](https://github.com/adobe-fonts/source-han-sans/blob/release/README.md)；Obsidian 的 `lang` 行為為本機讀取 Obsidian 1.13.7 `obsidian.asar` 程式碼得知（`documentElement.lang` = 設定語言或 `navigator.language`），屬推論，未見官方文件。

## 4. 能不能把字型打包進 theme

- Obsidian 規定社群 theme 不能載入遠端資源（字型、圖片），所有資源必須打包。官方做法是把字型轉成 base64，用 `@font-face { src: url("data:font/woff2;base64,...") }` 嵌入 `theme.css`。
- 官方同時警告：嵌入資源會讓 theme 檔變大，下載更新、載入使用、在編輯器裡修改都會變慢。
- 實際大小：最小的選項是 `Noto Sans TC` 子集單一字重，OTF 約 5.7 MB（轉 WOFF2 後仍有數 MB）；要涵蓋簡中與日文的 `Noto Sans CJK TC` VF 約 36 MB。base64 會再膨脹約 33%，`theme.css` 會變成數十 MB。
- 結論：**不打包**。Lattice 只給自己用，直接要求事先安裝字型比較實際；也不需要為上架遵守打包規定。

來源：[Obsidian Theme guidelines（Keep assets local）](https://docs.obsidian.md/Themes/App+themes/Theme+guidelines)、[Embed fonts and images in your theme](https://docs.obsidian.md/Themes/App+themes/Embed+fonts+and+images+in+your+theme)、[noto-cjk 檔案大小（GitHub API）](https://github.com/notofonts/noto-cjk/tree/main/Sans)。

## 5. 未安裝字型時的 fallback（Windows）

Obsidian 的預設字型堆疊（本機 1.13.7 的 `app.css`）：

```css
--font-default: ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI",
  "Google Sans Flex", Roboto, "Inter Variable", "Inter", "Apple Color Emoji",
  "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
--font-text: var(--font-text-override), var(--font-text-theme), var(--font-default);
--font-interface: var(--font-interface-override), var(--font-interface-theme), var(--default-font), var(--font-default);
```

堆疊裡沒有任何 CJK 字型，所以中日文字會交給 Chromium 的逐字 fallback。Chromium 在 Windows 上的 CJK 候選順序（`font_fallback_win.cc`）：

| 文字 | 候選順序 |
| --- | --- |
| 繁體漢字、注音（`USCRIPT_TRADITIONAL_HAN`） | `Noto Sans TC` → `Noto Sans CJK TC` → `Microsoft JhengHei` → `PMingLiU` |
| 簡體漢字 | `Noto Sans SC` → `Noto Sans CJK SC` → `Microsoft YaHei` → `SimSun` |
| 假名 | `Noto Sans JP` → `Noto Sans CJK JP` → `Meiryo` → `Yu Gothic` → … |
| 韓文 | `Noto Sans KR` → `Noto Sans CJK KR` → `Malgun Gothic` → `Gulim` |

漢字屬於繁體還是簡體，Chromium 依序看元素的 `lang`、系統語系、accept-languages 決定。因為 Obsidian 的 `lang` 通常是 `en`（不帶漢字地區），實際上會依 Windows 系統語系決定；台灣語系的 Windows 會走繁體那一列。

所以：
- 什麼都沒裝、也沒有 2025 年 3 月之後的更新：漢字落到 `Microsoft JhengHei`。
- 有更新（Windows 內建 `Noto Sans TC`）：漢字落到 `Noto Sans TC`，但它沒有的字（簡體字、峠等）會再掉到別的字型。
- 不要依賴這套 fallback：它由系統語系決定，結果因機器而異。Lattice 應該在 `--font-text-theme` 明確列出字型。

來源：[Chromium `font_fallback_win.cc`](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/platform/fonts/win/font_fallback_win.cc)、[Obsidian CSS variables：Typography](https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography)；`--font-default` 實際值為本機讀取 Obsidian 1.13.7 得知。

## 6. Android（僅供參考）

- Android 系統字型設定 `fonts.xml` 裡，CJK 字型是 `NotoSansCJK-Regular.ttc`（variable，wght 100–900），分成 `lang="zh-Hans"`、`lang="zh-Hant,zh-Bopo"`、`ja`、`ko` 等**沒有名稱的 fallback family**，依語言挑 TTC 裡不同的 index。
- 沒有名稱代表網頁（Obsidian 用的 WebView）無法用 `font-family: "Noto Sans CJK TC"` 指名，只能靠 fallback；漢字用哪個地區字形，取決於 `lang` 與系統語系。系統語系是繁體中文時，應該會拿到 TC 字形；英文介面＋英文系統語系時，可能拿到 SC 或 JP 字形。
- 依地圖備註，Android 無法正確 fallback 時不處理。若之後要處理，可以研究 `@font-face { src: local(...) }` 是否能在 Android WebView 指到系統 TTC 裡的特定 face——這點未驗證。

來源：[AOSP `frameworks/base/data/fonts/fonts.xml`](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/data/fonts/fonts.xml)。Android 上的實際顯示結果未在裝置上驗證。

## 結論

**Lattice 的 CJK `font-family` 堆疊**（放在拉丁字型之後，供 `--font-text-theme`／`--font-interface-theme` 使用）：

```css
"Noto Sans CJK TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif
```

- `Noto Sans CJK TC` 放第一：有完整字集（繁中、簡中、日文假名與國字、韓文），且預設就是 TC 地區字形，符合地圖的決定。
- `Noto Sans TC` 第二：沒裝 Super OTC 時，至少還能用 Windows 內建（或 Google Fonts）的 TC 字形，但簡體字會再往下掉。
- `Microsoft JhengHei` 第三：Windows 一定有的繁中黑體，保底用。
- 最後的 `sans-serif` 讓 Android 等平台走系統 fallback。
- 不需要 `lang` 屬性，也不要寫 `:lang()` 規則來強制 TC。日文字形的手動切換留給地圖上的另一個議題。

**使用者需要事先安裝什麼**：在 Windows 上安裝 notofonts/noto-cjk 的 `Noto Sans CJK`（建議 Super OTC `NotoSansCJK.ttc`，或只裝 `NotoSansCJKtc` 語言專用版／`NotoSansCJKtc-VF.ttf`）。Windows 內建的 `Noto Sans TC` 是子集版，不夠用。Android 不需安裝（系統本來就有 Noto Sans CJK，但無法指名）。

**是否打包字型**：不打包。即使是最小的子集版也有數 MB，完整的 `Noto Sans CJK TC` 達 36 MB，base64 嵌入後 `theme.css` 會變成數十 MB；Obsidian 官方也警告會拖慢載入。Lattice 只給自己用，事先安裝即可。

**附帶注意**：在 100% 縮放（96 DPI）的螢幕上，Noto CJK 在 Chromium 裡會比 Microsoft JhengHei 模糊（KB5053656 已知問題）。主要螢幕若是高 DPI 則不受影響。
