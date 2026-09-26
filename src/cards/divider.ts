import { escapeXml, resolveTheme, wrap } from "../escape.js";

export interface DividerOptions {
  /** Optional centered chip label, e.g. a section name. */
  label?: string;
  width?: number;
  theme?: string;
}

export function divider(options: DividerOptions): string {
  const theme = resolveTheme(options.theme);
  const width = options.width ?? 720;
  const height = options.label ? 40 : 18;
  const line = `<rect x="0" y="${height / 2 - 2}" width="${width}" height="4" rx="2" fill="${theme.bg2}"/>
  <rect x="0" y="${height / 2 - 2}" width="${Math.round(width * 0.35)}" height="4" rx="2" fill="${theme.accent}"/>`;
  const chip = options.label
    ? `<rect x="${(width - 160) / 2}" y="8" width="160" height="24" rx="12" fill="${theme.bg}" stroke="${theme.line}"/>
  <text x="${width / 2}" y="25" text-anchor="middle" fill="${theme.muted}" font-family="ui-monospace, Menlo, monospace" font-size="12">${escapeXml(options.label)}</text>`
    : "";
  return wrap(options.label ?? "divider", `${line}
${chip}`, width, height);
}
