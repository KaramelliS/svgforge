import { cardTheme, escapeXml, fontStack, isValidColor, type BaseCardOptions, wrap } from "../escape.js";

export interface BadgeOptions extends BaseCardOptions {
  label: string;
  value: string;
  style?: "flat" | "outline" | "plastic";
  labelColor?: string;
}

function textWidth(text: string): number {
  return Math.ceil(text.length * 7.2) + 20;
}

export function badge(options: BadgeOptions): string {
  const theme = cardTheme(options);
  const sans = fontStack(options.font, "sans");
  const style = options.style ?? "flat";
  const left = textWidth(options.label);
  const right = textWidth(options.value);
  const width = left + right;
  const height = 28;
  const radius = options.radius ?? (style === "plastic" ? 8 : 6);
  if (options.labelColor !== undefined && !isValidColor(options.labelColor)) {
    throw new Error(`invalid label color: ${options.labelColor} (use #rrggbb)`);
  }
  const labelFill = options.labelColor ?? theme.bg;
  let inner: string;
  if (style === "outline") {
    inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="none" stroke="${theme.line}"/>
  <line x1="${left}" y1="0" x2="${left}" y2="${height}" stroke="${theme.line}"/>
  <text x="${left / 2}" y="19" text-anchor="middle" fill="${theme.muted}" font-family="${sans}" font-size="12">${escapeXml(options.label)}</text>
  <text x="${left + right / 2}" y="19" text-anchor="middle" fill="${theme.accent}" font-family="${sans}" font-size="12" font-weight="700">${escapeXml(options.value)}</text>
`;
  } else if (style === "plastic") {
    inner = `
  <defs>
    <linearGradient id="plastic-${Math.round(width)}-${Math.round(height)}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${left}" height="${height}" rx="${radius}" fill="${labelFill}"/>
  <rect x="${left - radius}" width="${radius}" height="${height}" fill="${labelFill}"/>
  <rect x="${left}" width="${right}" height="${height}" rx="${radius}" fill="${theme.accent}"/>
  <rect x="${left - radius}" width="${radius}" height="${height}" fill="${theme.accent}"/>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#plastic-${Math.round(width)}-${Math.round(height)})"/>
  <text x="${left / 2}" y="19" text-anchor="middle" fill="${theme.text}" font-family="${sans}" font-size="12">${escapeXml(options.label)}</text>
  <text x="${left + right / 2}" y="19" text-anchor="middle" fill="${theme.text}" font-family="${sans}" font-size="12" font-weight="700">${escapeXml(options.value)}</text>
`;
  } else {
    inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}"/>
  <rect width="${left}" height="${height}" rx="${radius}" fill="${theme.bg2}"/>
  <rect x="${left - 6}" width="6" height="${height}" fill="${theme.bg2}"/>
  <rect x="${left}" width="${right}" height="${height}" fill="${theme.accent2}"/>
  <text x="${left / 2}" y="19" text-anchor="middle" fill="${theme.muted}" font-family="${sans}" font-size="12">${escapeXml(options.label)}</text>
  <text x="${left + right / 2}" y="19" text-anchor="middle" fill="${theme.text}" font-family="${sans}" font-size="12" font-weight="700">${escapeXml(options.value)}</text>
`;
  }
  return wrap(`${options.label}: ${options.value}`, inner, width, height);
}
