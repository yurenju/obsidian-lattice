// Lattice theme 檢查腳本：貼到 Obsidian 的 DevTools console（Ctrl+Shift+I → Console）執行。
// 會檢查目前開著的所有 markdown 分頁（Reading view 與 Live Preview 都會看），
// 會自動從頭捲到尾逐段量測（量完捲回原位），深淺兩種模式各量一次，
// 最後把結果複製到剪貼簿。執行時畫面會捲動、閃爍，約需幾秒。
(async () => {
  const R = [];
  let ctx = "";
  const cs = (el, pseudo) => getComputedStyle(el, pseudo);
  const px = (v) => parseFloat(v);
  const rgb = (h) => `rgb(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(", ")})`;
  const push = (name, ok, actual, expected) =>
    R.push({ ctx, name, ok, actual: String(actual).slice(0, 90), expected: String(expected) });
  const eq = (name, a, e) => push(name, String(a) === String(e), a, e);
  const near = (name, a, e) => push(name, Math.abs(px(a) - e) <= 0.6, a, e.toFixed(2) + "px");
  const has = (name, a, sub) => push(name, String(a).includes(sub), a, "含 " + sub);
  const color = (name, a, hex) => eq(name, a, rgb(hex));
  // 找到時記下「這個選擇器在這個情境找到過」，合併時用來拿掉其他捲動位置的「找不到」
  const seen = new Set();
  const at = (root, sel, fn) => {
    const el = root.querySelector(sel);
    if (el) { seen.add(`${ctx}\u0000${sel}`); fn(el, cs(el)); }
    else push(sel, null, "找不到元素", "");
  };

  // ---------- 全域 ----------
  ctx = "全域";
  eq("套用的 theme", app.customCss?.theme, "Lattice");
  eq("body font-synthesis", cs(document.body).fontSynthesis, "none");
  eq(".app-container --font-text-size", cs(document.querySelector(".app-container")).getPropertyValue("--font-text-size").trim(), "16px");

  // ---------- 字型 ----------
  ctx = "字型";
  const aliases = [
    ["Lattice CJK", "350", "中"],
    ["Lattice CJK", "700", "中"],
    ["Lattice CJK Punct", "350", "“"],
    ["Lattice CJK Heading", "700", "中"],
    ["Lattice Serif", "300", "中"],
    ["Lattice Serif", "700", "中"],
    ["Lattice Emoji", "400", "🛠"],
  ];
  for (const [family, w, text] of aliases) {
    try { await document.fonts.load(`${w} 16px "${family}"`, text); } catch (e) {}
    const faces = [...document.fonts].filter((f) => f.family.replace(/"/g, "") === family);
    const statuses = faces.map((f) => `${f.weight}:${f.status}`).join(" ");
    push(`@font-face ${family} ${w}`, faces.some((f) => f.status === "loaded"), statuses || "沒有定義", "至少一個 loaded");
  }
  const cv = document.createElement("canvas").getContext("2d");
  const width = (font, t) => { cv.font = `32px ${font}`; return cv.measureText(t).width; };
  // 用英數字量寬度：中文字在任何字型裡都是全形，量不出差別
  for (const [family, fb, t] of [["JetBrains Mono", "monospace", "il0O=>"], ["Noto Sans CJK TC", "serif", "AaBbWwIi@123"], ["Noto Serif CJK TC", "sans-serif", "AaBbWwIi@123"]]) {
    const ok = width(`"${family}", ${fb}`, t) !== width(fb, t);
    push(`已安裝 ${family}`, ok, ok ? "是" : "否（退回預設字型）", "是");
  }

  // ---------- 各分頁 ----------
  const palettes = {
    dark: { normal: "#d1d1d1", muted: "#999999", faint: "#666666", inline: "#333333", code: "#2c2c2c", th: "#4a4a4a", quote: "#555555", strike: "#4a4a4a", box: "#666666", border: "#363636" },
    light: { normal: "#363431", muted: "#5f5c57", faint: "#928f89", inline: "#dedcd8", code: "#e4e2de", th: "#c5c3bf", quote: "#b2b0ad", strike: "#c5c3bf", box: "#928f89", border: "#d7d5d1" },
  };

  function checkReading(root, P) {
    at(root, ".markdown-preview-sizer", (el, s) => near("行寬 max-width", s.maxWidth, 736));
    at(root, ".el-p > p", (el, s) => {
      eq("段落 text-align", s.textAlign, "justify");
      near("段落 font-size", s.fontSize, 16);
      near("段落 line-height", s.lineHeight, 16 * 1.7);
      eq("段落 font-weight", s.fontWeight, "350");
      eq("段落 text-wrap", s.textWrap || s.textWrapStyle, "pretty");
      color("段落 color", s.color, P.normal);
    });
    at(root, ".inline-title", (el, s) => eq("inline title font-weight", s.fontWeight, "700"));
    at(root, "h1", (el, s) => { near("h1 font-size", s.fontSize, 25.6); eq("h1 font-weight", s.fontWeight, "700"); has("h1 font-family", s.fontFamily, "Lattice Emoji"); });
    at(root, "h2", (el, s) => { near("h2 font-size", s.fontSize, 20.8); eq("h2 border-bottom", s.borderBottomStyle, "none"); });
    at(root, "h3", (el, s) => { eq("h3 text-transform", s.textTransform, "uppercase"); near("h3 letter-spacing", s.letterSpacing, 0.96); color("h3 color", s.color, P.muted); });
    at(root, "h4", (el, s) => color("h4 color", s.color, P.faint));
    at(root, "em", (el, s) => { eq("em font-style", s.fontStyle, "normal"); eq("em 底線樣式", s.textDecorationStyle, "dotted"); });
    at(root, "blockquote", (el, s) => {
      const em = px(s.fontSize);
      eq("引言線 style", s.borderLeftStyle, "double");
      near("引言線 width", s.borderLeftWidth, 5);
      color("引言線 color", s.borderLeftColor, P.quote);
      near("引言 font-size", s.fontSize, 15);
      near("引言 line-height", s.lineHeight, 15 * 1.65);
      eq("引言 font-weight", s.fontWeight, "300");
      has("引言 font-family", s.fontFamily, "Lattice Serif");
      near("引言 margin-left（1em）", s.marginLeft, em);
      near("引言 padding-left（0.75em）", s.paddingLeft, 0.75 * em);
      color("引言 color", s.color, P.normal);
    });
    at(root, "blockquote blockquote", (el, s) => eq("巢狀引言線 style", s.borderLeftStyle, "double"));
    calloutChecks(root, P, true);
    at(root, ":not(pre) > code", (el, s) => { color("行內程式碼底", s.backgroundColor, P.inline); near("行內程式碼圓角", s.borderTopLeftRadius, 3); });
    at(root, "pre", (el, s) => { color("程式碼區塊底", s.backgroundColor, P.code); near("程式碼區塊圓角", s.borderTopLeftRadius, 4); eq("程式碼 white-space", s.whiteSpace, "pre-wrap"); });
    at(root, "pre code", (el, s) => near("程式碼 line-height（1.5）", s.lineHeight, px(s.fontSize) * 1.5));
    tableChecks(root, P, "td");
    taskChecks(root, P, "li.task-list-item");
    at(root, ".metadata-properties-heading", (el, s) => eq("Properties 標題列 display", s.display, "none"));
    at(root, ".metadata-property-key", (el, s) => near("Properties 標籤字級", s.fontSize, 13));
  }

  function checkLive(root, P) {
    at(root, ".cm-sizer", (el, s) => near("行寬 max-width", s.maxWidth, 736));
    at(root, '.cm-line:not([class*="HyperMD-"])', (el, s) => { eq("段落 text-align", s.textAlign, "justify"); near("段落 line-height", s.lineHeight, 16 * 1.7); eq("段落 font-weight", s.fontWeight, "350"); });
    at(root, ".HyperMD-header-1", (el, s) => { near("h1 padding-top", s.paddingTop, 8); near("h1 padding-bottom", s.paddingBottom, 8); near("h1 font-size", s.fontSize, 25.6); has("h1 font-family", s.fontFamily, "Lattice Emoji"); });
    at(root, ".HyperMD-header-3", (el, s) => { eq("h3 text-transform", s.textTransform, "uppercase"); color("h3 color", s.color, P.muted); });
    at(root, ".cm-em", (el, s) => { eq("em font-style", s.fontStyle, "normal"); eq("em 底線樣式", s.textDecorationStyle, "dotted"); });
    at(root, ".HyperMD-quote:not(.cm-active)", (el, s) => {
      near("引言 font-size", s.fontSize, 15);
      has("引言 font-family", s.fontFamily, "Lattice Serif");
      const b = cs(el, "::before");
      eq("引言線 style", b.borderLeftStyle, "double");
      color("引言線 color", b.borderLeftColor, P.quote);
    });
    calloutChecks(root, P, false);
    at(root, ".cm-inline-code:not(.cm-formatting)", (el, s) => { color("行內程式碼底", s.backgroundColor, P.inline); near("行內程式碼圓角", s.borderTopLeftRadius, 3); });
    at(root, ".HyperMD-codeblock:not(.HyperMD-codeblock-begin):not(.HyperMD-codeblock-end)", (el, s) => near("程式碼 line-height（1.5）", s.lineHeight, px(s.fontSize) * 1.5));
    at(root, ".cm-table-widget", (el) => push("寬表格沒有捲軸", el.scrollWidth <= el.clientWidth, `${el.scrollWidth} / ${el.clientWidth}`, "scrollWidth ≤ clientWidth"));
    at(root, ".cm-table-widget td .table-cell-wrapper", (el, s) => { near("儲存格內距 上", s.paddingTop, 6); near("儲存格內距 左（1.25em）", s.paddingLeft, 1.25 * px(s.fontSize)); });
    tableChecks(root, P, ".cm-table-widget td");
    taskChecks(root, P, ".HyperMD-task-line");
  }

  function calloutChecks(root, P, indented) {
    at(root, ".callout", (el, s) => {
      eq("callout 線 style", s.borderLeftStyle, "double");
      near("callout 線 width", s.borderLeftWidth, 5);
      if (indented) near("callout margin-left（1em）", s.marginLeft, px(s.fontSize));
      else near("callout margin-left（Live Preview 不縮排）", s.marginLeft, 0);
      eq("callout padding", s.padding, "8px 12px 8px 8px");
      eq("callout 底色", s.backgroundColor, "rgba(0, 0, 0, 0)");
      near("callout 圓角", s.borderTopLeftRadius, 0);
    });
    at(root, ".callout-title-inner", (el, s) => { color("callout 標題 color", s.color, P.normal); eq("callout 標題 font-weight", s.fontWeight, "700"); });
    at(root, ".callout-content", (el, s) => near("callout 內容 padding-top", s.paddingTop, 8));
  }

  function tableChecks(root, P, tdSel) {
    at(root, tdSel, (el, s) => {
      near("td font-size（14px）", s.fontSize, 14);
      eq("td 直線", s.borderLeftStyle, "none");
      color("td 底線", s.borderBottomColor, P.border);
      eq("td 數字", s.fontVariantNumeric, "tabular-nums");
      if (tdSel === "td") { near("td 內距 左（1.25em）", s.paddingLeft, 17.5); near("td line-height（1.5）", s.lineHeight, 21); }
    });
    at(root, "th", (el, s) => {
      color("th 底線", s.borderBottomColor, P.th);
      color("th color", s.color, P.muted);
      eq("th font-weight", s.fontWeight, "700");
      if (!el.hasAttribute("align")) eq("th text-align", s.textAlign, "left");
    });
    at(root, "th[align]", (el, s) => push("有對齊的 th 照原本對齊", s.textAlign !== "left" || el.getAttribute("align") === "left", s.textAlign, el.getAttribute("align")));
  }

  function taskChecks(root, P, itemSel) {
    at(root, "input.task-list-item-checkbox", (el, s) => eq("checkbox 圓形", s.borderTopLeftRadius, "50%"));
    at(root, `${itemSel}[data-task="x"]`, (el, s) => { has("已完成 刪除線", s.textDecorationLine, "line-through"); color("已完成 color", s.color, P.faint); });
    at(root, `${itemSel}[data-task="-"]`, (el, s) => {
      has("取消 刪除線", s.textDecorationLine, "line-through");
      color("取消 刪除線 color", s.textDecorationColor, P.strike);
      color("取消 color", s.color, P.faint);
      const cb = el.querySelector("input.task-list-item-checkbox");
      if (cb) {
        color("取消 checkbox 框", cs(cb).borderTopColor, P.box);
        eq("取消 checkbox 底", cs(cb).backgroundColor, "rgba(0, 0, 0, 0)");
        has("取消 checkbox 橫線 mask", cs(cb, "::after").webkitMaskImage, "M3 7h8");
      }
    });
    at(root, ".tasks-list-text .task-due, .tasks-list-text .task-scheduled", (el, s) => color("Tasks 日期 color", s.color, P.faint));
    at(root, ".plugin-tasks-toolbar input", (el, s) => { eq("Tasks 工具列輸入框底", s.backgroundColor, "rgba(0, 0, 0, 0)"); eq("Tasks 工具列上框", s.borderTopStyle, "none"); });
  }

  const body = document.body;
  const original = body.classList.contains("theme-dark") ? "dark" : "light";
  const other = original === "dark" ? "light" : "dark";
  // 找出實際會捲動的元素（Reading view 的 previewMode.containerEl 本身不一定會捲）
  const findScroller = (root) =>
    [root, ...root.querySelectorAll("*")].find((e) => {
      const o = getComputedStyle(e).overflowY;
      return (o === "auto" || o === "scroll") && e.scrollHeight > e.clientHeight + 1;
    }) ?? root;
  const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150))));

  // 深淺各量一次（暫時換 body class，量完立刻換回）
  function measure(label, root, check) {
    for (const mode of [original, other]) {
      if (mode !== original) body.classList.replace(`theme-${original}`, `theme-${other}`);
      try { ctx = `${mode}｜${label}`; check(root, palettes[mode]); }
      finally { if (mode !== original) body.classList.replace(`theme-${other}`, `theme-${original}`); }
    }
  }

  // Obsidian 只畫出畫面附近的內容，所以從頭捲到尾、每個位置都量一次，最後捲回原位
  for (const leaf of app.workspace.getLeavesOfType("markdown")) {
    const v = leaf.view;
    const name = v.file?.basename ?? "?";
    let label, root, scroller, check;
    if (v.getMode() === "preview") {
      label = `Reading｜${name}`;
      root = v.previewMode.containerEl;
      scroller = findScroller(root);
      check = (r, P) => {
        checkReading(r, P);
        // 診斷：最外層段落的父元素是不是 .el-p（兩端對齊靠這個選擇器）
        const p = r.querySelector(".markdown-preview-sizer > div > p");
        if (p) push("最外層段落的父元素", p.parentElement.classList.contains("el-p"), p.parentElement.className, "el-p");
      };
    } else {
      root = v.contentEl.querySelector(".markdown-source-view");
      if (!root.classList.contains("is-live-preview")) continue;
      label = `Live Preview｜${name}`;
      scroller = root.querySelector(".cm-scroller") ?? findScroller(root);
      check = checkLive;
    }
    const saved = scroller.scrollTop;
    const step = Math.max(200, scroller.clientHeight * 0.6);
    for (let y = 0; ; y += step) {
      scroller.scrollTop = y;
      await settle();
      measure(label, root, check);
      if (y + scroller.clientHeight >= scroller.scrollHeight) break;
    }
    scroller.scrollTop = saved;
  }

  // 合併同一項在各捲動位置的結果：任一次失敗算失敗，否則任一次通過算通過，都沒量到算找不到
  const merged = new Map();
  for (const r of R) {
    if (r.ok === null && seen.has(`${r.ctx}\u0000${r.name}`)) continue;
    const key = `${r.ctx}\u0000${r.name}`;
    const prev = merged.get(key);
    if (!prev || r.ok === false || (r.ok === true && prev.ok === null)) {
      if (!(prev && prev.ok === false)) merged.set(key, r);
    }
  }
  const all = [...merged.values()];
  const fails = all.filter((r) => r.ok === false);
  const missing = all.filter((r) => r.ok === null);
  console.log(`Lattice 檢查：${all.length} 項，通過 ${all.length - fails.length - missing.length}，失敗 ${fails.length}，找不到元素 ${missing.length}`);
  if (fails.length) console.table(fails);
  const report = [
    `總計 ${all.length}｜失敗 ${fails.length}｜找不到 ${missing.length}`,
    ...fails.map((r) => `✗ [${r.ctx}] ${r.name}：期望 ${r.expected}，實際 ${r.actual}`),
    ...missing.map((r) => `? [${r.ctx}] ${r.name}`),
  ].join("\n");
  try { copy(report); console.log("結果已複製到剪貼簿"); }
  catch (e) { await navigator.clipboard.writeText(report).then(() => console.log("結果已複製到剪貼簿"), () => console.log(report)); }
})();
