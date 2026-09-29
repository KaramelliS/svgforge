import { cardTheme, escapeXml, fontStack, isValidColor, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface MarkOptions extends BaseCardOptions {
  letter: string;
  shape?: "circle" | "square" | "squircle";
  gradient?: [string, string];
}

export function mark(options: MarkOptions): string {
  const theme = cardTheme(options);
  const size = options.width ?? 160;
  const sans = fontStack(options.font, "sans");
  const letter = (options.letter ?? "").trim().slice(0, 3);
  if (!letter) {
    throw new Error("mark needs a letter (--letter K)");
  }
  const shape = options.shape ?? "squircle";
  const gid = svgId(`${letter}|${shape}|${theme.name}`, "mark");
  let gradientStops: string;
  if (options.gradient) {
    const [from, to] = options.gradient;
    if (!isValidColor(from) || !isValidColor(to)) {
      throw new Error("invalid --gradient colors (use #rrggbb,#rrggbb)");
    }
    gradientStops = `<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>`;
  } else {
    gradientStops = `<stop offset="0%" stop-color="${theme.accent}"/><stop offset="100%" stop-color="${theme.accent2}"/>`;
  }
  let shapeRect: string;
  if (shape === "circle") {
    shapeRect = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#${gid})"/>`;
  } else {
    const rx = shape === "squircle" ? Math.round(size * 0.22) : options.radius ?? 8;
    shapeRect = `<rect width="${size}" height="${size}" rx="${rx}" fill="url(#${gid})"/>`;
  }
  const fontSize = letter.length === 1 ? 76 : letter.length === 2 ? 54 : 40;
  const inner = `
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      ${gradientStops}
    </linearGradient>
  </defs>
  ${shapeRect}
  <text x="${size / 2}" y="${size / 2 + fontSize * 0.35}" text-anchor="middle" fill="${theme.text}" font-family="${sans}" font-size="${fontSize}" font-weight="800">${escapeXml(letter)}</text>
`;
  return wrap(`mark ${letter}`, inner, size, size, options);
}
