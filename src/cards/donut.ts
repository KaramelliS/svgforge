import { borderAttr, cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface DonutItem {
  label: string;
  value: number;
}

export interface DonutOptions extends BaseCardOptions {
  title?: string;
  items: DonutItem[];
  center?: string;
  unit?: string;
}

export function donut(options: DonutOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 460;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const items = options.items;
  const total = items.reduce((sum, item) => sum + (Number.isFinite(item.value) ? item.value : 0), 0);
  if (items.length === 0 || total <= 0) {
    throw new Error("donut needs at least one item with a positive value (--item Label=Value)");
  }
  const palette = [theme.accent, theme.accent2, theme.text, theme.muted, theme.line];
  const cx = 86;
  const cy = 118;
  const r = 54;
  const stroke = 18;
  const circumference = 2 * Math.PI * r;
  const legendX = 172;
  const legendWidth = width - legendX - 28;
  const legendRows = items
    .map((item, i) => {
      const y = 86 + i * 30;
      const pct = Math.round((item.value / total) * 100);
      const value = `${item.value}${options.unit ?? ""}`;
      return `
  <rect x="${legendX}" y="${y - 10}" width="10" height="10" rx="2" fill="${palette[i % palette.length]}"/>
  <text x="${legendX + 20}" y="${y}" fill="${theme.muted}" font-family="${sans}" font-size="13">${escapeXml(item.label)}</text>
  <text x="${legendX + legendWidth}" y="${y}" text-anchor="end" fill="${theme.text}" font-family="${mono}" font-size="13" font-weight="700">${escapeXml(value)} · ${pct}%</text>`;
    })
    .join("");
  let offset = 0;
  const segments = items
    .map((item, i) => {
      const fraction = item.value / total;
      const dash = Math.max(0, circumference * fraction - 2);
      const segment = `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${palette[i % palette.length]}" stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(2)} ${circumference.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"/>`;
      offset += circumference * fraction;
      return segment;
    })
    .join("\n");
  const height = Math.max(190, 64 + items.length * 30 + 28);
  const centerText = options.center
    ? `\n  <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="${theme.text}" font-family="${mono}" font-size="18" font-weight="700">${escapeXml(options.center)}</text>`
    : "";
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <g transform="rotate(-90 ${cx} ${cy})">
${segments}
  </g>${centerText}
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Donut")}</text>
${legendRows}
`;
  return wrap(options.title ?? "donut", inner, width, height);
}
