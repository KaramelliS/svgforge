import { cardTheme, escapeXml, fontStack, isValidColor, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface BannerOptions extends BaseCardOptions {
  title: string;
  subtitle?: string;
  tag?: string;
  logo?: string;
  gradient?: [string, string];
}

export function banner(options: BannerOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 880;
  const height = options.height ?? 160;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const gid = svgId(`${options.title}|${theme.name}`, "grad");
  let gradientFill: string;
  if (options.gradient) {
    const [from, to] = options.gradient;
    if (!isValidColor(from) || !isValidColor(to)) {
      throw new Error("invalid --gradient colors (use #rrggbb,#rrggbb)");
    }
    gradientFill = `<defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#${gid})"/>`;
  } else if (options.flat) {
    gradientFill = `<rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}"/>`;
  } else {
    gradientFill = `<defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="55%" stop-color="${theme.line}"/>
      <stop offset="100%" stop-color="${theme.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#${gid})"/>`;
  }
  const logoShift = options.logo ? Math.ceil(options.logo.length * 26) + 18 : 0;
  const textX = 44 + logoShift;
  const titleY = options.tag ? 84 : 72;
  const subtitleY = options.tag ? 120 : 112;
  const tag = options.tag
    ? `\n  <text x="44" y="48" fill="${theme.accent}" font-family="${sans}" font-size="12" letter-spacing="3">${escapeXml(options.tag.toUpperCase())}</text>`
    : "";
  const logo = options.logo
    ? `\n  <text x="44" y="${titleY + 2}" fill="${theme.accent}" font-family="${sans}" font-size="40">${escapeXml(options.logo)}</text>`
    : "";
  const inner = `
${gradientFill}
  <circle cx="${width - 70}" cy="40" r="90" fill="${theme.accent2}" fill-opacity="0.18"/>${tag}${logo}
  <text x="${textX}" y="${titleY}" fill="${theme.text}" font-family="${mono}" font-size="40" font-weight="700">${escapeXml(options.title)}</text>
  <text x="${textX}" y="${subtitleY}" fill="${theme.muted}" font-family="${sans}" font-size="18">${escapeXml(options.subtitle ?? "")}</text>
`;
  return wrap(options.title, inner, width, height);
}
