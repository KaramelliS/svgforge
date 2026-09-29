import { borderAttr, cardTheme, escapeXml, fontStack, shadowAttr, shadowFilter, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface CalloutOptions extends BaseCardOptions {
  title?: string;
  text: string;
  tone?: "info" | "tip" | "warn";
}

export function callout(options: CalloutOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 640;
  const radius = options.radius ?? 16;
  const sans = fontStack(options.font, "sans");
  const tone = options.tone ?? "info";
  const mark = tone === "warn" ? "!" : tone === "tip" ? "i" : "i";
  const gid = svgId(options.title ?? options.text.slice(0, 12), "callout");
  const height = 120;
  const inner = `
  <defs>${shadowFilter(gid, options.shadow)}</defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}${shadowAttr(gid, options.shadow)}/>
  <rect x="0" y="0" width="8" height="${height}" rx="4" fill="${tone === "warn" ? theme.accent2 : theme.accent}"/>
  <circle cx="40" cy="44" r="14" fill="${theme.bg2}"/>
  <text x="40" y="49" text-anchor="middle" fill="${theme.accent}" font-family="${sans}" font-size="16" font-weight="800">${mark}</text>
  <text x="68" y="40" fill="${theme.text}" font-family="${sans}" font-size="16" font-weight="700">${escapeXml(options.title ?? tone)}</text>
  <text x="68" y="68" fill="${theme.muted}" font-family="${sans}" font-size="14">${escapeXml(options.text)}</text>
`;
  return wrap(options.title ?? "callout", inner, width, height, options);
}
