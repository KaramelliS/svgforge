import { borderAttr, cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface ChartItem {
  label: string;
  value: number;
}

export interface ChartOptions extends BaseCardOptions {
  title?: string;
  items: ChartItem[];
  unit?: string;
}

export function chart(options: ChartOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 520;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const items = options.items;
  if (items.length === 0) {
    throw new Error("chart needs at least one item (--item Label=Value)");
  }
  const values = items.map((item) => (Number.isFinite(item.value) ? item.value : 0));
  const max = Math.max(...values, 1);
  const barWidth = width - 200;
  const body = items
    .map((item, i) => {
      const y = 64 + i * 40;
      const value = Number.isFinite(item.value) ? item.value : 0;
      const filled = Math.max(2, Math.round((barWidth * value) / max));
      const label = `${value}${options.unit ?? ""}`;
      return `
  <text x="28" y="${y + 14}" fill="${theme.muted}" font-family="${sans}" font-size="13">${escapeXml(item.label)}</text>
  <rect x="150" y="${y + 2}" width="${barWidth}" height="12" rx="6" fill="${theme.bg2}"/>
  <rect x="150" y="${y + 2}" width="${filled}" height="12" rx="6" fill="${theme.accent}"/>
  <text x="${150 + barWidth + 14}" y="${y + 14}" fill="${theme.text}" font-family="${mono}" font-size="13" font-weight="700">${escapeXml(label)}</text>`;
    })
    .join("");
  const height = 64 + items.length * 40 + 16;
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Chart")}</text>
${body}
`;
  return wrap(options.title ?? "chart", inner, width, height);
}
