import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface GaugeOptions extends BaseCardOptions {
  title?: string;
  value: number | string;
  min?: number;
  max?: number;
  unit?: string;
}

function polar(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function gauge(options: GaugeOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 420;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const low = options.min === undefined ? 0 : Number(options.min);
  const high = options.max === undefined ? 100 : Number(options.max);
  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    throw new Error("gauge --min and --hi must be numbers");
  }
  const raw = typeof options.value === "number" ? options.value : Number(String(options.value).trim().replace(/%$/, ""));
  if (!Number.isFinite(raw)) {
    throw new Error(`gauge value must be a number, got: ${options.value}`);
  }
  const fraction = Math.max(0, Math.min(1, (raw - low) / (high - low)));
  const height = 220;
  const cx = width / 2;
  const cy = 160;
  const r = 104;
  const stroke = 18;
  const start = polar(cx, cy, r, 180);
  const end = polar(cx, cy, r, 0);
  const arcLen = Math.PI * r;
  const valueLen = arcLen * fraction;
  const unit = options.unit ?? "";
  const valueText = `${Math.round(raw * 10) / 10}${unit}`;
  const fontSize = valueText.length > 7 ? 30 : 38;
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"/>
  <text x="28" y="38" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Gauge")}</text>
  <path d="M${start.x},${start.y} A${r},${r} 0 0 1 ${end.x},${end.y}" fill="none" stroke="${theme.bg2}" stroke-width="${stroke}" stroke-linecap="round"/>
  <path d="M${start.x},${start.y} A${r},${r} 0 0 1 ${end.x},${end.y}" fill="none" stroke="${theme.accent}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${valueLen.toFixed(1)} ${arcLen.toFixed(1)}"/>
  <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="${theme.text}" font-family="${mono}" font-size="${fontSize}" font-weight="700">${escapeXml(valueText)}</text>
  <text x="${cx - r}" y="${cy + 30}" fill="${theme.muted}" font-family="${mono}" font-size="12">${escapeXml(String(low))}</text>
  <text x="${cx + r}" y="${cy + 30}" text-anchor="end" fill="${theme.muted}" font-family="${mono}" font-size="12">${escapeXml(String(high))}</text>
`;
  return wrap(options.title ?? "gauge", inner, width, height, options);
}
