#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { banner } from "./cards/banner.js";
import { stats } from "./cards/stats.js";
import { skills } from "./cards/skills.js";
import { terminal } from "./cards/terminal.js";
import { badge } from "./cards/badge.js";
import { divider } from "./cards/divider.js";
import { progress } from "./cards/progress.js";
import { donut } from "./cards/donut.js";
import { chart } from "./cards/chart.js";
import { links } from "./cards/links.js";
import { quote } from "./cards/quote.js";
import { code } from "./cards/code.js";
import { project } from "./cards/project.js";
import { wave } from "./cards/wave.js";
import { timeline } from "./cards/timeline.js";
import { contributions, randomWeeks } from "./cards/contrib.js";
import { CARD_TYPES, renderCard, renderManifest, safeOutputPath, substituteVars, type Card, type Manifest } from "./render.js";
import { isValidColor, parsePositiveInt, THEMES, type BaseCardOptions, type StyleOverrides } from "./escape.js";
import { invokedDirectly } from "./main.js";
import { packageVersion } from "./version.js";

function help(): string {
  return `
svgforge — generate GitHub README SVGs locally

Usage:
  svgforge <card-type> [flags] [-o file.svg]
  svgforge render manifest.json -o ./assets [--set key=value]
  svgforge demo [-o ./svgforge-demo]
  svgforge themes | types
  svgforge --help | --version

Card types (see below for their flags):
  banner stats skills terminal badge
  divider progress donut chart links quote code project wave
  timeline contributions

Card flags:
  banner    --title --subtitle [--tag text] [--logo text] [--gradient #aabbcc,#111111]
  stats     --title --item Label=Value (repeat)
  skills    --title --item Name=0-100 (repeat) [--show-value]
  terminal  --title --line text (repeat) [--prompt $] [--caret]
  badge     --label --value [--style flat|outline|plastic] [--label-color #rrggbb]
  divider   [--label text]
  progress  --title --value 0-100 [--caption text] [--no-value]
  donut     --title --item Label=Value (repeat) [--center text] [--unit suffix]
  chart     --title --item Label=Value (repeat) [--unit suffix]
  links     --item Text=https://... (repeat) [--no-link]
  quote     --text --author
  code      --title --lang ts|py|sh [--line text (repeat)] [--line-numbers]
  project   --name --description --host --item Label=Value (repeat) --tag text (repeat)
  wave      --title --subtitle [--animate]
  timeline  --title --item Date=Label (repeat)
  contributions --title [--seed n --density 0.4 | --file weeks.json] [--total n]

Common flags (every card type):
  --theme <name>        one of \`svgforge themes\` (default midnight)
  --width <px>          card width            --height <px>  card height
  --radius <px>         corner radius
  --bg/--bg2/--fg/--muted/--accent/--accent2/--line-color <#rrggbb>
                        override theme colors
  --font <family>       override the font stack
  --flat                solid background instead of gradient
  -o, --out <path>      output file (directory for render/demo)

Manifest:
  { "theme": "midnight", "vars": { "user": "KodYazicam" },
    "cards": [ { "type": "banner", "title": "{{user}}", "out": "banner.svg" } ] }
  {{var}} placeholders are replaced everywhere; --set overrides vars.

License: KYAL-1.0 — free to use, attribution required.
https://github.com/KodYazicam/svgforge
`.trim();
}

function take(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx >= 0) return args[idx + 1];
  return undefined;
}

function takeAll(args: string[], name: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === name && args[i + 1]) out.push(args[i + 1]);
  }
  return out;
}

function has(args: string[], name: string): boolean {
  return args.includes(name);
}

interface Common {
  theme?: string;
  out?: string;
  width?: number;
  height?: number;
  radius?: number;
  font?: string;
  flat?: boolean;
  overrides: StyleOverrides;
}

function parseCommon(argv: string[]): Common {
  const overrides: StyleOverrides = {};
  const colorFlags: Array<[keyof StyleOverrides, string]> = [
    ["bg", "--bg"],
    ["bg2", "--bg2"],
    ["fg", "--fg"],
    ["muted", "--muted"],
    ["accent", "--accent"],
    ["accent2", "--accent2"],
    ["line", "--line-color"],
  ];
  for (const [key, flag] of colorFlags) {
    const value = take(argv, flag);
    if (value !== undefined) {
      if (!isValidColor(value)) throw new Error(`invalid ${flag}: ${value} (use #rrggbb)`);
      overrides[key] = value;
    }
  }
  const width = take(argv, "--width");
  const height = take(argv, "--height");
  const radius = take(argv, "--radius");
  return {
    theme: take(argv, "--theme"),
    out: take(argv, "-o") ?? take(argv, "--out"),
    width: width !== undefined ? parsePositiveInt(width, "--width") : undefined,
    height: height !== undefined ? parsePositiveInt(height, "--height") : undefined,
    radius: radius !== undefined ? parsePositiveInt(radius, "--radius") : undefined,
    font: take(argv, "--font"),
    flat: has(argv, "--flat"),
    overrides,
  };
}

