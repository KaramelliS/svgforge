import { borderAttr, cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface StatItem {
  label: string;
  value: string | number;
}

export interface StatsOptions extends BaseCardOptions {
  title?: string;
  items: StatItem[];
}

export function stats(options: StatsOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 480;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const rows = options.items;
  const height = 64 + rows.length * 36;
  const body = rows
    .map((item, i) => {
      const y = 70 + i * 36;
      return `
  <text x="28" y="${y}" fill="${theme.muted}" font-family="${sans}" font-size="14">${escapeXml(item.label)}</text>
  <text x="${width - 28}" y="${y}" text-anchor="end" fill="${theme.text}" font-family="${mono}" font-size="16" font-weight="700">${escapeXml(String(item.value))}</text>`;
    })
    .join("");
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <rect x="0" y="0" width="8" height="${height}" rx="4" fill="${theme.accent}"/>
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Stats")}</text>
${body}
`;
  return wrap(options.title ?? "stats", inner, width, height, options);
}
