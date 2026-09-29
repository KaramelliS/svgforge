import { borderAttr, cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface TerminalOptions extends BaseCardOptions {
  title?: string;
  lines: string[];
  prompt?: string;
  caret?: boolean;
}

export function terminal(options: TerminalOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 720;
  const radius = options.radius ?? 14;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const lineHeight = 22;
  const height = 72 + options.lines.length * lineHeight;
  const promptMarker = options.prompt ?? "$";
  const body = options.lines
    .map((line, i) => {
      const y = 68 + i * lineHeight;
      const isPrompt = line.startsWith(promptMarker) || line.startsWith(">");
      const fill = isPrompt ? theme.accent : theme.text;
      return `  <text x="24" y="${y}" fill="${fill}" font-family="${mono}" font-size="14">${escapeXml(line)}</text>`;
    })
    .join("\n");
  const lastY = 68 + (options.lines.length - 1) * lineHeight;
  const caret = options.caret
    ? `\n  <rect x="24" y="${lastY + 4}" width="8" height="14" fill="${theme.accent}">
    <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.06s" repeatCount="indefinite"/>
  </rect>`
    : "";
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <circle cx="28" cy="24" r="6" fill="#ff5f56"/>
  <circle cx="48" cy="24" r="6" fill="#ffbd2e"/>
  <circle cx="68" cy="24" r="6" fill="#27c93f"/>
  <text x="96" y="28" fill="${theme.muted}" font-family="${sans}" font-size="12">${escapeXml(options.title ?? "terminal")}</text>
  ${body}${caret}
`;
  return wrap(options.title ?? "terminal", inner, width, height);
}
