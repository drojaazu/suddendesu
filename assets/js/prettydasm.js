var prettydasm = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/prettydasm.js
  var prettydasm_exports = {};
  __export(prettydasm_exports, {
    defaults: () => defaults,
    parseDirective: () => parseDirective,
    parseLine: () => parseLine,
    prettify: () => prettify,
    prettifyAll: () => prettifyAll
  });

  // src/archs.js
  var archs = {
    "m68k": {
      name: "Motorola M68000",
      hexNotation: "\\$",
      hexPostfix: false,
      zeroPrefix: false,
      opcodeSizes: true,
      addressBits: 24,
      absoluteShort: true,
      pcRelative: "displacement",
      pcDisplacementBase: 2,
      registers: "pc|sr|ccr|[us]sp|sp|d[0-7]|a[0-7]"
    },
    "sh2": {
      name: "Hitachi SH-2",
      hexNotation: "\\$",
      hexPostfix: false,
      zeroPrefix: false,
      opcodeSizes: true,
      addressBits: 32,
      registers: "pc|sr|gbr|r1[0-5]|r[0-9]"
    },
    "z80": {
      name: "Zilog Z80",
      hexNotation: "\\$",
      hexPostfix: false,
      zeroPrefix: false,
      opcodeSizes: false,
      addressBits: 16,
      registers: "pc|sp|af'|af|a|f|bc'|bc|b|c|de'|de|d|e|hl'|hl|h|l|ei[xy]|i|r"
    },
    "6502": {
      name: "MOS 6502",
      hexNotation: "\\$",
      hexPostfix: false,
      zeroPrefix: false,
      opcodeSizes: false,
      addressBits: 16,
      registers: "pc|sp|a|x|y|p"
    },
    "i960": {
      name: "Intel i960",
      hexNotation: "0x",
      hexPostfix: false,
      zeroPrefix: false,
      opcodeSizes: false,
      addressBits: 32,
      registers: "pc|sp|r1[0-5]|r[0-9]|g1[0-5]|g[0-9]"
    },
    "h8": {
      name: "Hitachi H8",
      hexNotation: "h'",
      hexPostfix: false,
      zeroPrefix: false,
      opcodeSizes: true,
      addressBits: 24,
      registers: "pc|ccr|r[0-7][hl]|r[0-7]"
    },
    "8086": {
      name: "Intel 8086/8088",
      hexNotation: "h",
      hexPostfix: true,
      zeroPrefix: true,
      opcodeSizes: false,
      addressBits: 20,
      registers: "pc|[acdb][xhl]|[sb]p|[sd]i|[cdse]s"
    },
    "x86": {
      name: "Intel x86 (32bit)",
      hexNotation: "h",
      hexPostfix: true,
      zeroPrefix: true,
      opcodeSizes: false,
      addressBits: 32,
      registers: "pc|e[acdb]x|[acdb][xhl]|e[sb]p|[sb]p|e[sd]i|[sd]i|[cdsefg]s|dr[0-7]|cr[0-7]|tr[3-7]"
    },
    "arm": {
      name: "ARM",
      hexNotation: "\\$",
      hexPostfix: false,
      zeroPrefix: false,
      opcodeSizes: false,
      addressBits: 32,
      registers: "pc|r1[0-5]|r[0-9]"
    },
    // Basically the same registers as 8086, but with NEC's naming variation,
    // which MAME's necdasm adopts: AW/CW/DW/BW, IX/IY, DS0/DS1/PS/SS.
    "nec-v16": {
      name: "NEC V-Series (16-bit)",
      hexNotation: "h",
      hexPostfix: true,
      zeroPrefix: true,
      opcodeSizes: false,
      addressBits: 20,
      registers: "ip|ps|ss|ds[01]|ix|iy|[sb]p|[acdb][whl]"
    },
    // MAME's v60 disassembler prints hex with NO marker at all, e.g.
    //   add.h  R5, [-2C800BFF[R16]]      dbr  R1, 6002B[PC]
    "nec-v60": {
      name: "NEC V60/V70",
      hexNotation: null,
      hexPostfix: false,
      zeroPrefix: false,
      opcodeSizes: true,
      addressBits: 32,
      pcRelative: "absolute",
      registers: "pc|psw2|psw|ap|fp|sp|isp|l[0-3]sp|sbr|trmode|tr|sycw|tkcw|pir|atbr[0-3]|atlr[0-3]|adtmr[01]|adtr[01]|r3[01]|r[12][0-9]|r[0-9]"
    }
  };
  var SIZE_SUFFIX = /\.(?:sl|ls|ws|wl|sw|lw|pz|zp|bh|bw|hw|[qlwbhs])\b/i;
  var ARCH_CLASS_PREFIX = "pdasm-arch-";
  function findArch(classList) {
    for (const cls of classList) {
      if (!cls.startsWith(ARCH_CLASS_PREFIX)) continue;
      const id = cls.slice(ARCH_CLASS_PREFIX.length);
      if (archs[id]) return { id, arch: archs[id] };
    }
    return null;
  }

  // src/tokenize.js
  var WORD = /[0-9A-Za-z_]/;
  var PUNCT = /[\[\](),#]/;
  var HEX_DIGITS = /[0-9a-f]+/iy;
  var SIZE_AT = new RegExp(SIZE_SUFFIX.source, "iy");
  var SIZE_END = new RegExp("(?:" + SIZE_SUFFIX.source + ")$", "i");
  var regexCache = /* @__PURE__ */ new WeakMap();
  function registerMatcher(arch) {
    let re = regexCache.get(arch);
    if (!re) {
      re = new RegExp("(?:" + arch.registers + ")", "iy");
      regexCache.set(arch, re);
    }
    return re;
  }
  function isFree(text, i, j) {
    if (i > 0 && WORD.test(text[i - 1])) return false;
    if (j < text.length && WORD.test(text[j])) return false;
    return true;
  }
  function matchAt(re, text, i) {
    re.lastIndex = i;
    const m = re.exec(text);
    return m ? m[0] : null;
  }
  function pushText(out, s) {
    if (!s) return;
    const last = out[out.length - 1];
    if (last && last.kind === "text") last.text += s;
    else out.push({ kind: "text", text: s });
  }
  function readHex(text, i, arch) {
    const notation = arch ? arch.hexNotation : null;
    const postfix = arch ? arch.hexPostfix : false;
    let p = i;
    const tokens = [];
    let sign = "";
    if (text[p] === "-") {
      sign = "-";
      p++;
    }
    let notationText = "";
    if (arch && notation && !postfix) {
      const m = matchAt(new RegExp("(?:" + notation + ")", "iy"), text, p);
      if (!m) return null;
      notationText = m;
      p += m.length;
    } else if (!arch) {
      const m = matchAt(/(?:\$|0x)/iy, text, p);
      if (!m) return null;
      notationText = m;
      p += m.length;
    }
    const digits = matchAt(HEX_DIGITS, text, p);
    if (!digits) return null;
    const digitsStart = p;
    p += digits.length;
    if (arch && notation && postfix) {
      const m = matchAt(new RegExp("(?:" + notation + ")", "iy"), text, p);
      if (!m) return null;
      notationText = m;
      p += m.length;
    }
    if (arch && arch.zeroPrefix && /^[a-f]/i.test(digits)) return null;
    if (arch && notation === null && !isFree(text, digitsStart, digitsStart + digits.length))
      return null;
    if (notationText && !postfix) tokens.push({ kind: "notation", text: notationText });
    tokens.push({
      kind: "hex",
      text: sign + digits,
      value: (sign === "-" ? -1 : 1) * parseInt(digits, 16)
    });
    if (notationText && postfix) tokens.push({ kind: "notation", text: notationText });
    const size = matchAt(SIZE_AT, text, p);
    if (size) {
      tokens.push({ kind: "size", text: size });
      p += size.length;
    }
    return { tokens, end: p };
  }
  var CLOSERS = { "]": "[", ")": "(" };
  var LABEL = /\{([^}]+)\}/g;
  function matchOpenBackward(text, closeIdx) {
    const open = CLOSERS[text[closeIdx]];
    let depth = 0;
    for (let k = closeIdx; k >= 0; k--) {
      if (text[k] === text[closeIdx]) depth++;
      else if (text[k] === open && --depth === 0) return k;
    }
    return -1;
  }
  function readHexBackward(text, end) {
    let p = end;
    const sizeM = SIZE_END.exec(text.slice(0, p));
    if (sizeM) p -= sizeM[0].length;
    const postM = /(?:h'|h)$/i.exec(text.slice(0, p));
    let hadPostfix = false;
    if (postM && /[0-9a-f]/i.test(text[p - postM[0].length - 1] || "")) {
      p -= postM[0].length;
      hadPostfix = true;
    }
    const digM = /[0-9a-f]+$/i.exec(text.slice(0, p));
    if (!digM) return -1;
    p -= digM[0].length;
    if (!hadPostfix) {
      const preM = /(?:\$|0x|h')$/i.exec(text.slice(0, p));
      if (preM) p -= preM[0].length;
    }
    if (text[p - 1] === "-") p--;
    return p;
  }
  function findSymbolSpans(text) {
    const spans = [];
    LABEL.lastIndex = 0;
    let m;
    while ((m = LABEL.exec(text)) !== null) {
      let j = m.index;
      for (; ; ) {
        const prev = text[j - 1];
        if (prev in CLOSERS) {
          const open = matchOpenBackward(text, j - 1);
          if (open < 0) break;
          j = open;
          continue;
        }
        const start = readHexBackward(text, j);
        if (start >= 0 && start < j) {
          j = start;
          continue;
        }
        break;
      }
      if (j < m.index) spans.push({ start: j, end: m.index, label: m[1] });
      else spans.push({ start: m.index, end: m.index, label: m[1] });
    }
    return spans;
  }
  function tokenize(text, arch) {
    const out = [];
    const regRe = arch ? registerMatcher(arch) : null;
    const spans = findSymbolSpans(text).map((s) => ({
      ...s,
      labelEnd: s.end + s.label.length + 2
      // past the closing brace
    }));
    let i = 0;
    while (i < text.length) {
      const span = spans.find((s) => s.start === i && s.end > s.start);
      if (span) {
        out.push({ kind: "symbol", text: span.label, title: text.slice(span.start, span.end) });
        i = span.labelEnd;
        continue;
      }
      if (regRe) {
        const m = matchAt(regRe, text, i);
        if (m && isFree(text, i, i + m.length)) {
          out.push({ kind: "reg", text: m });
          i += m.length;
          continue;
        }
      }
      const hex2 = readHex(text, i, arch);
      if (hex2) {
        out.push(...hex2.tokens);
        i = hex2.end;
        continue;
      }
      if (PUNCT.test(text[i])) out.push({ kind: "punct", text: text[i] });
      else pushText(out, text[i]);
      i++;
    }
    return out;
  }

  // src/expr.js
  var isPunct = (t, ch) => Boolean(t && t.kind === "punct" && t.text === ch);
  function literalSpan(tokens, h) {
    let start = h, end = h + 1;
    if (tokens[h - 1] && tokens[h - 1].kind === "notation") start = h - 1;
    if (tokens[end] && tokens[end].kind === "notation") end++;
    let size = null;
    if (tokens[end] && tokens[end].kind === "size") {
      size = tokens[end].text;
      end++;
    }
    return { start, end, size };
  }
  function findExpressions(tokens) {
    const out = [];
    for (let h = 0; h < tokens.length; h++) {
      if (tokens[h].kind !== "hex") continue;
      const lit = literalSpan(tokens, h);
      const e = {
        start: lit.start,
        end: lit.end,
        kind: "abs",
        value: tokens[h].value,
        size: lit.size,
        reg: null,
        immediate: isPunct(tokens[lit.start - 1], "#"),
        indexed: false
      };
      const next = tokens[lit.end];
      if ((isPunct(next, "[") || isPunct(next, "(")) && tokens[lit.end + 1] && tokens[lit.end + 1].kind === "reg") {
        const close = next.text === "[" ? "]" : ")";
        if (isPunct(tokens[lit.end + 2], close)) {
          e.reg = tokens[lit.end + 1].text.toLowerCase();
          e.kind = e.reg === "pc" ? "pcrel" : "based";
          e.end = lit.end + 3;
        }
      } else if (isPunct(next, "[") || isPunct(next, "(")) {
        e.kind = "based";
      } else if (isPunct(tokens[lit.start - 1], "(") && isPunct(next, ",") && tokens[lit.end + 1] && tokens[lit.end + 1].kind === "reg") {
        e.reg = tokens[lit.end + 1].text.toLowerCase();
        e.kind = e.reg === "pc" ? "pcrel" : "based";
        if (isPunct(tokens[lit.end + 2], ")")) {
          e.start = lit.start - 1;
          e.end = lit.end + 3;
        } else {
          e.indexed = true;
        }
      }
      out.push(e);
    }
    return out;
  }

  // src/resolve.js
  function normalise(value, arch) {
    const bits = arch && arch.addressBits ? arch.addressBits : 32;
    const mod = 2 ** bits;
    return (value % mod + mod) % mod;
  }
  function resolve(expr, context) {
    if (expr.immediate) return null;
    const arch = context.arch;
    let value = expr.value;
    if (expr.kind === "abs") {
      if (arch && arch.absoluteShort && expr.size && expr.size.toLowerCase() === ".w" && value >= 32768 && value <= 65535)
        value -= 65536;
      return normalise(value, arch);
    }
    if (expr.kind === "pcrel") {
      if (!arch || !arch.pcRelative) return null;
      if (arch.pcRelative === "absolute") return normalise(value, arch);
      if (context.lineAddress == null) return null;
      return normalise(context.lineAddress + (arch.pcDisplacementBase || 0) + value, arch);
    }
    const base = expr.reg && context.bases ? context.bases[expr.reg] : void 0;
    if (base == null) return null;
    return normalise(base + value, arch);
  }
  var hex = (n) => n.toString(16).toUpperCase();
  function annotate(tokens, context) {
    const symbols = context.symbols || null;
    const out = [];
    const exprs = findExpressions(tokens);
    let i = 0, x = 0;
    while (i < tokens.length) {
      const tok = tokens[i];
      if (tok.kind === "symbol" && tok.target === void 0) {
        const inner = findExpressions(tokenize(tok.title, context.arch));
        const t = inner.length ? resolve(inner[0], context) : null;
        out.push(t == null ? tok : { ...tok, target: hex(t) });
        i++;
        continue;
      }
      const e = exprs[x];
      if (!e || e.start !== i) {
        out.push(tok);
        i++;
        continue;
      }
      x++;
      const target = resolve(e, context);
      const name = target != null && symbols && context.autoSymbols !== false ? symbols.get(target) : void 0;
      if (name) {
        out.push({
          kind: "symbol",
          text: name,
          auto: true,
          target: hex(target),
          title: tokens.slice(e.start, e.end).map((t) => t.text).join("")
        });
      } else {
        for (let k = e.start; k < e.end; k++)
          out.push(tokens[k].kind === "hex" && target != null ? { ...tokens[k], target: hex(target) } : tokens[k]);
      }
      i = e.end;
    }
    return out;
  }

  // src/render.js
  var OPCODE_SIZE = new RegExp("^(.*?)(" + SIZE_SUFFIX.source + ")$", "i");
  var P = "pdasm";
  var CSS = {
    table: P,
    unformatted: P + "-plain",
    symbol: P + "-symbol",
    symbolAuto: P + "-symbol-auto",
    label: P + "-label",
    register: P + "-reg",
    hexNotation: P + "-hex-notation",
    hexValue: P + "-hex-value",
    size: P + "-size",
    comment: P + "-comment",
    commentToggle: P + "-comment-toggle",
    commentRow: P + "-comment-row",
    xref: P + "-xref",
    flash: P + "-flash",
    match: P + "-match",
    callout: P + "-callout",
    calloutInline: P + "-callout-inline",
    region: P + "-region",
    regionToggle: P + "-region-toggle",
    collapsed: P + "-collapsed",
    mark: P + "-mark",
    captionText: P + "-caption-text",
    arch: P + "-arch",
    commentsToggle: P + "-comments-toggle"
  };
  var KIND_CLASS = {
    notation: CSS.hexNotation,
    hex: CSS.hexValue,
    size: CSS.size,
    reg: CSS.register,
    symbol: CSS.symbol
  };
  function renderTokens(tokens, doc, options) {
    const frag = doc.createDocumentFragment();
    for (const tok of tokens) {
      if (tok.kind === "text" || tok.kind === "punct") {
        frag.appendChild(doc.createTextNode(tok.text));
        continue;
      }
      let text = tok.text;
      if (tok.kind === "hex" && options.capitalizeHex) text = text.toUpperCase();
      if (tok.kind === "size" && options.capitalizeHexSizes) text = text.toUpperCase();
      const span = doc.createElement("span");
      span.className = KIND_CLASS[tok.kind];
      span.textContent = text;
      if (tok.kind === "symbol") {
        span.setAttribute("data-pdasm-alt", tok.title);
        span.setAttribute("tabindex", "0");
        span.setAttribute("role", "button");
        if (tok.auto) span.classList.add(CSS.symbolAuto);
      }
      if (tok.kind === "reg") span.setAttribute("data-pdasm-reg", tok.text.toLowerCase());
      if (tok.target !== void 0) span.setAttribute("data-pdasm-target", tok.target);
      frag.appendChild(span);
    }
    return frag;
  }
  function renderRow(parsed, doc, options) {
    const row = doc.createElement("TR");
    row.id = "pdasm-" + parsed.address;
    row.setAttribute("data-pdasm-addr", parsed.address);
    const addr = doc.createElement("TD");
    addr.textContent = parsed.address;
    row.appendChild(addr);
    const op = doc.createElement("TD");
    if (options.arch && options.arch.opcodeSizes)
      op.appendChild(renderTokens(tokenizeOpcode(parsed.opcode, options), doc, options));
    else op.textContent = parsed.opcode;
    row.appendChild(op);
    const args = doc.createElement("TD");
    if (parsed.args) {
      const context = {
        arch: options.arch,
        lineAddress: parseInt(parsed.address, 16),
        bases: options.bases,
        symbols: options.symbols,
        autoSymbols: options.autoSymbols
      };
      const tokens = annotate(tokenize(parsed.args, options.arch), context);
      args.appendChild(renderTokens(tokens, doc, options));
    }
    row.appendChild(args);
    const commentCell = doc.createElement("TD");
    commentCell.className = CSS.comment;
    if (parsed.comment) {
      const btn = doc.createElement("button");
      btn.type = "button";
      btn.className = CSS.commentToggle;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("data-pdasm-comment", parsed.comment);
      btn.innerHTML = options.commentContent;
      commentCell.appendChild(btn);
    }
    row.appendChild(commentCell);
    return row;
  }
  function tokenizeOpcode(opcode, options) {
    const m = OPCODE_SIZE.exec(opcode);
    if (!m) return [{ kind: "text", text: opcode }];
    return [{ kind: "text", text: m[1] }, { kind: "size", text: m[2] }];
  }
  function renderUnformattedRow(text, doc) {
    const row = fullWidthRow(CSS.unformatted, doc);
    row.firstChild.textContent = text;
    return row;
  }
  function renderLabelRow(name, doc) {
    const row = doc.createElement("TR");
    row.className = CSS.label;
    const td = doc.createElement("TD");
    td.setAttribute("colspan", "4");
    td.textContent = name + ":";
    row.appendChild(td);
    return row;
  }
  function fullWidthRow(className, doc) {
    const row = doc.createElement("TR");
    row.className = className;
    const td = doc.createElement("TD");
    td.setAttribute("colspan", "4");
    row.appendChild(td);
    return row;
  }
  function renderCalloutRow(text, doc, inline) {
    const row = fullWidthRow(inline ? CSS.callout + " " + CSS.calloutInline : CSS.callout, doc);
    row.firstChild.textContent = text;
    return row;
  }
  function renderRegionRow(title, collapsed, id, doc) {
    const row = fullWidthRow(CSS.region, doc);
    const btn = doc.createElement("button");
    btn.type = "button";
    btn.className = CSS.regionToggle;
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    btn.setAttribute("data-pdasm-region-id", String(id));
    btn.textContent = title;
    row.firstChild.appendChild(btn);
    return row;
  }
  function renderCaption(options, doc) {
    if (!options.arch || !options.addArchCaption) return null;
    const caption = doc.createElement("CAPTION");
    const span = doc.createElement("span");
    span.className = CSS.arch;
    span.textContent = options.arch.name;
    caption.appendChild(span);
    return caption;
  }
  function renderHead(options, hasComments, doc) {
    const text = options.caption ? String(options.caption).trim() : "";
    const wantToggle = hasComments && options.commentsToggle;
    if (!text && !wantToggle) return null;
    const thead = doc.createElement("THEAD");
    const row = doc.createElement("TR");
    const th = doc.createElement("TH");
    th.setAttribute("colspan", "4");
    th.setAttribute("scope", "colgroup");
    if (text) {
      const span = doc.createElement("span");
      span.className = CSS.captionText;
      span.textContent = text;
      th.appendChild(span);
    }
    if (wantToggle) {
      const btn = doc.createElement("button");
      btn.type = "button";
      btn.className = CSS.commentsToggle;
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = "toggle comments";
      th.appendChild(btn);
    }
    row.appendChild(th);
    thead.appendChild(row);
    return thead;
  }

  // src/symbols.js
  function parseHex(s) {
    const m = /^\s*(?:0x|\$)?([0-9a-f]+)h?\s*$/i.exec(String(s));
    return m ? parseInt(m[1], 16) : NaN;
  }
  function parseSymbolMap(input, doc) {
    if (!input) return null;
    if (input instanceof Map) return input;
    let obj = input;
    if (typeof input === "string") {
      let text = input.trim();
      if (text.startsWith("#")) {
        const el = doc && doc.getElementById(text.slice(1));
        if (!el) return null;
        text = el.textContent;
      }
      obj = JSON.parse(text);
    }
    const map = /* @__PURE__ */ new Map();
    for (const [k, v] of Object.entries(obj)) {
      const addr = parseHex(k);
      if (!Number.isNaN(addr) && typeof v === "string" && v) map.set(addr, v);
    }
    return map;
  }
  function parseBases(input) {
    if (!input) return null;
    let obj = input;
    if (typeof input === "string") {
      const text = input.trim();
      if (text.startsWith("{")) obj = JSON.parse(text);
      else {
        obj = {};
        for (const pair of text.split(",")) {
          const [reg, val] = pair.split("=").map((x) => x.trim());
          if (reg && val) obj[reg] = val;
        }
      }
    }
    const bases = {};
    for (const [reg, v] of Object.entries(obj)) {
      const n = typeof v === "number" ? v : parseHex(v);
      if (!Number.isNaN(n)) bases[reg.toLowerCase()] = n;
    }
    return bases;
  }
  function parseMarks(input) {
    if (!input) return null;
    const pieces = Array.isArray(input) ? input : String(input).split(",");
    const ranges = [];
    for (const piece of pieces) {
      const m = /^\s*([^\s-]+)\s*(?:-\s*([^\s-]+))?\s*$/.exec(String(piece));
      if (!m) continue;
      const lo = parseHex(m[1]), hi = m[2] ? parseHex(m[2]) : lo;
      if (!Number.isNaN(lo) && !Number.isNaN(hi)) ranges.push([Math.min(lo, hi), Math.max(lo, hi)]);
    }
    return ranges.length ? ranges : null;
  }

  // src/navigate.js
  function indexRows(table) {
    const map = /* @__PURE__ */ new Map();
    for (const row of table.rows) {
      const addr = row.getAttribute("data-pdasm-addr");
      if (addr != null && !map.has(parseInt(addr, 16))) map.set(parseInt(addr, 16), row);
    }
    return map;
  }
  function markXrefs(table) {
    const index = indexRows(table);
    for (const el of Array.from(table.querySelectorAll("[data-pdasm-target]"))) {
      if (!index.has(parseInt(el.getAttribute("data-pdasm-target"), 16))) continue;
      el.classList.add(CSS.xref);
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      if (el.classList.contains(CSS.symbol)) el.setAttribute("title", el.getAttribute("data-pdasm-alt"));
    }
  }

  // src/interact.js
  var MATCH_CLASS = CSS.match;
  function toggleComment(btn, table) {
    const row = btn.closest("tr");
    const open = btn.getAttribute("aria-expanded") === "true";
    if (open) {
      const prev = row.previousElementSibling;
      if (prev && prev.classList.contains(CSS.commentRow)) prev.remove();
      btn.setAttribute("aria-expanded", "false");
      return;
    }
    const doc = table.ownerDocument;
    const commentRow = doc.createElement("TR");
    commentRow.className = CSS.commentRow;
    const td = doc.createElement("TD");
    td.setAttribute("colspan", "4");
    td.textContent = btn.getAttribute("data-pdasm-comment");
    commentRow.appendChild(td);
    const regionId = row.getAttribute("data-pdasm-region");
    if (regionId != null) {
      commentRow.setAttribute("data-pdasm-region", regionId);
      if (row.classList.contains(CSS.collapsed)) commentRow.classList.add(CSS.collapsed);
    }
    row.parentNode.insertBefore(commentRow, row);
    btn.setAttribute("aria-expanded", "true");
  }
  function toggleAllComments(table) {
    const toggles = Array.from(table.querySelectorAll("." + CSS.commentToggle));
    const anyClosed = toggles.some((b) => b.getAttribute("aria-expanded") !== "true");
    for (const b of toggles)
      if (b.getAttribute("aria-expanded") === "true" !== anyClosed) toggleComment(b, table);
  }
  function refreshAllButton(table) {
    const btn = table.querySelector("." + CSS.commentsToggle);
    if (!btn) return;
    const toggles = Array.from(table.querySelectorAll("." + CSS.commentToggle));
    const allOpen = toggles.length > 0 && toggles.every((b) => b.getAttribute("aria-expanded") === "true");
    btn.setAttribute("aria-pressed", allOpen ? "true" : "false");
  }
  function toggleRegion(btn, table) {
    const id = btn.getAttribute("data-pdasm-region-id");
    const open = btn.getAttribute("aria-expanded") === "true";
    for (const row of table.querySelectorAll(`[data-pdasm-region="${id}"]`))
      row.classList.toggle(CSS.collapsed, open);
    btn.setAttribute("aria-expanded", open ? "false" : "true");
  }
  var flashTimers = /* @__PURE__ */ new WeakMap();
  function flashTarget(el, table, rowByAddr) {
    const row = rowByAddr.get(parseInt(el.getAttribute("data-pdasm-target"), 16));
    if (!row) return;
    clearTimeout(flashTimers.get(row));
    row.classList.remove(CSS.flash);
    void row.offsetWidth;
    row.classList.add(CSS.flash);
    const done = () => {
      row.classList.remove(CSS.flash);
      clearTimeout(flashTimers.get(row));
    };
    flashTimers.set(row, setTimeout(done, 2e3));
    row.addEventListener("animationend", done, { once: true });
  }
  function toggleSymbol(span, options) {
    const doc = span.ownerDocument;
    if (span.hasAttribute("data-pdasm-label")) {
      span.textContent = span.getAttribute("data-pdasm-label");
      span.removeAttribute("data-pdasm-label");
      return;
    }
    span.setAttribute("data-pdasm-label", span.textContent);
    span.textContent = "";
    span.appendChild(renderTokens(tokenize(span.getAttribute("data-pdasm-alt"), options.arch), doc, options));
  }
  function attachInteractions(table, options) {
    let rowByAddr = null;
    const rows = () => rowByAddr || (rowByAddr = indexRows(table));
    table.addEventListener("click", (event) => {
      const btn = event.target.closest("." + CSS.commentToggle);
      if (btn && table.contains(btn)) {
        toggleComment(btn, table);
        refreshAllButton(table);
        return;
      }
      const all = event.target.closest("." + CSS.commentsToggle);
      if (all && table.contains(all)) {
        toggleAllComments(table);
        refreshAllButton(table);
        return;
      }
      const region = event.target.closest("." + CSS.regionToggle);
      if (region && table.contains(region)) {
        toggleRegion(region, table);
        return;
      }
      const ref = event.target.closest("." + CSS.xref);
      if (ref && table.contains(ref)) {
        flashTarget(ref, table, rows());
        return;
      }
      const sym = event.target.closest("." + CSS.symbol);
      if (sym && table.contains(sym)) toggleSymbol(sym, options);
    });
    table.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const ref = event.target.closest("." + CSS.xref);
      if (ref && table.contains(ref)) {
        event.preventDefault();
        flashTarget(ref, table, rows());
        return;
      }
      const sym = event.target.closest("." + CSS.symbol);
      if (sym && table.contains(sym)) {
        event.preventDefault();
        toggleSymbol(sym, options);
      }
    });
    const setMatches = (reg, on) => {
      for (const el of table.querySelectorAll(`[data-pdasm-reg="${reg}"]`))
        el.classList.toggle(MATCH_CLASS, on);
    };
    const setTargetRow = (el, on) => {
      const row = rows().get(parseInt(el.getAttribute("data-pdasm-target"), 16));
      if (row) row.classList.toggle(MATCH_CLASS, on);
    };
    const hover = (on) => (event) => {
      const reg = event.target.closest("[data-pdasm-reg]");
      if (reg) setMatches(reg.getAttribute("data-pdasm-reg"), on);
      const ref = event.target.closest("[data-pdasm-target]");
      if (ref) setTargetRow(ref, on);
    };
    table.addEventListener("mouseover", hover(true));
    table.addEventListener("mouseout", hover(false));
  }

  // src/prettydasm.js
  var LINE = /^\s*([0-9a-f]+):\s+(\S+)(?:\s+(.*))?$/i;
  var COMMENT_MARKER = ";";
  var defaults = {
    autoProcess: true,
    commentContent: "//",
    overrideHexNotation: null,
    overrideHexPostfix: false,
    capitalizeHex: false,
    capitalizeHexSizes: false,
    addArchCaption: true,
    symbols: null,
    bases: null,
    autoSymbols: true,
    autoLabels: true,
    xrefs: true,
    mark: null,
    caption: null,
    commentsToggle: true
  };
  function parseLine(line) {
    const m = LINE.exec(line);
    if (!m) return null;
    let args = m[3] == null ? "" : m[3];
    let comment = null, callout = null;
    const cut = args.indexOf(COMMENT_MARKER);
    if (cut >= 0) {
      const rest = args.slice(cut + 1);
      if (rest.startsWith(COMMENT_MARKER)) callout = rest.slice(1).trim();
      else comment = rest.trim();
      args = args.slice(0, cut).trim();
    }
    return { address: m[1], opcode: m[2], args: args.trim(), comment, callout };
  }
  function parseDirective(line) {
    const t = line.trim();
    if (!t.startsWith(COMMENT_MARKER + COMMENT_MARKER)) return null;
    const rest = t.slice(2);
    if (rest.startsWith(">")) {
      const collapsed = rest.startsWith(">-");
      return { kind: "region", title: rest.slice(collapsed ? 2 : 1).trim(), collapsed };
    }
    if (rest.startsWith("<")) return { kind: "endRegion" };
    return { kind: "callout", text: rest.trim() };
  }
  function readOptions(elem, options) {
    const opts = { ...defaults, ...options };
    for (const [key, value] of Object.entries(elem.dataset || {})) {
      if (!key.startsWith("pdasm")) continue;
      const name = key.slice(5, 6).toLowerCase() + key.slice(6);
      opts[name] = value === "true" ? true : value === "false" ? false : value;
    }
    return opts;
  }
  function prettify(elem, options) {
    const doc = elem.ownerDocument;
    const opts = readOptions(elem, options);
    const found = findArch(Array.from(elem.classList));
    opts.arch = found ? found.arch : null;
    opts.symbols = parseSymbolMap(opts.symbols, doc);
    opts.bases = parseBases(opts.bases);
    opts.mark = parseMarks(opts.mark);
    const table = doc.createElement("TABLE");
    table.className = CSS.table;
    if (found) table.classList.add("pdasm-arch-" + found.id);
    const source = elem.textContent;
    table.pdasmSource = source;
    const caption = renderCaption(opts, doc);
    if (caption) table.appendChild(caption);
    let previous = null, region = null, regions = 0;
    const addRow = (row) => {
      if (region) {
        row.setAttribute("data-pdasm-region", String(region.id));
        if (region.collapsed) row.classList.add(CSS.collapsed);
      }
      table.appendChild(row);
    };
    const lines = source.split("\n");
    while (lines.length && lines[0].trim() === "") lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
    for (const line of lines) {
      const directive = parseDirective(line);
      if (directive) {
        if (directive.kind === "endRegion") region = null;
        else if (directive.kind === "region") {
          region = null;
          table.appendChild(renderRegionRow(directive.title, directive.collapsed, ++regions, doc));
          region = { id: regions, collapsed: directive.collapsed };
        } else addRow(renderCalloutRow(directive.text, doc, false));
        previous = line.trim();
        continue;
      }
      const parsed = parseLine(line);
      if (parsed && opts.autoLabels && opts.symbols) {
        const name = opts.symbols.get(parseInt(parsed.address, 16));
        if (name && previous !== name + ":") addRow(renderLabelRow(name, doc));
      }
      if (parsed) {
        const row = renderRow(parsed, doc, opts);
        if (opts.mark) {
          const addr = parseInt(parsed.address, 16);
          if (opts.mark.some(([lo, hi]) => addr >= lo && addr <= hi)) row.classList.add(CSS.mark);
        }
        if (parsed.callout) addRow(renderCalloutRow(parsed.callout, doc, true));
        addRow(row);
      } else addRow(renderUnformattedRow(line, doc));
      previous = line.trim();
    }
    const head = renderHead(opts, table.querySelector("." + CSS.commentToggle) !== null, doc);
    if (head) table.insertBefore(head, caption ? caption.nextSibling : table.firstChild);
    if (opts.xrefs) markXrefs(table);
    attachInteractions(table, opts);
    elem.parentNode.replaceChild(table, elem);
    return table;
  }
  function prettifyAll(options) {
    const pres = Array.from(document.querySelectorAll("pre." + CSS.table));
    return pres.map((pre) => prettify(pre, options));
  }
  function autoInit() {
    if (defaults.autoProcess) prettifyAll();
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", autoInit, { once: true });
    else autoInit();
  }
  return __toCommonJS(prettydasm_exports);
})();
