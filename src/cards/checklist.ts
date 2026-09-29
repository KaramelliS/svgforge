import { borderAttr, cardTheme, escapeXml, fontStack, shadowAttr, shadowFilter, svgId, type BaseCardOptions, wrap } from "../escape.js";

export interface ChecklistOptions extends BaseCardOptions {
  title?: string;
  items: Array<{ text: string; done?: boolean }>;
}

export function checklist(options: ChecklistOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 560;
  const radius = options.radius ?? 16;
  const sans = fontStack(options.font, "sans");
  const items = options.items.filter((item) => item.text);
  if (items.length === 0) throw new Error("checklist needs --item text or --item done:text");
  const gid = svgId(options.title ?? "check", "check");
  const height = 64 + items.length * 36;
  const rows = items
    .map((item, i) => {
      const y = 78 + i * 36;
      const box = item.done
        ? `<rect x="28" y="${y - 14}" width="18" height="18" rx="4" fill="${theme.accent}"/>
  <text x="37" y="${y}" text-anchor="middle" fill="${theme.bg}" font-family="${sans}" font-size="12" font-weight="800">✓</text>`
        : `<rect x="28" y="${y - 14}" width="18" height="18" rx="4" fill="none" stroke="${theme.line}"/>`;
      return `  ${box}
  <text x="58" y="${y}" fill="${item.done ? theme.muted : theme.text}" font-family="${sans}" font-size="15">${escapeXml(item.text)}</text>`;
    })
    .join("\n");
  const inner = `
  <defs>${shadowFilter(gid, options.shadow)}</defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}${shadowAttr(gid, options.shadow)}/>
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Checklist")}</text>
${rows}
`;
  return wrap(options.title ?? "checklist", inner, width, height, options);
}
