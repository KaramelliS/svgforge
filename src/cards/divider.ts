import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface DividerOptions extends BaseCardOptions {
  label?: string;
}

export function divider(options: DividerOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 880;
  const height = options.height ?? 40;
  const sans = fontStack(options.font, "sans");
  const y = Math.round(height / 2);
  let inner: string;
  if (options.label) {
    const label = escapeXml(options.label);
    const half = Math.ceil(options.label.length * 4.2 + 18);
    const gap = 14;
    inner = `
  <rect x="0" y="${y - 1}" width="${width / 2 - half - gap}" height="2" fill="${theme.line}"/>
  <rect x="${width / 2 + half + gap}" y="${y - 1}" width="${width / 2 - half - gap}" height="2" fill="${theme.line}"/>
  <rect x="${width / 2 - half}" y="${y - 11}" width="${half * 2}" height="22" rx="11" fill="${theme.bg2}" stroke="${theme.line}"/>
  <text x="${width / 2}" y="${y + 4}" text-anchor="middle" fill="${theme.muted}" font-family="${sans}" font-size="12" letter-spacing="1.5">${label}</text>
`;
  } else {
    inner = `
  <rect x="0" y="${y - 1}" width="${width / 2 - 40}" height="2" fill="${theme.line}"/>
  <rect x="${width / 2 - 40}" y="${y - 1}" width="80" height="2" fill="${theme.accent}"/>
  <rect x="${width / 2 + 40}" y="${y - 1}" width="${width / 2 - 40}" height="2" fill="${theme.line}"/>
`;
  }
  return wrap(options.label ?? "divider", inner, width, height, options);
}
