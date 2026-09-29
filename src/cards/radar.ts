import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface RadarItem {
  label: string;
  value: number;
}

export interface RadarOptions extends BaseCardOptions {
  title?: string;
  items: RadarItem[];
  levels?: number;
}

const STAR = "★";

export function radar(options: RadarOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 440;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const items = options.items.map((item) => ({
    label: item.label,
    value: Math.max(0, Math.min(100, Number.isFinite(item.value) ? item.value : 0)),
  }));
  if (items.length < 3) {
    throw new Error("radar needs at least three axes (--item Axis=level)");
  }
  const levels = Math.max(2, Math.min(6, options.levels ?? 4));
  const height = 340;
  const cx = width / 2;
  const cy = 188;
  const maxR = 92;
  const n = items.length;
  const angle = (i: number): number => (-90 + (360 * i) / n) * (Math.PI / 180);
  const point = (i: number, r: number): { x: number; y: number } => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });
  const rings = Array.from({ length: levels }, (_, level) => {
    const r = (maxR * (level + 1)) / levels;
    const points = items.map((_, i) => point(i, r));
    const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
    return `  <path d="${d}" fill="none" stroke="${theme.line}" stroke-width="1"/>`;
  }).join("\n");
  const spokes = items
    .map((_, i) => {
      const p = point(i, maxR);
      return `  <line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${theme.line}" stroke-width="1"/>`;
    })
    .join("\n");
  const valuePoints = items.map((item, i) => point(i, (maxR * item.value) / 100));
  const polygon = valuePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
  const dots = valuePoints
    .map((p) => `  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${theme.accent}"/>`)
    .join("\n");
  const labels = items
    .map((item, i) => {
      const p = point(i, maxR + 22);
      const cos = Math.cos(angle(i));
      const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
      const dy = Math.sin(angle(i)) < -0.3 ? -6 : Math.sin(angle(i)) > 0.3 ? 14 : 4;
      return `  <text x="${p.x.toFixed(1)}" y="${(p.y + dy).toFixed(1)}" text-anchor="${anchor}" fill="${theme.muted}" font-family="${sans}" font-size="12">${escapeXml(item.label)}</text>`;
    })
    .join("\n");
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"/>
  <text x="28" y="38" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Radar")}</text>
${rings}
${spokes}
  <path d="${polygon}" fill="${theme.accent}" fill-opacity="0.14" stroke="${theme.accent}" stroke-width="2" stroke-linejoin="round"/>
${dots}
${labels}
  <text x="${width - 28}" y="${height - 20}" text-anchor="end" fill="${theme.muted}" font-family="${mono}" font-size="12">${STAR} 0–100</text>
`;
  return wrap(options.title ?? "radar", inner, width, height, options);
}
