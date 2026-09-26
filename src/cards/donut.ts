import { escapeXml, mixHex, resolveTheme, wrap } from "../escape.js";

export interface DonutSlice {
  label: string;
  value: number;
  /** Optional explicit hex color; themes otherwise assign a palette slot. */
  color?: string;
}

export interface DonutOptions {
  title?: string;
  slices: DonutSlice[];
  theme?: string;
  width?: number;
}

function palette(theme: { accent: string; accent2: string; muted: string; bg: string }): string[] {
  return [
    theme.accent,
    theme.accent2,
    mixHex(theme.accent, theme.accent2, 0.5),
    theme.muted,
    mixHex(theme.accent, theme.muted, 0.45),
    mixHex(theme.accent2, theme.muted, 0.45),
  ];
}

export function donut(options: DonutOptions): string {
  const theme = resolveTheme(options.theme);
  const width = options.width ?? 520;
  const slices = (options.slices ?? []).filter(
    (slice) => slice && Number.isFinite(Number(slice.value)) && Number(slice.value) > 0,
  );
  const total = slices.reduce((sum, slice) => sum + Number(slice.value), 0);
  const colors = palette(theme);

  const radius = 62;
  const thickness = 22;
  const circumference = 2 * Math.PI * radius;
  const cx = 28 + radius + thickness / 2;
  const cy = 64 + radius;

  let offset = 0;
  const arcs = slices.map((slice, i) => {
    const fraction = Number(slice.value) / total;
    const arc = fraction * circumference;
    const visible = Math.max(0, arc - 2).toFixed(2);
    const rest = Math.max(0, circumference - Math.max(0, arc - 2)).toFixed(2);
    const dash = `${visible} ${rest}`;
    const rotation = (offset / circumference) * 360 - 90;
    offset += arc;
    return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${escapeXml(
      slice.color ?? colors[i % colors.length],
    )}" stroke-width="${thickness}" stroke-dasharray="${dash}" transform="rotate(${rotation.toFixed(2)} ${cx} ${cy})"/>`;
  });

  const legendRows = Math.max(1, slices.length);
  const height = Math.max(cy + radius + thickness / 2 + 28, 64 + legendRows * 28 + 16);
  const legendX = cx + radius + 44;
  const legend = slices
    .map((slice, i) => {
      const y = 64 + i * 28;
      const pct = ((Number(slice.value) / total) * 100).toFixed(1);
      const color = slice.color ?? colors[i % colors.length];
      return `
  <rect x="${legendX}" y="${y - 10}" width="12" height="12" rx="3" fill="${color}"/>
  <text x="${legendX + 20}" y="${y}" fill="${theme.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${escapeXml(String(slice.label ?? ""))}</text>
  <text x="${width - 28}" y="${y}" text-anchor="end" fill="${theme.muted}" font-family="ui-monospace, Menlo, monospace" font-size="13">${pct}%</text>`;
    })
    .join("");

  const centerTotal =
    slices.length ? `<text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="${theme.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22" font-weight="700">${escapeXml(String(total))}</text>
  <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="${theme.muted}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">total</text>` : "";

  const inner = `
  <rect width="${width}" height="${height}" rx="16" fill="${theme.bg}" stroke="${theme.line}"/>
  <text x="28" y="36" fill="${theme.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" font-weight="700">${escapeXml(options.title ?? "Distribution")}</text>
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${theme.bg2}" stroke-width="${thickness}"/>
  ${arcs.join("\n  ")}
${centerTotal}
${legend}
`;
  return wrap(options.title ?? "donut", inner, width, height);
}
