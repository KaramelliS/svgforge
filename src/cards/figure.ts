import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface FigureOptions extends BaseCardOptions {
  url: string;
  caption?: string;
  alt?: string;
  fit?: "cover" | "contain";
}

export function assertHttpsUrl(url: string): string {
  if (!/^https:\/\//i.test(url)) {
    throw new Error(`figure only accepts https urls, got: ${url}`);
  }
  return url;
}

export function figure(options: FigureOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 640;
  const height = options.height ?? 260;
  const radius = options.radius ?? 16;
  const sans = fontStack(options.font, "sans");
  const fit = options.fit === "contain" ? "xMidYMid meet" : "xMidYMid slice";
  const captionY = options.caption ? height - 18 : 0;
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"/>
  <clipPath id="fig-clip-${width}x${height}">
    <rect x="12" y="12" width="${width - 24}" height="${(options.caption ? height - 52 : height) - 24}" rx="${Math.max(0, radius - 8)}"/>
  </clipPath>
  <image href="${escapeXml(assertHttpsUrl(options.url))}" x="12" y="12" width="${width - 24}" height="${(options.caption ? height - 52 : height) - 24}" preserveAspectRatio="${fit}" clip-path="url(#fig-clip-${width}x${height})"/>
${options.caption ? `  <text x="${width / 2}" y="${captionY}" text-anchor="middle" fill="${theme.muted}" font-family="${sans}" font-size="13">${escapeXml(options.caption)}</text>` : ""}
`;
  return wrap(options.alt ?? options.caption ?? "figure", inner, width, height);
}
