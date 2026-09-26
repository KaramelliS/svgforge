export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function svgId(seed: string, suffix = "g"): string {
  const safe = seed.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "card";
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return `${suffix}-${safe}-${hash.toString(16)}`;
}

/** Linear blend of two hex colors; `t` 0 returns `a`, 1 returns `b`. */
export function mixHex(a: string, b: string, t: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const parse = (hex: string): [number, number, number] => {
    const raw = hex.replace("#", "");
    const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
    const value = Number.parseInt(full, 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = clamp(ar + (br - ar) * t);
  const g = clamp(ag + (bg - ag) * t);
  const bl = clamp(ab + (bb - ab) * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Deterministic 32-bit PRNG (mulberry32) so seeded cards are reproducible. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function wrap(id: string, inner: string, width: number, height: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(id)}">
${inner}
</svg>
`;
}

export interface Theme {
  name: string;
  bg: string;
  bg2: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  line: string;
}

export const THEMES: Record<string, Theme> = {
  midnight: {
    name: "midnight",
    bg: "#0f0c29",
    bg2: "#24243e",
    text: "#ffffff",
    muted: "#c4b5fd",
    accent: "#a78bfa",
    accent2: "#7c3aed",
    line: "#302b63",
  },
  tokyonight: {
    name: "tokyonight",
    bg: "#1a1b26",
    bg2: "#24283b",
    text: "#c0caf5",
    muted: "#9aa5ce",
    accent: "#7aa2f7",
    accent2: "#bb9af7",
    line: "#3b4261",
  },
  dracula: {
    name: "dracula",
    bg: "#282a36",
    bg2: "#44475a",
    text: "#f8f8f2",
    muted: "#bd93f9",
    accent: "#ff79c6",
    accent2: "#8be9fd",
    line: "#6272a4",
  },
  nord: {
    name: "nord",
    bg: "#2e3440",
    bg2: "#3b4252",
    text: "#eceff4",
    muted: "#d8dee9",
    accent: "#88c0d0",
    accent2: "#81a1c1",
    line: "#4c566a",
  },
  github: {
    name: "github",
    bg: "#0d1117",
    bg2: "#161b22",
    text: "#e6edf3",
    muted: "#8b949e",
    accent: "#58a6ff",
    accent2: "#3fb950",
    line: "#30363d",
  },
  "github-light": {
    name: "github-light",
    bg: "#ffffff",
    bg2: "#f6f8fa",
    text: "#1f2328",
    muted: "#656d76",
    accent: "#0969da",
    accent2: "#1a7f37",
    line: "#d0d7de",
  },
  catppuccin: {
    name: "catppuccin",
    bg: "#1e1e2e",
    bg2: "#313244",
    text: "#cdd6f4",
    muted: "#a6adc8",
    accent: "#cba6f7",
    accent2: "#89b4fa",
    line: "#45475a",
  },
  gruvbox: {
    name: "gruvbox",
    bg: "#282828",
    bg2: "#3c3836",
    text: "#ebdbb2",
    muted: "#bdae93",
    accent: "#fe8019",
    accent2: "#b8bb26",
    line: "#504945",
  },
  "rose-pine": {
    name: "rose-pine",
    bg: "#191724",
    bg2: "#1f1d2e",
    text: "#e0def4",
    muted: "#908caa",
    accent: "#c4a7e7",
    accent2: "#ebbcba",
    line: "#26233a",
  },
};

export function resolveTheme(name?: string): Theme {
  return THEMES[name ?? "midnight"] ?? THEMES.midnight;
}
