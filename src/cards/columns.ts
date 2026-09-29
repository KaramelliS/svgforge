import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface ColumnItem {
  label: string;
  value: number;
}

export interface ColumnsOptions extends BaseCardOptions {
  title?: string;
  items: ColumnItem[];
  unit?: string;
}

export function columns(options: ColumnsOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 560;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const items = options.items.map((item) => ({
    label: item.label,
    value: Number.isFinite(item.value) ? item.value : 0,
  }));
  if (items.length === 0) {
    throw new Error("columns needs at least one item (--item Label=Value)");
  }
  const height = 260;
  const plotTop = 64;
  const baseline = height - 48;
  const plotH = baseline - plotTop;
  const slot = (width - 56) / items.length;
  const barW = Math.max(10, Math.min(64, slot * 0.6));
  const max = Math.max(...items.map((item) => item.value), 1);
  const bars = items
    .map((item, i) => {
      const x = 28 + slot * i + (slot - barW) / 2;
      const barH = Math.max(2, (plotH * item.value) / max);
      const y = baseline - barH;
      const value = `${item.value}${options.unit ?? ""}`;
      return `
  <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="4" fill="${theme.accent}"/>
  <text x="${(x + barW / 2).toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle" fill="${theme.text}" font-family="${mono}" font-size="12" font-weight="700">${escapeXml(value)}</text>
  <text x="${(x + barW / 2).toFixed(1)}" y="${baseline + 18}" text-anchor="middle" fill="${theme.muted}" font-family="${sans}" font-size="12">${escapeXml(item.label)}</text>`;
    })
    .join("");
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"/>
  <text x="28" y="38" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Columns")}</text>
  <line x1="28" y1="${baseline}" x2="${width - 28}" y2="${baseline}" stroke="${theme.line}" stroke-width="2"/>
${bars}
`;
  return wrap(options.title ?? "columns", inner, width, height);
}
