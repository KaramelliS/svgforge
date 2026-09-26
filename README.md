<p align="center">
  <img src="examples/banner.svg" alt="svgforge" width="100%">
</p>

<p align="center">
  <strong>Generate GitHub README SVGs on your machine.</strong><br/>
  Banners, stat cards, skill bars, terminals, badges, quotes, timelines,
  contribution heatmaps, donut charts, dividers. No third-party render service.
</p>

<p align="center">
  <a href="https://github.com/KodYazicam/svgforge/actions"><img src="https://img.shields.io/github/actions/workflow/status/KodYazicam/svgforge/ci.yml?style=flat-square" alt="CI"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square" alt="Node">
  <img src="https://img.shields.io/badge/license-KYAL--1.0-7C3AED?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/author-KodYazicam-0D0D0D?style=flat-square" alt="Author">
</p>

---

capsule-render, github-readme-stats, and typing SVGs look great until the CDN is down or the theme breaks. **svgforge** writes the same kind of cards as files you commit. GitHub serves them from your repo. No camo outage, no rate limit, no query-string theme API.

```bash
git clone https://github.com/KodYazicam/svgforge.git
cd svgforge && npm ci && npm run build
node dist/cli.js banner --title ctxpack --subtitle "Pack a codebase into LLM context" -o assets/banner.svg
```
After `npm ci && npm run build`, the CLI is `node dist/cli.js`. `npm link` in this clone puts `svgforge` on your PATH. From another project that file-depends on this repo:

```ts
import { banner } from "@kodyazicam/svgforge";
```

<p align="center">
  <img src="examples/stats.svg" alt="stats">
  <img src="examples/skills.svg" alt="skills">
</p>

<p align="center">
  <img src="examples/terminal.svg" alt="terminal" width="100%">
</p>

<p align="center">
  <img src="examples/timeline.svg" alt="timeline" width="100%">
</p>

<p align="center">
  <img src="examples/contrib.svg" alt="contributions" width="100%">
</p>

<p align="center">
  <img src="examples/donut.svg" alt="donut">
  <img src="examples/quote.svg" alt="quote">
</p>

<p align="center">
  <img src="examples/divider.svg" alt="divider" width="100%">
</p>

## Table of contents

