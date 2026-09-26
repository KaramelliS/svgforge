import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { banner } from "../src/cards/banner.js";
import { stats } from "../src/cards/stats.js";
import { skills } from "../src/cards/skills.js";
import { terminal } from "../src/cards/terminal.js";
import { badge } from "../src/cards/badge.js";
import { quote } from "../src/cards/quote.js";
import { timeline } from "../src/cards/timeline.js";
import { contributions, randomWeeks, levelColors } from "../src/cards/contrib.js";
import { donut } from "../src/cards/donut.js";
import { divider } from "../src/cards/divider.js";
import { renderManifest, safeOutputPath } from "../src/render.js";
import { escapeXml, mixHex, seededRandom, THEMES } from "../src/escape.js";
import { run } from "../src/cli.js";

describe("cards", () => {
  it("escapes XML in titles", () => {
    const svg = banner({ title: "A&B <C>", subtitle: '"hi"' });
    expect(svg).toContain("A&amp;B &lt;C&gt;");
    expect(svg).toContain("&quot;hi&quot;");
    expect(svg).toContain("<svg");
  });

  it("renders stats, skills, terminal, badge, quote", () => {
    expect(stats({ items: [{ label: "Stars", value: 12 }] })).toContain("Stars");
    expect(skills({ items: [{ name: "TS", level: 80 }] })).toContain("rect");
    expect(terminal({ lines: ["$ ls", "ok"] })).toContain("$ ls");
    expect(badge({ label: "license", value: "KYAL-1.0" })).toContain("KYAL-1.0");
    const svg = quote({ quote: "Readable beats clever.", author: "KodYazicam" });
    expect(svg).toContain("Readable beats clever.");
    expect(svg).toContain("— KodYazicam");
    expect(svg).toContain("<svg");
  });

  it("wraps long quote text instead of overflowing and escapes XML", () => {
    const long = `${"word ".repeat(60)}<b>&</b>`;
    const svg = quote({ quote: long, width: 320 });
    expect(svg).toContain("&lt;b&gt;");
    expect(svg).toContain("&amp;");
    const lines = svg.match(/font-style="italic">[^<]*<\/text>/g) ?? [];
    expect(lines.length).toBeGreaterThan(2);
    const oversized = quote({ quote: "x".repeat(120), width: 320 });
    expect(oversized).toContain("<svg");
    expect(oversized.match(/font-size="15"/g)?.length).toBeGreaterThan(1);
  });

  it("keeps a quote without an author compact", () => {
    const svg = quote({ quote: "Ship it." });
    expect(svg).not.toContain("—");
    expect(svg).toContain("Ship it.");
  });

  it("renders timeline milestones with dots and a rail", () => {
    const svg = timeline({
      title: "Roadmap",
      items: [
        { date: "2024-01", label: "v1.0 shipped" },
        { date: "2024-06", label: "CI green" },
      ],
    });
    expect(svg).toContain("2024-01");
    expect(svg).toContain("v1.0 shipped");
    expect(svg).toContain("<circle");
    expect(svg).toContain("<line");
  });

  it("renders a 52-week contributions grid with a legend", () => {
    const weeks = randomWeeks(42, 0.5);
    expect(weeks).toHaveLength(52);
    expect(weeks[0]).toHaveLength(7);
    const svg = contributions({ title: "Contributions", weeks, total: 1337 });
    expect(svg).toContain("1337 contributions");
    expect(svg).toContain("Less");
    expect(svg).toContain("More");
    expect((svg.match(/<rect [^>]*rx="3"/g) ?? []).length).toBe(52 * 7 + 5);
  });

  it("contribution weeks are clamped to levels 0-4", () => {
    const svg = contributions({ weeks: [[9, -3, 2.7, "x", undefined as unknown as number]] });
    expect(svg).toContain("<svg");
  });

  it("randomWeeks is deterministic for a seed", () => {
    expect(randomWeeks(7)).toEqual(randomWeeks(7));
    expect(randomWeeks(7)).not.toEqual(randomWeeks(8));
  });

  it("levelColors returns five ordered hex colors", () => {
    const colors = levelColors("#0f0c29", "#a78bfa");
    expect(colors).toHaveLength(5);
    for (const color of colors) expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("renders a donut with arcs, a total, and a legend", () => {
    const svg = donut({
      title: "Languages",
      slices: [
        { label: "TypeScript", value: 60 },
        { label: "Python", value: 30 },
        { label: "Go", value: 10 },
      ],
    });
    expect(svg).toContain("TypeScript");
    expect(svg).toContain("60.0%");
    expect(svg).toContain('stroke-dasharray');
    expect((svg.match(/<circle /g) ?? []).length).toBe(1 + 3);
    expect(svg).toContain(">100<");
  });

  it("donut filters invalid slices and escapes labels", () => {
    const svg = donut({
      slices: [
        { label: "<A>", value: 2 },
        { label: "bad", value: Number.NaN },
        { label: "neg", value: -1 },
      ],
    });
    expect(svg).toContain("&lt;A&gt;");
    expect(svg).not.toContain("bad");
    expect(svg).not.toContain("neg");
  });

  it("divider renders bare and with a label chip", () => {
    expect(divider({})).toContain("<rect");
    const labeled = divider({ label: "docs" });
    expect(labeled).toContain("docs");
    expect(labeled).toContain("rx=\"12\"");
  });

  it("mixHex blends and seededRandom is stable", () => {
    expect(mixHex("#000000", "#ffffff", 0)).toBe("#000000");
    expect(mixHex("#000000", "#ffffff", 1)).toBe("#ffffff");
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mixHex("#abc", "#def", 0.5)).toMatch(/^#[0-9a-f]{6}$/);
    const rand = seededRandom(3);
    const first = rand();
    expect(rand()).not.toBe(first);
  });

  it("ships the new themes and falls back safely", () => {
    for (const name of ["github-light", "catppuccin", "gruvbox", "rose-pine"]) {
      expect(Object.keys(THEMES)).toContain(name);
      expect(banner({ title: "t", theme: name })).toContain("<svg");
    }
    expect(banner({ title: "t", theme: "nonexistent" })).toContain("#0f0c29");
    expect(banner({ title: "t", theme: "github-light" })).toContain("#ffffff");
  });

  it("clamps skill bars and namespaces banner gradients", () => {
    const svg = skills({ items: [{ name: "X", level: 150 }] });
    expect(svg).toContain('width="464"');
    expect(escapeXml("<")).toBe("&lt;");
    const a = banner({ title: "one" });
    const b = banner({ title: "two" });
    const idA = a.match(/id="(grad-[^"]+)"/)?.[1];
    const idB = b.match(/id="(grad-[^"]+)"/)?.[1];
    expect(idA).toBeTruthy();
    expect(idB).toBeTruthy();
    expect(idA).not.toBe(idB);
  });
});

