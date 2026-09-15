// Hero — bloque tipográfico a sangre sobre el canvas claro (estructura de MWG 044): titular en tres
// líneas justificadas al ancho con el video del teclado dentro del texto. Sin fila meta ni logo: la
// landing se monta en una página que ya trae navbar. Sin video
// de fondo: la imagen va dentro del titular y el texto no necesita overlay. El formulario vive en
// una strip inferior (#aa-descarga). Todos los textos llevan letter ripple (ui/letter-ripple).

import { renderRipple } from '../ui/letter-ripple';

// Servido desde Cloudflare R2 (público, faststart).
const HERO_VIDEO_SRC = 'https://pub-09dc8675a13e4b6d9ff1f7e15d49ade2.r2.dev/hand-typing-smartphone.mp4';

const ARROW_ICON =
  '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M5 3v11h13" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/>' +
  '<path d="m13 9 5 5-5 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/></svg>';

function buildVideo(): HTMLElement {
  const frame = document.createElement('span');
  frame.className = 'aa-hero__media';

  const video = document.createElement('video');
  video.className = 'aa-hero__video';
  video.src = HERO_VIDEO_SRC;
  // Autoplay silencioso en loop (requiere muted + playsinline en móvil).
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'auto');
  video.setAttribute('aria-hidden', 'true');

  frame.appendChild(video);
  return frame;
}

// Cada línea reparte sus piezas a los bordes (space-between): así el bloque llena el ancho.
function lockupLine(...parts: (string | HTMLElement)[]): HTMLElement {
  const line = document.createElement('span');
  line.className = 'aa-hero__line';
  line.setAttribute('data-aa-fade', '');
  // Espacio real entre piezas: flex ignora los nodos de solo espacio (el layout no cambia), pero
  // sin ellos el texto indexable del H1 salía pegado ("PerformanceenWhatsApp").
  parts.forEach((part, i) => {
    if (i > 0) line.append(' ');
    line.appendChild(typeof part === 'string' ? renderRipple(part) : part);
  });
  return line;
}

function buildLockup(): HTMLElement {
  const title = document.createElement('h1');
  title.className = 'aa-hero__lockup';
  // Las líneas son flex: sin aria-label el nombre accesible pegaría las palabras.
  title.setAttribute('aria-label', 'Performance en WhatsApp. LATAM 2026');

  const arrow = document.createElement('span');
  arrow.className = 'aa-hero__arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.innerHTML = ARROW_ICON;

  title.append(
    lockupLine('Performance'),
    ' ',
    lockupLine('en', buildVideo(), renderRipple('WhatsApp', 'aa-hero__brand')),
    ' ',
    lockupLine(arrow, 'LATAM 2026'),
  );
  return title;
}

export function renderHero(root: Element): void {
  const hero = document.createElement('section');
  hero.className = 'aa-hero';
  hero.setAttribute('data-aa-intro', ''); // anima al montar (no al hacer scroll)
  hero.setAttribute('data-aa-section-theme', 'light');

  const frame = document.createElement('div');
  frame.className = 'aa-hero__frame';
  frame.append(buildLockup());

  hero.append(frame);
  root.appendChild(hero);
}
