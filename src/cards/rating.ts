import { cardTheme, escapeXml, fontStack, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface RatingOptions extends BaseCardOptions {
  title?: string;
  value: number | string;
  count?: number;
}

const STAR = "★";
const HALF = "½";

export function rating(options: RatingOptions): string {
  const theme = cardTheme(options);
  const sans = fontStack(options.font, "sans");
  const mono = fontStack(options.font, "mono");
  const raw = typeof options.value === "number" ? options.value : Number(String(options.value).trim().replace(/\/5$/, ""));
  if (!Number.isFinite(raw)) {
    throw new Error(`rating value must be a number (0–5), got: ${options.value}`);
  }
  const count = Math.max(1, Math.min(10, options.count ?? 5));
  const value = Math.max(0, Math.min(count, raw));
  const full = Math.floor(value);
  const half = value - full >= 0.25 && value - full < 0.75;
  const rounded = half ? full + 0.5 : Math.round(value * 2) / 2;
  const width = options.width ?? 380;
  const radius = options.radius ?? 16;
  const height = 132;
  const gid = svgId(`rating|${theme.name}`, "half");
  const starSize = 26;
  const startX = 28;
  const gap = 6;
  const stars: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = startX + i * (starSize + gap);
    const isFull = i < full || (i === full && !half && rounded > i);
    const isHalf = i === full && half;
    if (isFull) {
      stars.push(
        `  <text x="${x}" y="88" fill="${theme.accent}" font-family="${sans}" font-size="${starSize}">${STAR}</text>`,
      );
    } else if (isHalf) {
      stars.push(
        `  <g clip-path="url(#${gid})">
    <text x="${x}" y="88" fill="${theme.accent}" font-family="${sans}" font-size="${starSize}">${STAR}</text>
  </g>
  <text x="${x}" y="88" fill="${theme.bg2}" font-family="${sans}" font-size="${starSize}">${STAR}</text>`,
      );
    } else {
      stars.push(
        `  <text x="${x}" y="88" fill="${theme.bg2}" font-family="${sans}" font-size="${starSize}">${STAR}</text>`,
      );
    }
  }
  const valueText = rounded.toFixed(1).replace(/\.0$/, "");
  const inner = `
  <defs>
    <clipPath id="${gid}"><rect x="0" y="0" width="${startX + full * (starSize + gap) + starSize / 2}" height="${height}"/></clipPath>
  </defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"/>
  <text x="28" y="38" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Rating")}</text>
${stars.join("\n")}
  <text x="${width - 28}" y="88" text-anchor="end" fill="${theme.text}" font-family="${mono}" font-size="18" font-weight="700">${valueText}/${count}</text>
`;
  return wrap(options.title ?? "rating", inner, width, height);
}
