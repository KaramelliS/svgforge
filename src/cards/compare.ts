import { borderAttr, cardTheme, escapeXml, fontStack, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface CompareOptions extends BaseCardOptions {
  title?: string;
  left: string;
  right: string;
  items: Array<{ label: string; left: string; right: string }>;
}

export function compare(options: CompareOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 680;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const items = options.items;
  if (items.length === 0) throw new Error("compare needs --item Label|left|right");
  const gid = svgId(options.title ?? "compare", "cmp");
  const height = 88 + items.length * 36;
  const mid = Math.round(width * 0.42);
  const rightX = Math.round(width * 0.72);
  const rows = items
    .map((item, i) => {
      const y = 96 + i * 36;
      return `  <text x="28" y="${y}" fill="${theme.muted}" font-family="${sans}" font-size="14">${escapeXml(item.label)}</text>
  <text x="${mid}" y="${y}" fill="${theme.text}" font-family="${mono}" font-size="14">${escapeXml(item.left)}</text>
  <text x="${rightX}" y="${y}" fill="${theme.accent}" font-family="${mono}" font-size="14" font-weight="700">${escapeXml(item.right)}</text>`;
    })
    .join("\n");
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Compare")}</text>
  <text x="${mid}" y="64" fill="${theme.muted}" font-family="${sans}" font-size="13" font-weight="700">${escapeXml(options.left)}</text>
  <text x="${rightX}" y="64" fill="${theme.accent}" font-family="${sans}" font-size="13" font-weight="700">${escapeXml(options.right)}</text>
${rows}
`;
  return wrap(options.title ?? "compare", inner, width, height, options);
}
