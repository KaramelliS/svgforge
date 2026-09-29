import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface LinkItem {
  text: string;
  url?: string;
}

export interface LinksOptions extends BaseCardOptions {
  items: LinkItem[];
  link?: boolean;
}

export function assertSafeUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(`links only accept http(s) urls, got: ${url}`);
  }
  return url;
}

export function links(options: LinksOptions): string {
  const theme = cardTheme(options);
  const sans = fontStack(options.font, "sans");
  const items = options.items;
  if (items.length === 0) {
    throw new Error("links needs at least one item (--item Text=URL)");
  }
  const height = 36;
  const gap = 14;
  const pillWidth = (text: string): number => Math.max(56, Math.ceil(text.length * 8.4) + 36);
  const autoWidth = items.reduce((sum, item) => sum + pillWidth(item.text), 0) + gap * (items.length - 1);
  const width = options.width ?? autoWidth;
  let x = 0;
  const pills = items.map((item) => {
    const pill = pillWidth(item.text);
    const content = `
    <rect x="0" y="0" width="${pill}" height="${height}" rx="${Math.round(height / 2)}" fill="${theme.bg2}" stroke="${theme.line}"/>
    <text x="${pill / 2}" y="23" text-anchor="middle" fill="${theme.text}" font-family="${sans}" font-size="13" font-weight="600">${escapeXml(item.text)}</text>`;
    const group = item.url && options.link !== false
      ? `<a href="${escapeXml(assertSafeUrl(item.url))}" target="_blank" rel="noopener">${content}\n  </a>`
      : `<g>${content}</g>`;
    const positioned = `  <g transform="translate(${x},0)">${group}</g>`;
    x += pill + gap;
    return positioned;
  });
  const inner = pills.join("\n");
  return wrap(items.map((item) => item.text).join(", "), inner, width, height, options);
}
