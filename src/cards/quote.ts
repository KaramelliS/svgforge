import { escapeXml, resolveTheme, wrap } from "../escape.js";

export interface QuoteOptions {
  quote: string;
  author?: string;
  width?: number;
  theme?: string;
}

/** Approximate advance width of one character at font-size 15 in the sans stack. */
const CHAR_WIDTH = 8.4;
const LINE_HEIGHT = 24;

function wrapText(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    // Hard-split words longer than a whole line so a URL never overflows the card.
    const chunks: string[] = [];
    let rest = word;
    while (rest.length > maxChars) {
      chunks.push(rest.slice(0, maxChars));
      rest = rest.slice(maxChars);
    }
    if (chunks.length) {
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(...chunks);
      continue;
    }
    if (!current) current = word;
    else if (`${current} ${word}`.length <= maxChars) current += ` ${word}`;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export function quote(options: QuoteOptions): string {
  const theme = resolveTheme(options.theme);
  const width = options.width ?? 480;
  const usable = width - 112; // decorative mark on the left, right margin
  const maxChars = Math.max(16, Math.floor(usable / CHAR_WIDTH));
  const lines = wrapText(options.quote ?? "", maxChars);
  const height = 64 + lines.length * LINE_HEIGHT + (options.author ? 52 : 28);
  const body = lines
    .map(
      (line, i) => `
  <text x="72" y="${64 + i * LINE_HEIGHT}" fill="${theme.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-style="italic">${escapeXml(line)}</text>`,
    )
    .join("");
  const author = options.author
    ? `
  <text x="${width - 28}" y="${height - 28}" text-anchor="end" fill="${theme.muted}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">— ${escapeXml(options.author)}</text>`
    : "";
  const inner = `
  <rect width="${width}" height="${height}" rx="16" fill="${theme.bg}" stroke="${theme.line}"/>
  <rect x="0" y="0" width="8" height="${height}" rx="4" fill="${theme.accent}"/>
  <text x="24" y="52" fill="${theme.accent}" font-family="Georgia, 'Times New Roman', serif" font-size="56">“</text>
${body}
${author}
`;
  return wrap(lines[0] || "quote", inner, width, height);
}
