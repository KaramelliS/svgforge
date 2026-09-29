import { borderAttr, cardTheme, escapeXml, fontStack, shadowAttr, shadowFilter, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface SocialOptions extends BaseCardOptions {
  items: Array<{ name: string; handle: string }>;
}

export function social(options: SocialOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 640;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const items = options.items.filter((item) => item.name && item.handle);
  if (items.length === 0) throw new Error("social needs --item Name=handle");
  const gid = svgId(items.map((item) => item.name).join(""), "social");
  const height = 36 + items.length * 44;
  const rows = items
    .map((item, i) => {
      const y = 48 + i * 44;
      return `  <circle cx="36" cy="${y}" r="12" fill="${theme.accent}"/>
  <text x="36" y="${y + 4}" text-anchor="middle" fill="${theme.bg}" font-family="${sans}" font-size="11" font-weight="800">${escapeXml(item.name.slice(0, 1).toUpperCase())}</text>
  <text x="60" y="${y - 2}" fill="${theme.muted}" font-family="${sans}" font-size="12">${escapeXml(item.name)}</text>
  <text x="60" y="${y + 16}" fill="${theme.text}" font-family="${mono}" font-size="14">${escapeXml(item.handle)}</text>`;
    })
    .join("\n");
  const inner = `
  <defs>${shadowFilter(gid, options.shadow)}</defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}${shadowAttr(gid, options.shadow)}/>
${rows}
`;
  return wrap(items.map((item) => item.name).join(", "), inner, width, height, options);
}
