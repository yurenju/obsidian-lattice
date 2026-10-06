# obsidian-lattice

Lattice 是個人用的 Obsidian theme，以繁體中文為主、含混排文字（英文、簡體中文、日文）的筆記為對象。設計規格見 [Lattice theme 規格（第一輪）](https://github.com/yurenju/obsidian-lattice/issues/17)。

theme 本體在 `sample-vault/.obsidian/themes/Lattice/`（`manifest.json` 與 `theme.css`）。

## 安裝

Lattice 還沒有上架 Obsidian 的社群 theme 清單，需要手動把 theme 資料夾複製到自己的 vault。

### 1. 安裝字型

theme 不打包字型，請先安裝以下三套（Inter 由 Obsidian 內建，不用另外裝）：

- Noto Sans CJK TC（完整版）：中日文正文、標題
- Noto Serif CJK TC（完整版）：引言
- JetBrains Mono：程式碼

下載來源與注意事項（例如 Windows 內建的 `Noto Sans TC` 是缺字的子集版，不能拿來替代）見 [`sample-vault/README.md`](sample-vault/README.md#theme-需要的字型)。字型裝好後要重開 Obsidian 才會抓到。

### 2. 複製 theme 資料夾

把本 repo 的 `sample-vault/.obsidian/themes/Lattice/` 整個資料夾，複製到自己 vault 的 `.obsidian/themes/` 底下，完成後的路徑會是：

```
<你的 vault>/.obsidian/themes/Lattice/
├── manifest.json
└── theme.css
```

`.obsidian` 是隱藏資料夾，在檔案總管或 Finder 裡要先開啟「顯示隱藏的項目」才看得到。`themes` 資料夾不存在的話，自己建一個即可。

用指令操作的話（在本 repo 根目錄執行，把路徑換成自己的 vault）：

```bash
cp -r sample-vault/.obsidian/themes/Lattice "/path/to/your-vault/.obsidian/themes/"
```

### 3. 在 Obsidian 啟用

1. 開啟 Obsidian 的「設定 → 外觀（Appearance）」。
2. 在「佈景主題（Themes）」旁按重新整理圖示，清單裡會出現 Lattice。
3. 選擇 Lattice。

Obsidian 版本需要 1.13.7 以上。

### 更新

theme 有新版時，用 repo 裡最新的 `theme.css` 與 `manifest.json` 覆蓋 vault 裡的舊檔。`theme.css` 存檔後 Obsidian 會自動重新載入；`manifest.json` 有變動時要重開 Obsidian。

## 試用與開發

不想動到自己的 vault，可以直接用 Obsidian 開啟本 repo 的 `sample-vault/`，裡面已經設定好使用 Lattice，也附上一批用來檢查各種元素的樣本筆記。開啟方式、樣本內容與樣式檢查腳本的用法見 [`sample-vault/README.md`](sample-vault/README.md)。
