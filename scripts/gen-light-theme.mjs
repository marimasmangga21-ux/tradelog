// Generates src/app/light-theme.css: maps hardcoded dark Tailwind color classes
// to light-mode equivalents under `html.light`. Re-run after adding new color classes:
//   npm run theme:light
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(SRC, "app", "light-theme.css");

const ZINC = {
  50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 300: "#d4d4d8", 400: "#a1a1aa",
  500: "#71717a", 600: "#52525b", 700: "#3f3f46", 800: "#27272a", 900: "#18181b", 950: "#09090b",
};

const EXCLUDE = ".keep-dark, .keep-dark *, .snapshot-surface, .snapshot-surface *";
const ON_COLORED = '[class*="bg-red-"], [class*="bg-emerald-"], [class*="bg-green-"], [class*="bg-blue-"], [class*="bg-loss"], [class*="bg-profit"], [class*="bg-destructive"], [class*="bg-primary"], [class*="bg-black"], [class*="bg-black"] *';

const RESPONSIVE = { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" };

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  h = h.slice(0, 6);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function luminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function saturation([r, g, b]) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function resolveColor(name) {
  if (name === "white") return "#ffffff";
  if (name === "black") return "#000000";
  const z = name.match(/^zinc-(\d+)$/);
  if (z) return ZINC[z[1]];
  const hx = name.match(/^\[(#[0-9a-fA-F]{3,8})\]$/);
  if (hx) return hx[1].toLowerCase();
  return null;
}

function parseAlpha(op) {
  if (!op) return null;
  const v = op.startsWith("[") ? parseFloat(op.slice(1, -1)) : parseInt(op, 10) / 100;
  return Number.isFinite(v) ? v : null;
}

function withAlpha(hex, alpha) {
  if (alpha == null || alpha >= 1) return hex;
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${+alpha.toFixed(3)})`;
}

const esc = (s) => s.replace(/[^a-zA-Z0-9_-]/g, "\\$&");

// Returns light-mode color or null (= leave unchanged)
function mapColor(prop, name, alpha, state) {
  const hex = resolveColor(name);
  if (!hex) return null;
  const rgb = hexToRgb(hex);
  const L = luminance(rgb);
  const sat = saturation(rgb);
  const isWhite = hex === "#ffffff";

  if (prop === "bg") {
    if (hex === "#000000") return null;
    if (isWhite) {
      if (alpha == null || alpha > 0.25) return null;
      return `rgba(0, 0, 0, ${Math.min(Math.max(alpha, 0.03), 0.08)})`;
    }
    if (sat > 40 || L >= 0.18) return null;
    if (state === "hover") return withAlpha("#ececef", alpha);
    if (state === "tab") return "#ffffff";
    return withAlpha(L < 0.0045 ? "#ffffff" : "#f4f4f5", alpha);
  }

  if (prop === "border" || prop === "divide") {
    if (isWhite) {
      if (alpha == null || alpha > 0.3) return null;
      return `rgba(0, 0, 0, ${Math.min(Math.max(alpha, 0.07), 0.14)})`;
    }
    if (hex === "#000000" || sat > 40 || L >= 0.18) return null;
    return withAlpha(state === "hover" ? "#d4d4d8" : "#e4e4e7", alpha);
  }

  if (prop === "text") {
    if (hex === "#b2ff05") return "#4d7c0f";
    if (sat > 40) return null;
    const effective = alpha == null ? L : L * alpha;
    if (isWhite && alpha != null) {
      if (alpha >= 0.8) return "#18181b";
      if (alpha >= 0.5) return "#3f3f46";
      return "#a1a1aa";
    }
    if (effective > 0.75) return "#18181b";
    if (effective > 0.45) return "#3f3f46";
    if (effective > 0.22) return "#52525b";
    return null;
  }
  return null;
}

const TOKEN_RE =
  /(?<![\w:\[\/#-])((?:[a-z0-9-]+(?:\[[^\]\s]+\])?:)*)(bg|text|border(?:-[trblxy])?|divide)-(\[#[0-9a-fA-F]{3,8}\]|white|black|zinc-\d{2,3})(?:\/(\d{1,3}|\[[0-9.]+\]))?(?![\w\[-])/g;

const tokens = new Map();
for (const file of walk(SRC)) {
  if (/ui-template|ui-dual-theme/.test(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(TOKEN_RE)) tokens.set(m[0], m);
}

const SIDE_PROPS = {
  border: ["border-color"],
  "border-t": ["border-top-color"],
  "border-b": ["border-bottom-color"],
  "border-l": ["border-left-color"],
  "border-r": ["border-right-color"],
  "border-x": ["border-left-color", "border-right-color"],
  "border-y": ["border-top-color", "border-bottom-color"],
};

const rules = { base: [], media: {} };

for (const [token, m] of [...tokens.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const variants = m[1] ? m[1].slice(0, -1).split(":") : [];
  const utility = m[2];
  const colorName = m[3];
  const alpha = parseAlpha(m[4]);

  let state = "base";
  let groupPrefix = "";
  let attr = "";
  let pseudoClass = "";
  let pseudoElement = "";
  let media = null;
  let skip = false;

  for (const v of variants) {
    if (v === "hover" || v === "focus" || v === "focus-visible" || v === "active") {
      pseudoClass += `:${v}`;
      state = "hover";
    } else if (v === "group-hover") {
      groupPrefix = ".group:hover ";
      state = "hover";
    } else if (v === "data-[state=active]") {
      attr += '[data-state="active"]';
      state = "tab";
    } else if (v === "placeholder") {
      pseudoElement = "::placeholder";
    } else if (RESPONSIVE[v]) {
      media = RESPONSIVE[v];
    } else {
      skip = true; // dark:, disabled:, etc.
    }
  }
  if (skip) continue;

  const prop = utility.startsWith("border") ? "border" : utility;
  const color = mapColor(prop, colorName, alpha, state);
  if (!color) continue;

  const isWhiteText = prop === "text" && (colorName === "white" || luminance(hexToRgb(resolveColor(colorName))) > 0.75);
  const notList = isWhiteText ? `${EXCLUDE}, ${ON_COLORED}` : EXCLUDE;
  const base = `:where(html.light) ${groupPrefix}.${esc(token)}${attr}${pseudoClass}:where(:not(${notList}))`;

  let selector;
  let decls;
  if (prop === "divide") {
    selector = `${base} > :not([hidden]) ~ :not([hidden])`;
    decls = [`border-color: ${color}`];
  } else if (prop === "border") {
    selector = base + pseudoElement;
    decls = SIDE_PROPS[utility].map((p) => `${p}: ${color}`);
  } else if (prop === "bg") {
    selector = base + pseudoElement;
    decls = [`background-color: ${color}`];
  } else {
    selector = base + pseudoElement;
    decls = [`color: ${color}`];
  }

  const rule = `${selector} { ${decls.join("; ")}; }`;
  if (media) (rules.media[media] ||= []).push(rule);
  else rules.base.push(rule);
}

// Base first, hover/state rules come later because selectors are sorted with variant prefixes;
// ensure state rules override base by emitting them after.
const isState = (r) => /:hover|:focus|:active|data-state/.test(r);
const ordered = [...rules.base.filter((r) => !isState(r)), ...rules.base.filter(isState)];

let css = `/* AUTO-GENERATED by scripts/gen-light-theme.mjs — do not edit by hand. */\n`;
css += `/* Maps hardcoded dark color classes to light palette when html.light is active. */\n\n`;
css += ordered.join("\n") + "\n";
for (const [min, list] of Object.entries(rules.media).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
  css += `\n@media (min-width: ${min}) {\n  ${list.join("\n  ")}\n}\n`;
}

fs.writeFileSync(OUT, css);
console.log(`light-theme.css: ${ordered.length} rules (+${Object.values(rules.media).flat().length} responsive)`);
