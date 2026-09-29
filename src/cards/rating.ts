import { borderAttr, cardTheme, escapeXml, fontStack, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface RatingOptions extends BaseCardOptions {
  title?: string;
  value: number | string;
  count?: number;
}

function starPath(x: number, y: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.42;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(x + radius * Math.cos(angle)).toFixed(1)},${(y + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

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
  const full = Math.floor(value + 1e-9);
  const fraction = value - full;
  const width = options.width ?? 380;
  const radius = options.radius ?? 16;
  const height = 132;
  const gid = svgId(`rating|${theme.name}|${value}`, "half");
  const r = 12;
  const gap = 8;
  const startX = 40;
  const cy = 86;
  const stars = Array.from({ length: count }, (_, i) => {
    const cx = startX + i * (r * 2 + gap);
    const path = starPath(cx, cy, r);
    if (i < full) return `  <path d="${path}" fill="${theme.accent}"/>`;
    if (i === full && fraction >= 0.25) {
      return `  <path d="${path}" fill="${theme.bg2}"/>
  <path d="${path}" fill="${theme.accent}" clip-path="url(#${gid})"/>`;
    }
    return `  <path d="${path}" fill="${theme.bg2}"/>`;
  }).join("\n");
  const shown = (Math.round(value * 2) / 2).toFixed(1).replace(/\.0$/, "");
  const clipX = startX + full * (r * 2 + gap) - r;
  const clipW = fraction >= 0.75 ? r * 2 : r;
  const inner = `
  <defs>
    <clipPath id="${gid}"><rect x="${clipX}" y="0" width="${clipW}" height="${height}"/></clipPath>
  </defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Rating")}</text>
${stars}
  <text x="${width - 28}" y="92" text-anchor="end" fill="${theme.text}" font-family="${mono}" font-size="18" font-weight="700">${shown}/${count}</text>
`;
  return wrap(options.title ?? "rating", inner, width, height, options);
}
