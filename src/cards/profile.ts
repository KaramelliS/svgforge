import { borderAttr, cardTheme, escapeXml, fontStack, shadowAttr, shadowFilter, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface ProfileOptions extends BaseCardOptions {
  name: string;
  handle?: string;
  bio?: string;
  avatar?: string;
  items?: Array<{ label: string; value: string | number }>;
}

export function profile(options: ProfileOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 640;
  const radius = options.radius ?? 20;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const gid = svgId(options.name, "profile");
  const stats = options.items ?? [];
  const height = 168 + (stats.length ? 56 : 0);
  const statCols = stats
    .map((item, i) => {
      const x = 28 + i * ((width - 56) / Math.max(stats.length, 1));
      return `  <text x="${x}" y="${height - 36}" fill="${theme.muted}" font-family="${sans}" font-size="12">${escapeXml(item.label)}</text>
  <text x="${x}" y="${height - 16}" fill="${theme.text}" font-family="${mono}" font-size="16" font-weight="700">${escapeXml(String(item.value))}</text>`;
    })
    .join("\n");
  const inner = `
  <defs>${shadowFilter(gid, options.shadow)}</defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}${shadowAttr(gid, options.shadow)}/>
  <circle cx="64" cy="72" r="32" fill="${theme.accent}"/>
  <text x="64" y="80" text-anchor="middle" fill="${theme.bg}" font-family="${sans}" font-size="22" font-weight="800">${escapeXml((options.avatar ?? options.name).slice(0, 2).toUpperCase())}</text>
  <text x="112" y="62" fill="${theme.text}" font-family="${sans}" font-size="22" font-weight="700">${escapeXml(options.name)}</text>
  <text x="112" y="84" fill="${theme.accent}" font-family="${mono}" font-size="13">${escapeXml(options.handle ?? "")}</text>
  <text x="112" y="108" fill="${theme.muted}" font-family="${sans}" font-size="14">${escapeXml(options.bio ?? "")}</text>
${statCols}
`;
  return wrap(options.name, inner, width, height, options);
}