function base(common: Common): BaseCardOptions {
  return {
    theme: common.theme,
    width: common.width,
    height: common.height,
    radius: common.radius,
    font: common.font,
    flat: common.flat,
    ...common.overrides,
  };
}

function writeOut(target: string, svg: string): void {
  mkdirSync(dirname(resolve(target)), { recursive: true });
  writeFileSync(target, svg);
  console.log(`wrote ${target}`);
}

function emit(svg: string, out: string | undefined): number {
  if (out) writeOut(out, svg);
  else process.stdout.write(svg);
  return 0;
}

function parsePairItems(pairs: string[]): Array<{ label: string; value: string }> {
  return pairs.map((pair) => {
    const [label, ...rest] = pair.split("=");
    return { label, value: rest.join("=") };
  });
}

function demoCards(common: Common): Array<{ file: string; card: Card }> {
  const b = base(common);
  return [
    { file: "banner.svg", card: { ...b, type: "banner", title: "svgforge", subtitle: "Generate README SVGs locally" } },
    { file: "wave.svg", card: { ...b, type: "wave", title: "svgforge", subtitle: "one command, sixteen cards" } },
    { file: "stats.svg", card: { ...b, type: "stats", title: "Stats", items: [{ label: "Cards", value: "16" }, { label: "Themes", value: "16" }, { label: "Deps", value: "0" }] } },
    { file: "skills.svg", card: { ...b, type: "skills", title: "Skills", items: [{ name: "TypeScript", level: 90 }, { name: "Python", level: 80 }] } },
    { file: "terminal.svg", card: { ...b, type: "terminal", title: "bash", lines: ["$ svgforge demo -o ./demo", "wrote demo/banner.svg", "wrote demo/wave.svg"] } },
    { file: "badge.svg", card: { ...b, type: "badge", label: "license", value: "KYAL-1.0" } },
    { file: "divider.svg", card: { ...b, type: "divider", label: "more cards" } },
    { file: "progress.svg", card: { ...b, type: "progress", title: "v2.0", value: 68, caption: "roadmap: 68 of 100 items" } },
    { file: "donut.svg", card: { ...b, type: "donut", title: "Time", items: [{ label: "Code", value: 55 }, { label: "Docs", value: 30 }, { label: "Tests", value: 15 }], center: "24h" } },
    { file: "chart.svg", card: { ...b, type: "chart", title: "Downloads", items: [{ label: "Mon", value: 12 }, { label: "Tue", value: 34 }, { label: "Wed", value: 28 }, { label: "Thu", value: 51 }] } },
    { file: "links.svg", card: { ...b, type: "links", items: [{ text: "GitHub", url: "https://github.com/KodYazicam/svgforge" }, { text: "Issues", url: "https://github.com/KodYazicam/svgforge/issues" }] } },
    { file: "quote.svg", card: { ...b, type: "quote", text: "No third-party render service. Your README images are files you commit.", author: "svgforge" } },
    { file: "code.svg", card: { ...b, type: "code", title: "demo.ts", lang: "ts", lineNumbers: true, lines: ["const cards = renderManifest(manifest);", "// writes one svg per card", "for (const c of cards) write(c.file, c.svg);"] } },
    { file: "project.svg", card: { ...b, type: "project", name: "svgforge", host: "github.com/KodYazicam/svgforge", description: "Sixteen README card types from one offline CLI. Zero dependencies, no network.", items: [{ label: "Cards", value: "16" }, { label: "Themes", value: "16" }, { label: "Runtime deps", value: "0" }], tags: ["TypeScript", "Node 20+"] } },
    { file: "timeline.svg", card: { ...b, type: "timeline", title: "Releases", items: [{ date: "2026-09-01", label: "v1.0 — five card types" }, { date: "2026-09-26", label: "quote, timeline, contributions" }, { date: "2026-09-28", label: "v2.0 — overrides + manifest vars" }] } },
    { file: "contributions.svg", card: { ...b, type: "contributions", title: "Contributions", weeks: randomWeeks(42), total: 1337 } },
  ];
}

