import { cardTheme, escapeXml, fontStack, shadowAttr, shadowFilter, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface CoverOptions extends BaseCardOptions {
  kicker?: string;
  title: string;
  subtitle?: string;
}

export function cover(options: CoverOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 880;
  const height = options.height ?? 280;
  const sans = fontStack(options.font, "sans");
  const gid = svgId(options.title, "cover");
  const inner = `
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="55%" stop-color="${theme.line}"/>
      <stop offset="100%" stop-color="${theme.bg2}"/>
    </linearGradient>
    ${shadowFilter(`${gid}-s`, options.shadow)}
  </defs>
  <rect width="${width}" height="${height}" rx="${options.radius ?? 24}" fill="${options.flat ? theme.bg : `url(#${gid})`}"${shadowAttr(`${gid}-s`, options.shadow)}/>
  <circle cx="${width - 90}" cy="70" r="120" fill="${theme.accent}" fill-opacity="0.16"/>
  <circle cx="80" cy="${height - 20}" r="70" fill="${theme.accent2}" fill-opacity="0.18"/>
  <text x="48" y="${height * 0.38}" fill="${theme.accent}" font-family="${sans}" font-size="14" letter-spacing="3">${escapeXml((options.kicker ?? "").toUpperCase())}</text>
  <text x="48" y="${height * 0.56}" fill="${theme.text}" font-family="${sans}" font-size="48" font-weight="800">${escapeXml(options.title)}</text>
  <text x="48" y="${height * 0.72}" fill="${theme.muted}" font-family="${sans}" font-size="18">${escapeXml(options.subtitle ?? "")}</text>
`;
  return wrap(options.title, inner, width, height, options);
}
