#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { banner } from "./cards/banner.js";
import { stats } from "./cards/stats.js";
import { skills } from "./cards/skills.js";
import { terminal } from "./cards/terminal.js";
import { badge } from "./cards/badge.js";
import { quote } from "./cards/quote.js";
import { timeline } from "./cards/timeline.js";
import { contributions, randomWeeks } from "./cards/contrib.js";
import { donut } from "./cards/donut.js";
import { divider } from "./cards/divider.js";
import { renderManifest, safeOutputPath, type Manifest } from "./render.js";
import { THEMES } from "./escape.js";
import { invokedDirectly } from "./main.js";
import { packageVersion } from "./version.js";

function help(): string {
  return `
svgforge — generate GitHub README SVGs locally

Usage:
  svgforge banner --title ctxpack --subtitle "Pack a codebase" -o banner.svg
  svgforge stats --title Stats --item Stars=12 --item Forks=3 -o stats.svg
  svgforge skills --item TypeScript=90 --item Python=80 -o skills.svg
  svgforge terminal --line "$ node dist/cli.js ." --line "wrote prompt.md" -o term.svg
  svgforge badge --label license --value KYAL-1.0 -o badge.svg
  svgforge quote --text "Readable beats clever." --author "KodYazicam" -o quote.svg
  svgforge timeline --item 2024-01="v1.0 shipped" --item 2024-06="CI green" -o tl.svg
  svgforge contributions --seed 42 --total 1337 -o contrib.svg
  svgforge contributions --file weeks.json -o contrib.svg
  svgforge donut --item TypeScript=60 --item Python=30 --item Go=10 -o donut.svg
  svgforge divider --label "docs" -o divider.svg
  svgforge render manifest.json -o ./assets
  svgforge themes

Options:
  --theme <name>     ${Object.keys(THEMES).join(" | ")}
  --width <n>        Card width where supported (stats, skills, terminal, quote, timeline, donut, divider)
  -o, --out <path>   Output file or directory

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

function writeOut(target: string, svg: string): void {
  mkdirSync(dirname(resolve(target)), { recursive: true });
  writeFileSync(target, svg);
  console.log(`wrote ${target}`);
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

  const theme = take(argv, "--theme");
  const out = take(argv, "-o") ?? take(argv, "--out");
  const width = Number(take(argv, "--width"));

  try {
    if (cmd === "banner") {
      const svg = banner({
        title: take(argv, "--title") ?? "svgforge",
        subtitle: take(argv, "--subtitle"),
        theme,
        width: Number.isFinite(width) && width >= 320 ? width : undefined,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "stats") {
      const items = takeAll(argv, "--item").map((pair) => {
        const [label, ...rest] = pair.split("=");
        return { label, value: rest.join("=") };
      });
      const svg = stats({
        title: take(argv, "--title") ?? "Stats",
        items,
        theme,
        width: Number.isFinite(width) && width >= 320 ? width : undefined,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "skills") {
      const items = takeAll(argv, "--item").map((pair) => {
        const [name, level] = pair.split("=");
        const n = Number(level);
        return { name, level: Number.isFinite(n) ? n : 0 };
      });
      const svg = skills({
        title: take(argv, "--title") ?? "Skills",
        items,
        theme,
        width: Number.isFinite(width) && width >= 320 ? width : undefined,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "terminal") {
      const svg = terminal({
        title: take(argv, "--title"),
        lines: takeAll(argv, "--line"),
        theme,
        width: Number.isFinite(width) && width >= 320 ? width : undefined,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "badge") {
      const svg = badge({
        label: take(argv, "--label") ?? "label",
        value: take(argv, "--value") ?? "value",
        theme,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "quote") {
      const text = take(argv, "--text") ?? take(argv, "--quote");
      if (!text) {
        console.error("quote requires --text");
        return 1;
      }
      const svg = quote({
        quote: text,
        author: take(argv, "--author"),
        theme,
        width: Number.isFinite(width) && width >= 320 ? width : undefined,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "timeline") {
      const items = takeAll(argv, "--item").map((pair) => {
        const [date, ...rest] = pair.split("=");
        return { date, label: rest.join("=") };
      });
      if (!items.length) {
        console.error("timeline requires at least one --item Date=Label");
        return 1;
      }
      const svg = timeline({
        title: take(argv, "--title"),
        items,
        theme,
        width: Number.isFinite(width) && width >= 360 ? width : undefined,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "contributions") {
      const file = take(argv, "--file");
      const seed = Number(take(argv, "--seed"));
      const density = Number(take(argv, "--density") ?? "0.4");
      let weeks: number[][];
      if (file) {
        const payload = JSON.parse(readFileSync(resolve(file), "utf8"));
        const raw = Array.isArray(payload) ? payload : payload?.weeks;
        if (!Array.isArray(raw)) {
          console.error("contributions --file expects a JSON array of weeks (or { weeks: [...] })");
          return 1;
        }
        weeks = raw;
      } else if (Number.isFinite(seed)) {
        weeks = randomWeeks(
          Math.trunc(seed),
          Number.isFinite(density) && density > 0 && density < 1 ? density : 0.4,
        );
      } else {
        console.error("contributions requires --seed <n> or --file <weeks.json>");
        return 1;
      }
      const total = Number(take(argv, "--total"));
      const svg = contributions({
        title: take(argv, "--title"),
        weeks,
        total: Number.isFinite(total) ? total : undefined,
        theme,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "donut") {
      const items = takeAll(argv, "--item").map((pair) => {
        const [label, ...rest] = pair.split("=");
        return { label, value: Number(rest.join("=")) };
      });
      const valid = items.filter((item) => Number.isFinite(item.value) && item.value > 0);
      if (!valid.length) {
        console.error("donut requires at least one --item Label=Value");
        return 1;
      }
      const svg = donut({
        title: take(argv, "--title"),
        slices: valid,
        theme,
        width: Number.isFinite(width) && width >= 360 ? width : undefined,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "divider") {
      const svg = divider({
        label: take(argv, "--label"),
        theme,
        width: Number.isFinite(width) && width >= 120 ? width : undefined,
      });
      if (out) writeOut(out, svg);
      else process.stdout.write(svg);
      return 0;
    }
    if (cmd === "render") {
      const file = argv[1];
      if (!file) {
        console.error("render requires a manifest json");
        return 1;
      }
      const manifest = JSON.parse(readFileSync(resolve(file), "utf8")) as Manifest;
      const dir = resolve(out ?? ".");
      mkdirSync(dir, { recursive: true });
      for (const item of renderManifest(manifest)) {
        const target = safeOutputPath(dir, item.file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, item.svg);
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
