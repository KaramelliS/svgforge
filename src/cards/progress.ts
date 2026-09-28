import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface ProgressOptions extends BaseCardOptions {
  title?: string;
  value: number | string;
  caption?: string;
  showValue?: boolean;
}

function parsePercent(value: number | string): number {
  const raw = typeof value === "number" ? value : Number(String(value).trim().replace(/%$/, ""));
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function progress(options: ProgressOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 480;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const pct = parsePercent(options.value);
  const barWidth = width - 56;
  const filled = Math.round((barWidth * pct) / 100);
  const height = 118 + (options.caption ? 22 : 0);
  const barY = 84;
  const valueText =
    options.showValue === false
      ? ""
      : `\n  <text x="${width - 28}" y="38" text-anchor="end" fill="${theme.accent}" font-family="${mono}" font-size="20" font-weight="700">${pct}%</text>`;
  const caption = options.caption
    ? `\n  <text x="28" y="${barY + 34}" fill="${theme.muted}" font-family="${sans}" font-size="13">${escapeXml(options.caption)}</text>`
    : "";
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"/>
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Progress")}</text>${valueText}
  <rect x="28" y="${barY}" width="${barWidth}" height="12" rx="6" fill="${theme.bg2}"/>
  <rect x="28" y="${barY}" width="${filled}" height="12" rx="6" fill="${theme.accent}"/>${caption}
`;
  return wrap(options.title ?? "progress", inner, width, height);
}
