import { borderAttr, cardTheme, escapeXml, fontStack, shadowAttr, shadowFilter, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface PillsOptions extends BaseCardOptions {
  title?: string;
  tags: string[];
}

export function pills(options: PillsOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 640;
  const radius = options.radius ?? 16;
  const sans = fontStack(options.font, "sans");
  const tags = options.tags.filter(Boolean);
  if (tags.length === 0) throw new Error("pills needs --tag text (repeat)");
  const gid = svgId(options.title ?? "pills", "pills");
  let x = 28;
  let y = 64;
  const rowH = 36;
  const chips = tags.map((tag) => {
    const w = Math.max(48, Math.ceil(tag.length * 8) + 28);
    if (x + w > width - 20) {
      x = 28;
      y += rowH;
    }
    const chip = `  <rect x="${x}" y="${y}" width="${w}" height="28" rx="14" fill="${theme.bg2}" stroke="${theme.line}"/>
  <text x="${x + w / 2}" y="${y + 19}" text-anchor="middle" fill="${theme.text}" font-family="${sans}" font-size="12">${escapeXml(tag)}</text>`;
    x += w + 10;
    return chip;
  });
  const height = y + 52;
  const inner = `
  <defs>${shadowFilter(gid, options.shadow)}</defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}${shadowAttr(gid, options.shadow)}/>
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Stack")}</text>
${chips.join("\n")}
`;
  return wrap(options.title ?? "pills", inner, width, height);
}
