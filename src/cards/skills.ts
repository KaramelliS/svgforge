import { borderAttr, cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface SkillItem {
  name: string;
  level: number;
}

export interface SkillsOptions extends BaseCardOptions {
  title?: string;
  items: SkillItem[];
  showValue?: boolean;
}

export function skills(options: SkillsOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 520;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const height = 64 + options.items.length * 44;
  const barWidth = width - (options.showValue ? 116 : 56);
  const body = options.items
    .map((item, i) => {
      const y = 58 + i * 44;
      const pct = Math.max(0, Math.min(100, item.level));
      const filled = Math.round((barWidth * pct) / 100);
      const value =
        options.showValue
          ? `\n  <text x="${width - 28}" y="${y + 12}" text-anchor="end" fill="${theme.muted}" font-family="${mono}" font-size="13">${pct}%</text>`
          : "";
      return `
  <text x="28" y="${y}" fill="${theme.muted}" font-family="${sans}" font-size="13">${escapeXml(item.name)}</text>
  <rect x="28" y="${y + 8}" width="${barWidth}" height="8" rx="4" fill="${theme.bg2}"/>
  <rect x="28" y="${y + 8}" width="${filled}" height="8" rx="4" fill="${theme.accent}"/>${value}`;
    })
    .join("");
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <text x="28" y="36" fill="${theme.text}" font-family="${sans}" font-size="18" font-weight="700">${escapeXml(options.title ?? "Skills")}</text>
${body}
`;
  return wrap(options.title ?? "skills", inner, width, height, options);
}
