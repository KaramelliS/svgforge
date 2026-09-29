import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface SparklineOptions extends BaseCardOptions {
  title?: string;
  values: number[];
  unit?: string;
  smooth?: boolean;
  area?: boolean;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function sparkline(options: SparklineOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 560;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const raw = options.values.map((v) => (Number.isFinite(v) ? v : 0));
  if (raw.length < 2) {
    throw new Error("sparkline needs at least two numbers (--values 3,5,2,8)");
  }
  const height = 190;
  const padX = 28;
  const plotX = padX + 44;
  const plotW = width - plotX - 28;
  const plotY = 76;
  const plotH = 84;
  let min = Math.min(...raw);
  let max = Math.max(...raw);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  const points = raw.map((value, i) => {
    const x = plotX + (plotW * i) / (raw.length - 1);
    const y = plotY + plotH - plotH * clamp01((value - min) / span);
    return { x, y, value };
  });
  let line: string;
  if (options.smooth) {
    let path = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const current = points[i];
      const midX = (prev.x + current.x) / 2;
      path += ` Q${midX.toFixed(1)},${prev.y.toFixed(1)} ${current.x.toFixed(1)},${current.y.toFixed(1)}`;
    }
    line = path;
  } else {
    line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  }
  const areaPath = `${line} L${points[points.length - 1].x.toFixed(1)},${(plotY + plotH).toFixed(1)} L${points[0].x.toFixed(1)},${(plotY + plotH).toFixed(1)} Z`;
  const dots = points
    .map((p) => `  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${theme.accent}"/>`)
    .join("\n");
  const last = points[points.length - 1];
  const unit = options.unit ?? "";
  const minLabel = `${Math.round(min * 10) / 10}${unit}`;
  const maxLabel = `${Math.round(max * 10) / 10}${unit}`;
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"/>
  <text x="28" y="38" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Sparkline")}</text>
  <text x="28" y="${plotY + 12}" fill="${theme.muted}" font-family="${mono}" font-size="12">${escapeXml(maxLabel)}</text>
  <text x="28" y="${plotY + plotH}" fill="${theme.muted}" font-family="${mono}" font-size="12">${escapeXml(minLabel)}</text>
  <path d="${areaPath}" fill="${theme.accent}" fill-opacity="${options.area === false ? 0 : 0.08}" stroke="none"/>
  <path d="${line}" fill="none" stroke="${theme.accent}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
${dots}
  <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="5.5" fill="${theme.accent2}"/>
  <text x="${width - 28}" y="${height - 22}" text-anchor="end" fill="${theme.text}" font-family="${mono}" font-size="14" font-weight="700">${escapeXml(`${raw[raw.length - 1]}${unit}`)}</text>
`;
  return wrap(options.title ?? "sparkline", inner, width, height, options);
}
