// Helpers de layout — contraparte programática de las clases .aa-container / .aa-section.
// Cada sección en src/sections/ se compone con estos para mantener estructura consistente.

export type SectionVariant = 'default' | 'hero' | 'sm';
export type ContainerSize = 'default' | 'm' | 'sm' | 's';

export type SectionTheme = 'light' | 'dark';

// Superficie de una sección (ritmo de strips, ver section-theme.css):
//   canvas    = transparente sobre el bg texturizado
//   sheet     = bloque obsidian con textura tenue, esquinas en apertura/cierre
//   accent    = bloque verde con textura (pico de color)
//   card      = card blanca flotando sobre el canvas
//   card-dark = card obsidian flotando sobre el canvas (contraste invertido)
//   media     = video de fondo con overlay
export type Surface = 'canvas' | 'sheet' | 'accent' | 'card' | 'card-dark' | 'media';

// Tema de tokens de la sección. card-dark es light: la inversión vive en su container.
export function themeOf(surface: Surface): SectionTheme {
  return surface === 'sheet' || surface === 'media' ? 'dark' : 'light';
}

interface SectionOptions {
  variant?: SectionVariant;
  theme?: SectionTheme;
  className?: string;
  children?: Node[];
}

interface ContainerOptions {
  size?: ContainerSize;
  className?: string;
  children?: Node[];
}

interface GridOptions {
  cols: 2 | 3 | 4;
  className?: string;
  attrs?: Record<string, string>;
  children?: Node[];
}

function cx(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function renderSection(opts: SectionOptions = {}): HTMLElement {
  const { variant = 'default', theme, className, children = [] } = opts;
  const el = document.createElement('section');
  el.className = cx('aa-section', variant !== 'default' && `aa-section--${variant}`, className);
  if (theme) el.setAttribute('data-aa-section-theme', theme);
  children.forEach((c) => el.appendChild(c));
  return el;
}

export function renderContainer(opts: ContainerOptions = {}): HTMLElement {
  const { size = 'default', className, children = [] } = opts;
  const el = document.createElement('div');
  el.className = cx('aa-container', size !== 'default' && `is--${size}`, className);
  children.forEach((c) => el.appendChild(c));
  return el;
}

export function renderGrid(opts: GridOptions): HTMLElement {
  const { cols, className, attrs, children = [] } = opts;
  const el = document.createElement('div');
  el.className = cx('aa-grid', `aa-grid--${cols}`, className);
  if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  children.forEach((c) => el.appendChild(c));
  return el;
}