export function run(argv: string[]): number {
  const cmd = argv[0];
  if (!cmd || cmd === "-h" || cmd === "--help") {
    console.log(help());
    return 0;
  }
  if (cmd === "-v" || cmd === "--version") {
    console.log(packageVersion());
    return 0;
  }
  if (cmd === "themes") {
    console.log(Object.keys(THEMES).join("\n"));
    return 0;
  }
  if (cmd === "types") {
    console.log(CARD_TYPES.join("\n"));
    return 0;
  }

  try {
    const common = parseCommon(argv);
    if (cmd === "banner") {
      const gradient = take(argv, "--gradient");
      let gradientPair: [string, string] | undefined;
      if (gradient) {
        const parts = gradient.split(",").map((part) => part.trim());
        if (parts.length !== 2) throw new Error("--gradient expects #rrggbb,#rrggbb");
        gradientPair = [parts[0], parts[1]];
      }
      return emit(
        banner({
          ...base(common),
          title: take(argv, "--title") ?? "svgforge",
          subtitle: take(argv, "--subtitle"),
          tag: take(argv, "--tag"),
          logo: take(argv, "--logo"),
          gradient: gradientPair,
        }),
        common.out,
      );
    }
    if (cmd === "stats") {
      const items = parsePairItems(takeAll(argv, "--item")).map((item) => ({ label: item.label, value: item.value }));
      if (items.length === 0) throw new Error("stats needs --item Label=Value");
      return emit(
        stats({ ...base(common), title: take(argv, "--title") ?? "Stats", items }),
        common.out,
      );
    }
    if (cmd === "skills") {
      const items = takeAll(argv, "--item").map((pair) => {
        const [name, level] = pair.split("=");
        const n = Number(level);
        return { name, level: Number.isFinite(n) ? n : 0 };
      });
      if (items.length === 0) throw new Error("skills needs --item Name=level");
      return emit(
        skills({
          ...base(common),
          title: take(argv, "--title") ?? "Skills",
          items,
          showValue: has(argv, "--show-value"),
        }),
        common.out,
      );
    }
    if (cmd === "terminal") {
      const lines = takeAll(argv, "--line");
      if (lines.length === 0) throw new Error("terminal needs --line text");
      return emit(
        terminal({
          ...base(common),
          title: take(argv, "--title"),
          lines,
          prompt: take(argv, "--prompt"),
          caret: has(argv, "--caret"),
        }),
        common.out,
      );
    }
    if (cmd === "badge") {
      const style = take(argv, "--style");
      if (style !== undefined && !["flat", "outline", "plastic"].includes(style)) {
        throw new Error(`invalid --style: ${style} (flat | outline | plastic)`);
      }
      return emit(
        badge({
          ...base(common),
          label: take(argv, "--label") ?? "label",
          value: take(argv, "--value") ?? "value",
          style: style as "flat" | "outline" | "plastic" | undefined,
          labelColor: take(argv, "--label-color"),
        }),
        common.out,
      );
    }
    if (cmd === "divider") {
      return emit(divider({ ...base(common), label: take(argv, "--label") }), common.out);
    }
    if (cmd === "progress") {
      const value = take(argv, "--value");
      if (value === undefined) throw new Error("progress needs --value 0-100");
      return emit(
        progress({
          ...base(common),
          title: take(argv, "--title") ?? "Progress",
          value,
          caption: take(argv, "--caption"),
          showValue: !has(argv, "--no-value"),
        }),
        common.out,
      );
    }
    if (cmd === "donut") {
      const items = parsePairItems(takeAll(argv, "--item")).map((item) => ({
        label: item.label,
        value: Number(item.value),
      }));
      if (items.length === 0) throw new Error("donut needs --item Label=Value");
      return emit(
        donut({
          ...base(common),
          title: take(argv, "--title") ?? "Donut",
          items,
          center: take(argv, "--center"),
          unit: take(argv, "--unit"),
        }),
        common.out,
      );
    }
    if (cmd === "chart") {
      const items = parsePairItems(takeAll(argv, "--item")).map((item) => ({
        label: item.label,
        value: Number(item.value),
      }));
      if (items.length === 0) throw new Error("chart needs --item Label=Value");
      return emit(
        chart({
          ...base(common),
          title: take(argv, "--title") ?? "Chart",
          items,
          unit: take(argv, "--unit"),
        }),
        common.out,
      );
    }
    if (cmd === "links") {
      const items = parsePairItems(takeAll(argv, "--item")).map((item) => ({
        text: item.label,
        url: item.value || undefined,
      }));
      if (items.length === 0) throw new Error("links needs --item Text=URL");
      return emit(
        links({ ...base(common), items, link: !has(argv, "--no-link") }),
        common.out,
      );
    }
    if (cmd === "quote") {
      const text = take(argv, "--text");
      if (text === undefined) throw new Error("quote needs --text");
      return emit(quote({ ...base(common), text, author: take(argv, "--author") }), common.out);
    }
    if (cmd === "code") {
      const lines = takeAll(argv, "--line");
      if (lines.length === 0) throw new Error("code needs --line text");
      return emit(
        code({
          ...base(common),
          title: take(argv, "--title"),
          lang: take(argv, "--lang"),
          lines,
          lineNumbers: has(argv, "--line-numbers"),
        }),
        common.out,
      );
    }
    if (cmd === "project") {
      const items = parsePairItems(takeAll(argv, "--item")).map((item) => ({ label: item.label, value: item.value }));
      return emit(
        project({
          ...base(common),
          name: take(argv, "--name") ?? "project",
          description: take(argv, "--description"),
          host: take(argv, "--host"),
          items,
          tags: takeAll(argv, "--tag"),
        }),
        common.out,
      );
    }
    if (cmd === "wave") {
      return emit(
        wave({
          ...base(common),
          title: take(argv, "--title") ?? "svgforge",
          subtitle: take(argv, "--subtitle"),
          animate: has(argv, "--animate"),
        }),
        common.out,
      );
    }
    if (cmd === "timeline") {
      const items = takeAll(argv, "--item").map((pair) => {
        const [date, ...rest] = pair.split("=");
        return { date, label: rest.join("=") };
      });
      if (items.length === 0) throw new Error("timeline needs --item Date=Label (repeat)");
      return emit(
        timeline({ ...base(common), title: take(argv, "--title") ?? "Timeline", items }),
        common.out,
      );
    }
    if (cmd === "contributions") {
      const file = take(argv, "--file");
      const seed = Number(take(argv, "--seed"));
      const density = Number(take(argv, "--density") ?? "0.4");
      let weeks: number[][];
      if (file) {
        const payload = JSON.parse(readFileSync(resolve(file), "utf8")) as unknown;
        const raw = Array.isArray(payload) ? payload : (payload as { weeks?: number[][] })?.weeks;
        if (!Array.isArray(raw)) {
          throw new Error("contributions --file expects a JSON array of weeks (or { weeks: [...] })");
        }
        weeks = raw;
      } else if (Number.isFinite(seed) && take(argv, "--seed") !== undefined) {
        weeks = randomWeeks(
          Math.trunc(seed),
          Number.isFinite(density) && density > 0 && density < 1 ? density : 0.4,
        );
      } else {
        throw new Error("contributions needs --seed <n> or --file <weeks.json>");
      }
      const total = Number(take(argv, "--total"));
      return emit(
        contributions({
          ...base(common),
          title: take(argv, "--title"),
          weeks,
          total: Number.isFinite(total) ? total : undefined,
        }),
        common.out,
      );
    }
    if (cmd === "render") {
      const file = argv[1];
      if (!file) {
        console.error("render requires a manifest json");
        return 1;
      }
      const manifest = JSON.parse(readFileSync(resolve(file), "utf8")) as Manifest;
      const cliVars: Record<string, string | number> = {};
      for (const pair of takeAll(argv, "--set")) {
        const idx = pair.indexOf("=");
        if (idx <= 0) throw new Error(`--set expects key=value, got: ${pair}`);
        cliVars[pair.slice(0, idx)] = pair.slice(idx + 1);
      }
      const merged: Manifest = {
        ...manifest,
        vars: { ...(manifest.vars ?? {}), ...cliVars },
      };
      const dir = resolve(common.out ?? ".");
      mkdirSync(dir, { recursive: true });
      for (const item of renderManifest(merged)) {
        const target = safeOutputPath(dir, item.file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, item.svg);
        console.log(`wrote ${target}`);
      }
      return 0;
    }
    if (cmd === "demo") {
      const dir = resolve(common.out ?? "svgforge-demo");
      mkdirSync(dir, { recursive: true });
      for (const item of demoCards(common)) {
        const target = safeOutputPath(dir, item.file);
        writeFileSync(target, renderCard(item.card, common.theme));
        console.log(`wrote ${target}`);
      }
      return 0;
    }
    console.error(`unknown command: ${cmd}`);
    return 1;
  } catch (error) {
    console.error((error as Error).message);
    return 1;
  }
}

if (invokedDirectly(import.meta.url)) process.exitCode = run(process.argv.slice(2));
