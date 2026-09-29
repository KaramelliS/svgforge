import { borderAttr, cardTheme, escapeXml, fontStack, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface StepsOptions extends BaseCardOptions {
  title?: string;
  items: string[];
}

export function steps(options: StepsOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 640;
  const radius = options.radius ?? 16;
  const sans = fontStack(options.font, "sans");
  const items = options.items.filter(Boolean);
  if (items.length === 0) throw new Error("steps needs --item text (repeat)");
  const gid = svgId(options.title ?? "steps", "steps");
  const row = 52;
  const height = 64 + items.length * row;
  const body = items
    .map((item, i) => {
      const y = 78 + i * row;
      const done = i < items.length - 1;
      return `  <circle cx="40" cy="${y}" r="14" fill="${done ? theme.accent : theme.bg2}" stroke="${theme.accent}"/>
  <text x="40" y="${y + 5}" text-anchor="middle" fill="${done ? theme.bg : theme.accent}" font-family="${sans}" font-size="13" font-weight="700">${i + 1}</text>
  <text x="68" y="${y + 5}" fill="${theme.text}" font-family="${sans}" font-size="15">${escapeXml(item)}</text>`;
    })
    .join("\n");
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Steps")}</text>
${body}
`;
  return wrap(options.title ?? "steps", inner, width, height, options);
}
