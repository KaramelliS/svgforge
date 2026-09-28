import { cardTheme, escapeXml, fontStack, wrapLines, type BaseCardOptions, wrap } from "../escape.js";

export interface ProjectStat {
  label: string;
  value: string | number;
}

export interface ProjectOptions extends BaseCardOptions {
  name: string;
  description?: string;
  host?: string;
  items?: ProjectStat[];
  tags?: string[];
}

export function project(options: ProjectOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 640;
  const radius = options.radius ?? 16;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const stats = options.items ?? [];
  const tags = options.tags ?? [];
  const descLines = options.description ? wrapLines(options.description, Math.max(20, Math.floor((width - 56) / 7.6))) : [];
  const nameY = 38;
  const hostY = options.host ? 60 : 0;
  const descStart = options.host ? 88 : 64;
  const descBottom = descStart + descLines.length * 22;
  let end = Math.max(descBottom, 64);
  const desc = descLines
    .map(
      (line, i) =>
        `  <text x="28" y="${descStart + i * 22}" fill="${theme.muted}" font-family="${sans}" font-size="14">${escapeXml(line)}</text>`,
    )
    .join("\n");
  let statRows = "";
  if (stats.length > 0) {
    const statsTop = end + 26;
    const colw = (width - 56) / stats.length;
    statRows = stats
      .map((item, i) => {
        const x = 28 + Math.round(i * colw);
        return `\n  <text x="${x}" y="${statsTop}" fill="${theme.muted}" font-family="${sans}" font-size="12">${escapeXml(item.label)}</text>
  <text x="${x}" y="${statsTop + 22}" fill="${theme.text}" font-family="${mono}" font-size="17" font-weight="700">${escapeXml(String(item.value))}</text>`;
      })
      .join("");
    end = statsTop + 22 + 8;
  }
  let tagRows = "";
  if (tags.length > 0) {
    const tagsTop = end + 18;
    let x = 28;
    tagRows = tags
      .map((tag) => {
        const pillWidth = Math.max(44, Math.ceil(tag.length * 7.6) + 26);
        const pill = `  <rect x="${x}" y="${tagsTop}" width="${pillWidth}" height="24" rx="12" fill="${theme.bg2}" stroke="${theme.line}"/>
  <text x="${x + pillWidth / 2}" y="${tagsTop + 16}" text-anchor="middle" fill="${theme.muted}" font-family="${sans}" font-size="11">${escapeXml(tag)}</text>`;
        x += pillWidth + 10;
        return pill;
      })
      .join("\n");
    end = tagsTop + 24 + 8;
  }
  const height = end + 20;
  const host = options.host
    ? `\n  <text x="28" y="${hostY}" fill="${theme.muted}" font-family="${mono}" font-size="12">${escapeXml(options.host)}</text>`
    : "";
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"/>
  <text x="28" y="${nameY}" fill="${theme.text}" font-family="${sans}" font-size="22" font-weight="700">${escapeXml(options.name)}</text>${host}
${desc}${statRows}
${tagRows}
`;
  return wrap(options.name, inner, width, height);
}
