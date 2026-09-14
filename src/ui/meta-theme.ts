// Meta theme-color (barra de estado en móvil) sincronizada con el scroll: muestrea la
// sección bajo el borde superior del viewport (elementFromPoint → closest
// [data-aa-section-theme]) y lee su color de fondo real.
// Las secciones light van transparentes → usan el blanco del bg fijo.

const LIGHT = '#ffffff';
const SAMPLE_Y = 4; // px bajo el borde superior, donde se asienta la status bar

function isTransparent(color: string): boolean {
  return color === 'transparent' || color.replace(/\s/g, '') === 'rgba(0,0,0,0)';
}

export function initMetaTheme(): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }

  let rafId = 0;

  const update = (): void => {
    rafId = 0;
    const y = SAMPLE_Y;
    const x = Math.round(window.innerWidth / 2);
    const section = document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>('[data-aa-section-theme]');
    if (!section) return;
    const bg = getComputedStyle(section).backgroundColor;
    const color = isTransparent(bg) ? LIGHT : bg;
    if (meta!.content !== color) meta!.content = color;
  };

  const onScroll = (): void => {
    if (!rafId) rafId = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  requestAnimationFrame(update); // estado inicial
}
