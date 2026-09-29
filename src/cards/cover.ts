import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

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
  const dots = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) => {
      const cx = width - 96 + col * 16;
      const cy = height - 88 + row * 16;
      return `<circle cx="${cx}" cy="${cy}" r="2" fill="${theme.muted}" fill-opacity="0.35"/>`;
    }).join(""),
  ).join("");
  const inner = `
  <rect width="${width}" height="${height}" rx="${options.radius ?? 24}" fill="${theme.bg}" stroke="${theme.line}" stroke-width="1"/>
  <circle cx="${width - 110}" cy="78" r="64" fill="none" stroke="${theme.accent}" stroke-opacity="0.3" stroke-width="1.5"/>
  <circle cx="${width - 110}" cy="78" r="5" fill="${theme.accent}"/>
  ${dots}
  <rect x="48" y="${height * 0.38 - 28}" width="36" height="4" rx="2" fill="${theme.accent}"/>
  <text x="48" y="${height * 0.38}" fill="${theme.accent}" font-family="${sans}" font-size="14" letter-spacing="3">${escapeXml((options.kicker ?? "").toUpperCase())}</text>
  <text x="48" y="${height * 0.56}" fill="${theme.text}" font-family="${sans}" font-size="48" font-weight="800">${escapeXml(options.title)}</text>
  <text x="48" y="${height * 0.72}" fill="${theme.muted}" font-family="${sans}" font-size="18">${escapeXml(options.subtitle ?? "")}</text>
`;
  return wrap(options.title, inner, width, height, options);
}
