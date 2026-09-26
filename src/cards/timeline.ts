import { escapeXml, resolveTheme, wrap } from "../escape.js";

export interface TimelineItem {
  date: string;
  label: string;
}

export interface TimelineOptions {
  title?: string;
  items: TimelineItem[];
  theme?: string;
  width?: number;
}

export function timeline(options: TimelineOptions): string {
  const theme = resolveTheme(options.theme);
  const width = options.width ?? 560;
  const items = options.items ?? [];
  const rowHeight = 44;
  const height = 64 + items.length * rowHeight + 12;
  const railX = 40;
  const body = items
    .map((item, i) => {
      const y = 70 + i * rowHeight;
      const dot = i === items.length - 1 ? theme.accent2 : theme.accent;
      return `
  <circle cx="${railX}" cy="${y + 6}" r="5" fill="${dot}"/>
  <text x="${railX + 20}" y="${y + 2}" fill="${theme.muted}" font-family="ui-monospace, Menlo, monospace" font-size="12">${escapeXml(String(item.date ?? ""))}</text>
  <text x="${railX + 20}" y="${y + 18}" fill="${theme.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14">${escapeXml(String(item.label ?? ""))}</text>`;
    })
    .join("");
  const railEnd = 64 + items.length * rowHeight;
  const inner = `
  <rect width="${width}" height="${height}" rx="16" fill="${theme.bg}" stroke="${theme.line}"/>
  <rect x="0" y="0" width="8" height="${height}" rx="4" fill="${theme.accent}"/>
  <text x="28" y="36" fill="${theme.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" font-weight="700">${escapeXml(options.title ?? "Timeline")}</text>
  <line x1="${railX}" y1="70" x2="${railX}" y2="${railEnd - 20}" stroke="${theme.line}" stroke-width="2"/>
${body}
`;
  return wrap(options.title ?? "timeline", inner, width, height);
}
