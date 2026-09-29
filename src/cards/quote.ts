import { borderAttr, cardTheme, escapeXml, fontStack, wrapLines, type BaseCardOptions, wrap } from "../escape.js";

export interface QuoteOptions extends BaseCardOptions {
  text: string;
  author?: string;
}

export function quote(options: QuoteOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 560;
  const radius = options.radius ?? 16;
  const sans = fontStack(options.font, "sans");
  const text = options.text ?? "";
  const maxChars = Math.max(16, Math.floor((width - 116) / 8));
  const lines = wrapLines(text, maxChars);
  const lineHeight = 24;
  const quoteY = 74;
  const body = lines
    .map(
      (line, i) =>
        `  <text x="64" y="${quoteY + i * lineHeight}" fill="${theme.text}" font-family="${sans}" font-size="16">${escapeXml(line)}</text>`,
    )
    .join("\n");
  const authorY = quoteY + lines.length * lineHeight + 20;
  const author = options.author
    ? `\n  <text x="${width - 28}" y="${authorY}" text-anchor="end" fill="${theme.muted}" font-family="${sans}" font-size="14" font-style="italic">— ${escapeXml(options.author)}</text>`
    : "";
  const height = 52 + lines.length * lineHeight + (options.author ? 44 : 20);
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <text x="30" y="82" fill="${theme.accent}" font-family="${sans}" font-size="64" font-weight="700">“</text>
${body}${author}
`;
  return wrap(options.text.slice(0, 40), inner, width, height);
}
