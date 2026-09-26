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
import { renderManifest, safeOutputPath } from "../src/render.js";
import { escapeXml } from "../src/escape.js";
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

  it("rejects path traversal in manifest out", () => {
    expect(() =>
      renderManifest({
        cards: [{ type: "banner", title: "x", out: "../evil.svg" }],
      }),
    ).toThrow(/traversal/);
    expect(() => safeOutputPath("/tmp/out", "../evil.svg")).toThrow(/traversal/);
  });
});
