import { cardTheme, escapeXml, fontStack, svgId, type BaseCardOptions, wrap } from "../escape.js";

// Wave layers are flat fills; the background is a solid color by default.

export interface WaveOptions extends BaseCardOptions {
  title: string;
  subtitle?: string;
  animate?: boolean;
}

function wavePath(width: number, height: number, y: number, amp: number, len: number, phase: number): string {
  const points: string[] = [];
  const start = -len * 2;
  const end = width + len * 2;
  for (let x = start; x <= end; x += 10) {
    const yy = y + amp * Math.sin((2 * Math.PI * (x + phase)) / len);
    points.push(`${points.length === 0 ? "M" : "L"}${x.toFixed(1)},${yy.toFixed(1)}`);
  }
  return `${points.join("")}L${end.toFixed(1)},${height}L${start.toFixed(1)},${height}Z`;
}

export function wave(options: WaveOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 880;
  const height = options.height ?? 200;
  const radius = options.radius ?? 16;
  const sans = fontStack(options.font, "sans");
  const clip = svgId(`${options.title}|${theme.name}`, "clip");
  const bg = `<rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}" stroke-width="1"/>`;
  const y1 = Math.round(height * 0.62);
  const y2 = Math.round(height * 0.72);
  const y3 = Math.round(height * 0.82);
  const p1 = wavePath(width, height, y1, 10, 240, 0);
  const p2 = wavePath(width, height, y2, 13, 300, 90);
  const p3 = wavePath(width, height, y3, 9, 360, 180);
  const animate = (len: number, dur: number): string =>
    options.animate
      ? `\n    <animateTransform attributeName="transform" type="translate" values="0 0; ${len} 0; 0 0" dur="${dur}s" repeatCount="indefinite"/>`
      : "";
  const titleY = Math.round(height * 0.34);
  const inner = `
  <defs>
    <clipPath id="${clip}"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>
  </defs>
${bg}
  <g clip-path="url(#${clip})">
    <path d="${p1}" fill="${theme.accent2}" fill-opacity="0.28"/>${animate(240, 9)}
    <path d="${p2}" fill="${theme.accent}" fill-opacity="0.42"/>${animate(-300, 7)}
    <path d="${p3}" fill="${theme.line}" fill-opacity="0.55"/>${animate(360, 11)}
  </g>
  <text x="${width / 2}" y="${titleY}" text-anchor="middle" fill="${theme.text}" font-family="${sans}" font-size="42" font-weight="700">${escapeXml(options.title)}</text>
${options.subtitle ? `  <text x="${width / 2}" y="${titleY + 36}" text-anchor="middle" fill="${theme.muted}" font-family="${sans}" font-size="16">${escapeXml(options.subtitle)}</text>` : ""}
`;
  return wrap(options.title, inner, width, height, options);
}