describe("manifest + cli", () => {
  it("renders a json manifest to files", () => {
    const dir = mkdtempSync(join(tmpdir(), "svgforge-"));
    const manifest = join(dir, "m.json");
    writeFileSync(
      manifest,
      JSON.stringify({
        theme: "tokyonight",
        cards: [
          { type: "banner", title: "ctxpack", subtitle: "pack", out: "banner.svg" },
          { type: "badge", label: "license", value: "KYAL-1.0", out: "badge.svg" },
          { type: "quote", quote: "Readable beats clever.", author: "KodYazicam", out: "quote.svg" },
          { type: "timeline", items: [{ date: "2024-01", label: "v1.0" }], out: "timeline.svg" },
          { type: "contributions", weeks: randomWeeks(9), out: "contrib.svg" },
          { type: "donut", slices: [{ label: "TS", value: 2 }], out: "donut.svg" },
          { type: "divider", label: "docs", out: "divider.svg" },
        ],
      }),
    );
    expect(run(["render", manifest, "-o", dir])).toBe(0);
    expect(readFileSync(join(dir, "banner.svg"), "utf8")).toContain("ctxpack");
    expect(run(["themes"])).toBe(0);
    expect(run(["--help"])).toBe(0);
  });

  it("renderManifest assigns default filenames", () => {
    const out = renderManifest({
      cards: [{ type: "banner", title: "x" }],
    });
    expect(out[0].file).toBe("banner-1.svg");
    expect(out[0].svg).toContain("x");
  });

  it("the cli renders the new cards and errors cleanly", () => {
    const dir = mkdtempSync(join(tmpdir(), "svgforge-cards-"));
    expect(run(["timeline", "--item", "2024-01=v1.0", "--item", "2024-06=v1.1", "-o", `${dir}/t.svg`])).toBe(0);
    expect(readFileSync(`${dir}/t.svg`, "utf8")).toContain("v1.0");
    expect(run(["donut", "--item", "TS=60", "--item", "PY=40", "-o", `${dir}/d.svg`])).toBe(0);
    expect(readFileSync(`${dir}/d.svg`, "utf8")).toContain("TS");
    expect(run(["divider", "--label", "docs", "-o", `${dir}/div.svg`])).toBe(0);
    expect(readFileSync(`${dir}/div.svg`, "utf8")).toContain("docs");
    expect(run(["contributions", "--seed", "5", "-o", `${dir}/c.svg`])).toBe(0);
    expect(readFileSync(`${dir}/c.svg`, "utf8")).toContain("Less");
    expect(run(["contributions", "-o", `${dir}/c2.svg`])).toBe(1);
    expect(run(["timeline", "-o", `${dir}/t2.svg`])).toBe(1);
    expect(run(["donut", "--item", "x", "-o", `${dir}/d2.svg`])).toBe(1);
    expect(run(["quote", "--text", "hi", "--width", "600", "-o", `${dir}/q.svg`])).toBe(0);
    expect(readFileSync(`${dir}/q.svg`, "utf8")).toContain('width="600"');
  });

  it("contributions --file reads a weeks json", () => {
    const dir = mkdtempSync(join(tmpdir(), "svgforge-weeks-"));
    const file = join(dir, "weeks.json");
    writeFileSync(file, JSON.stringify(randomWeeks(11)));
    expect(run(["contributions", "--file", file, "-o", `${dir}/cf.svg`])).toBe(0);
    expect(readFileSync(`${dir}/cf.svg`, "utf8")).toContain("<svg");
    writeFileSync(file, JSON.stringify({ weeks: randomWeeks(12) }));
    expect(run(["contributions", "--file", file, "-o", `${dir}/cf2.svg`])).toBe(0);
    writeFileSync(file, JSON.stringify({ nope: true }));
    expect(run(["contributions", "--file", file, "-o", `${dir}/cf3.svg`])).toBe(1);
  });

  it("rejects path traversal in manifest out", () => {
    expect(() =>
      renderManifest({
        cards: [{ type: "banner", title: "x", out: "../evil.svg" }],
      }),
    ).toThrow(/traversal/);
    expect(() => safeOutputPath("/tmp/out", "../evil.svg")).toThrow(/traversal/);
  });
});
