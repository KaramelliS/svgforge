import { cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface CounterOptions extends BaseCardOptions {
  title?: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
}

export function counter(options: CounterOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 480;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const text = `${options.prefix ?? ""}${options.value}${options.suffix ?? ""}`;
  const fontSize = text.length > 14 ? 34 : text.length > 9 ? 42 : 54;
  const height = 132;
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"/>
  <rect x="0" y="0" width="8" height="${height}" rx="4" fill="${theme.accent}"/>
  <text x="28" y="38" fill="${theme.muted}" font-family="${sans}" font-size="14">${escapeXml(options.title ?? "Counter")}</text>
  <text x="28" y="98" fill="${theme.text}" font-family="${mono}" font-size="${fontSize}" font-weight="700">${escapeXml(text)}</text>
`;
  return wrap(options.title ?? "counter", inner, width, height);
}
