import { borderAttr, cardTheme, escapeXml, fontStack, type BaseCardOptions, wrap } from "../escape.js";

export interface CodeOptions extends BaseCardOptions {
  title?: string;
  lang?: string;
  lines: string[];
  lineNumbers?: boolean;
}

type TokenKind = "plain" | "comment" | "string" | "number" | "keyword" | "call";

const KEYWORDS = new Set([
  "function", "const", "let", "var", "return", "if", "else", "for", "while", "class", "import",
  "export", "from", "as", "async", "await", "try", "catch", "throw", "new", "this", "typeof",
  "interface", "type", "enum", "implements", "public", "private", "protected", "static", "void",
  "def", "lambda", "pass", "elif", "with", "yield", "print", "None", "True", "False", "and", "or",
  "not", "in", "is", "fn", "mut", "pub", "match", "impl", "use", "struct", "crate", "func",
  "package", "nil", "select", "defer", "chan", "map", "range", "make", "string", "int", "float",
  "bool", "error", "null", "true", "false", "undefined", "let", "do", "end", "then", "elif",
]);

function commentPattern(lang?: string): string {
  const hashOnly = /^(py|python|sh|bash|zsh|shell|ruby|rb|yaml|yml|toml|ini|r|perl)$/i.test(lang ?? "");
  return hashOnly ? "#(?!\\S)[^\\n]*|#(?![0-9a-fA-F])[^\\n]*" : "\\/\\/[^\\n]*|#(?!\\S)[^\\n]*|#(?![0-9a-fA-F])[^\\n]*";
}

const TOKEN_RE_PARTS = [
  "(\\/\\/[^\\n]*)", // line comment
  "(#(?!\\S)[^\\n]*|#(?![0-9a-fA-F])[^\\n]*)", // hash comment (not a hex color)
  "(\"(?:\\\\.|[^\"\\\\\\n])*\")", // double-quoted string
  "('(?:\\\\.|[^'\\\\\\n])*')", // single-quoted string
  "(`(?:\\\\.|[^`\\\\])*`)", // template string
  "(\\b\\d+(?:\\.\\d+)?\\b)", // number
  "([A-Za-z_$][\\w$]*)", // word (keyword or call or plain)
];

function tokenize(line: string, lang?: string): Array<{ kind: TokenKind; text: string }> {
  const parts = [...TOKEN_RE_PARTS];
  if (/^(py|python|sh|bash|zsh|shell|ruby|rb|yaml|yml|toml|ini|r|perl)$/i.test(lang ?? "")) {
    parts[0] = "(\\n\\u0000)"; // no // comments in hash languages
    parts[1] = `(${commentPattern(lang)})`;
  }
  const re = new RegExp(parts.join("|"), "g");
  const out: Array<{ kind: TokenKind; text: string }> = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(line)) !== null) {
    if (match.index > last) out.push({ kind: "plain", text: line.slice(last, match.index) });
    const text = match[0];
    let kind: TokenKind = "plain";
    if (text.startsWith("//") || text.startsWith("#")) kind = "comment";
    else if (text.startsWith('"') || text.startsWith("'") || text.startsWith("`")) kind = "string";
    else if (/^\d/.test(text)) kind = "number";
    else if (KEYWORDS.has(text)) kind = "keyword";
    else if (/^[A-Za-z_$]/.test(text) && /^\s*\(/.test(line.slice(match.index + text.length))) kind = "call";
    out.push({ kind, text });
    last = match.index + text.length;
  }
  if (last < line.length) out.push({ kind: "plain", text: line.slice(last) });
  return out.filter((token) => token.text.length > 0);
}

const COLORS: Record<TokenKind, "muted" | "accent2" | "accent" | "text"> = {
  comment: "muted",
  string: "accent2",
  number: "accent",
  keyword: "accent",
  call: "text",
  plain: "text",
};

export function code(options: CodeOptions): string {
  const theme = cardTheme(options);
  const width = options.width ?? 640;
  const radius = options.radius ?? 14;
  const mono = fontStack(options.font, "mono");
  const sans = fontStack(options.font, "sans");
  const lines = options.lines.length > 0 ? options.lines : [" "];
  const lineHeight = 20;
  const height = 72 + lines.length * lineHeight;
  const showNumbers = options.lineNumbers === true;
  const textX = showNumbers ? 64 : 24;
  const body = lines
    .map((line, i) => {
      const y = 66 + i * lineHeight;
      const number = showNumbers
        ? `<text x="24" y="${y}" text-anchor="end" fill="${theme.muted}" fill-opacity="0.6" font-family="${mono}" font-size="12">${i + 1}</text>\n  `
        : "";
      const spans = tokenize(line, options.lang)
        .map((token) => {
          const fill = theme[COLORS[token.kind]];
          const weight = token.kind === "call" || token.kind === "keyword" ? ' font-weight="600"' : "";
          return `<tspan fill="${fill}"${weight}>${escapeXml(token.text)}</tspan>`;
        })
        .join("");
      return `  ${number}<text x="${textX}" y="${y}" font-family="${mono}" font-size="13" fill="${theme.text}">${spans || " "}</text>`;
    })
    .join("\n");
  const inner = `
  <rect width="${width}" height="${height}" rx="${radius}" fill="${theme.bg}" stroke="${theme.line}"${borderAttr(options)}/>
  <circle cx="28" cy="24" r="6" fill="#ff5f56"/>
  <circle cx="48" cy="24" r="6" fill="#ffbd2e"/>
  <circle cx="68" cy="24" r="6" fill="#27c93f"/>
  <text x="96" y="28" fill="${theme.muted}" font-family="${sans}" font-size="12">${escapeXml(options.title ?? options.lang ?? "code")}</text>
${body}
`;
  return wrap(options.title ?? "code", inner, width, height);
}