- [Requirements](#requirements)
- [Install](#install)
- [Quick start](#quick-start)
- [Card types](#card-types)
- [Themes](#themes)
- [CLI](#cli)
- [Manifest](#manifest)
- [Path confinement](#path-confinement)
- [Library](#library)
- [GitHub README usage](#github-readme-usage)
- [Escaping and limits](#escaping-and-limits)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [License](#license--kyal-10)

## Requirements

- Node.js **20+**
- No canvas, no browser, no network

## Install

Not on npm. Clone and build:

```bash
git clone https://github.com/KodYazicam/svgforge.git
cd svgforge
npm ci
npm test
npm run build
node dist/cli.js banner --title hello -o banner.svg
# optional: npm link
```

## Quick start

```bash
svgforge banner --title hookyard --subtitle "Catch webhooks" --theme tokyonight -o banner.svg
svgforge stats --item Stars=12 --item Forks=3 -o stats.svg
svgforge skills --item TypeScript=90 --item Python=80 -o skills.svg
svgforge terminal --line "$ hookyard --port 4242" --line "listening" -o term.svg
svgforge badge --label license --value KYAL-1.0 -o badge.svg
svgforge quote --text "Readable beats clever." --author KodYazicam -o quote.svg
svgforge timeline --item 2024-01="v1.0 shipped" --item 2024-06="CI green" -o tl.svg
svgforge contributions --seed 42 --total 1337 -o contrib.svg
svgforge donut --item TypeScript=60 --item Python=30 --item Go=10 -o donut.svg
svgforge divider --label docs -o divider.svg
svgforge render examples/demo.json -o examples/
svgforge themes
```

Without `-o` / `--out`, SVG goes to stdout (redirect with `> file.svg`).

## Card types

| Type | Flags | Use |
| --- | --- | --- |
| `banner` | `--title` `--subtitle` | Hero header. Gradient IDs are unique per title so two banners on one README do not paint each other. |
| `stats` | `--title` `--item Label=Value` (repeat) | Label / value rows |
| `skills` | `--title` `--item Name=0-100` (repeat) | Percentage bars (clamped 0–100; invalid → 0) |
| `terminal` | `--title` `--line text` (repeat) | Fake shell; lines starting with `$` or `>` use the accent color |
| `badge` | `--label` `--value` | Tiny pill |
| `quote` | `--text` `--author` | Testimonial / pull-quote card; long text wraps, oversized words hard-split |
| `timeline` | `--title` `--item Date=Label` (repeat) | Milestone rail with dots; last dot uses the second accent |
| `contributions` | `--file weeks.json` or `--seed n [--density d]`, `--total`, `--title` | GitHub-style 52-week heatmap with a Less/More legend |
| `donut` | `--title` `--item Label=Value` (repeat) | Donut chart (SVG arcs) with a legend and percentages; center shows the total |
| `divider` | `--label` | Section separator; accent segment on the left, optional centered chip |

All commands accept `--theme`. `stats`, `skills`, `terminal`, `quote`, `timeline`, `donut`, and `divider` also accept `--width` (minimum 320; dividers 120).

## Themes

`midnight` (default) · `tokyonight` · `dracula` · `nord` · `github` · `github-light` · `catppuccin` · `gruvbox` · `rose-pine`

```bash
svgforge themes
```

Unknown names fall back to `midnight`. The `github-light` theme is the one to pair with light-mode READMEs; every other theme is dark. `contributions` derives its five heat levels from the theme's accent, so each theme renders a matching heatmap.

## CLI

```text
svgforge banner|stats|skills|terminal|badge|quote|timeline|contributions|donut|divider
       [flags] [-o file.svg] [--theme name] [--width n]
svgforge render manifest.json -o ./outdir
svgforge themes
svgforge --help
svgforge --version
```

`render` writes one file per card. Nested `out` paths are created (`assets/hero/banner.svg`) **inside** `-o`.

## Manifest

`render` reads a JSON manifest and writes every card in one pass. Top-level `theme` applies to all cards; a per-card `theme` overrides it. `out` is the filename relative to `-o` (default `banner-1.svg`, `stats-2.svg`, … in card order).

Every card shape, with all fields:

```json
{
  "theme": "midnight",
  "cards": [
    { "type": "banner", "title": "ctxpack", "subtitle": "LLM context packer", "width": 880, "height": 160, "out": "banner.svg" },

    { "type": "stats", "title": "Open source", "width": 480,
      "items": [{ "label": "Tools shipped", "value": "5" }, { "label": "License", "value": "KYAL-1.0" }] },

    { "type": "skills", "title": "Stack", "width": 520,
      "items": [{ "name": "TypeScript", "level": 90 }, { "name": "Python", "level": 84 }] },

    { "type": "terminal", "title": "kodyazicam@github", "width": 720,
      "lines": ["$ node dist/cli.js . -o prompt.md", "wrote prompt.md  files=42"] },

    { "type": "badge", "label": "license", "value": "KYAL-1.0" },

    { "type": "quote", "quote": "Readable beats clever.", "author": "KodYazicam", "width": 480 },

    { "type": "timeline", "title": "Roadmap", "width": 560,
      "items": [{ "date": "2024-01", "label": "v1.0 shipped" }, { "date": "2024-06", "label": "CI green" }] },

    { "type": "contributions", "title": "Contributions", "total": 1337,
      "weeks": [[0,1,2,0,0,1,0], [1,3,0,0,2,0,1]] },

    { "type": "donut", "title": "Languages", "width": 520,
      "slices": [
        { "label": "TypeScript", "value": 58 },
        { "label": "Python", "value": 24, "color": "#ff79c6" }
      ] },

    { "type": "divider", "label": "docs", "width": 720 }
  ]
}
```

Notes per card:

- **contributions** — `weeks` is up to 52 arrays of 7 levels (`0–4`, clamped; shorter weeks are zero-padded; non-numeric values become `0`). Five heat colors are derived from the theme accent. `total` is optional display text.
- **donut** — slices with non-positive or non-numeric `value` are dropped. An optional `color` (hex) overrides the theme palette. Percentages are computed from the surviving values; the center number is their sum.
- **timeline** — the last item's dot uses `accent2` so "today" stands out.
- **divider** — omit `label` for a bare 18px-high separator.

`examples/demo.json` is a complete, committed example; `npm run examples` re-renders `examples/*.svg` from it.

## Path confinement

`out` values that contain `..`, that are absolute (`/etc/cron.d/pwn.svg`), or that would resolve outside `-o` are **rejected**. Do not feed an untrusted manifest to `render` and expect writes to stay in the output directory — and if you find a bypass, see [SECURITY.md](./SECURITY.md).

## Library

After `npm install /path/to/svgforge` (this clone):

```ts
import { banner, skills, renderManifest, THEMES } from "@kodyazicam/svgforge";

const svg = banner({
  title: "envsentinel",
  subtitle: "Lint your .env",
  theme: "nord",
});

const files = renderManifest({
  theme: "midnight",
  cards: [{ type: "badge", label: "license", value: "KYAL-1.0", out: "badge.svg" }],
});
```

Exports: `banner`, `stats`, `skills`, `terminal`, `badge`, `quote`, `timeline`, `contributions`, `donut`, `divider`, `renderCard`, `renderManifest`, `safeOutputPath`, `THEMES`, `resolveTheme`, `escapeXml`, `svgId`, `mixHex`, `seededRandom`, `randomWeeks`, `levelColors`, plus the option/slice/item types.

`mixHex(a, b, t)` blends two hex colors and `seededRandom(seed)` is a deterministic PRNG — both are what the derived palettes and the seeded contribution graphs use, and both are exported so your own cards can reuse them.

## GitHub README usage

Commit the SVG, then:

```markdown
<p align="center">
  <img src="assets/banner.svg" alt="my-tool" width="100%">
</p>
```

Relative paths work on GitHub, npm, and clones. Do not hotlink a render API if you want the image to survive that API.

Dark GitHub UI: use `midnight`, `tokyonight`, `dracula`, or `github`. Light UI: `github-light` or `nord`.

The KodYazicam profile README uses the same generator so a Vercel 402 cannot blank the header.

## Escaping and limits

All user strings go through `escapeXml` (`& < > " '`). Titles like `A&B <C>` will not break the SVG.

Skill `level` is clamped to 0–100. Non-numeric CLI values become 0. Donut slice values must be positive numbers; anything else is dropped before percentages are computed. Contribution weeks are clamped to 52 weeks of 7 levels, each level 0–4.

Seeded things are **deterministic**: the same `--seed` renders byte-identical `contributions` output, and `randomWeeks(seed)` in the library returns the same array every call. No hidden `Math.random()` anywhere in a card.

Fonts are generic (`ui-monospace`, `ui-sans-serif`) so GitHub’s renderer does not need webfonts.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Blank / tiny image on GitHub | Wait for cache; hard-refresh. Path must be committed, not gitignored |
| Theme ignored | Name must be one of `svgforge themes`. Unknown names fall back to `midnight` |
| `--item` parsed wrong | Use `Label=Value` with no spaces around `=`, or quote: `--item "Stars=12"` |
| `contributions` exits 1 | Pass `--seed <n>` (demo data) or `--file weeks.json` (real data). The file must be a JSON array (or `{ "weeks": [...] }`) |
| `contributions --file` shape | Up to 52 arrays of 7 numbers `0–4`; shorter weeks are zero-padded |
| `donut` exits 1 | Needs at least one `--item Label=Value` with a positive numeric value |
| `render` missing files | Pass `-o` directory; check `out` filenames in the JSON |
| `refusing path traversal` | `out` tried to leave the output directory. Use a relative name |
| Two banners look identical | Old files used `id="g"`. Rebuild with this version (unique gradient ids) |
| XML entity in title | Already escaped. If you double-escape you will see `&amp;amp;` |

## FAQ

**Can it fetch GitHub stats live?** No. That is the point. Pass numbers you control. For the contributions heatmap, feed your real daily counts via `--file` (52 arrays of levels), or use `--seed` for a stand-in graph while the README is young.

**Where do contribution levels come from?** You map them: 0 = no activity, 1–4 = buckets you choose (1–3, 4–7, 8–11, 12+ commits, say). svgforge never invents data unless you ask it to (`--seed`).

**Animated banners?** Not in v1. Static SVG only.

**Can I edit the SVG in Figma?** Yes. It is plain SVG.

**Is it on npm?** No. Clone this repo. The package name in `package.json` is `@kodyazicam/svgforge` so a local `npm link` does not collide with the unrelated public `svgforge` package.

## License — KYAL-1.0

Free to use and modify. **Attribution is mandatory.**

```
Author : Batuhan (KodYazicam)
Project: svgforge
Source : https://github.com/KodYazicam/svgforge
```

See [LICENSE](./LICENSE).

<p align="center"><sub>Built by <a href="https://github.com/KodYazicam">KodYazicam</a></sub></p>
