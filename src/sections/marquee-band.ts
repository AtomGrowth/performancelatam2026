// Banda separadora bajo el hero (variante compact del ScrollSwapMarquee del portfolio, MWG 024):
// dos filas con loop horizontal en sentidos opuestos que intercambian posición vertical mientras la
// banda cruza el viewport. Recorre el embudo del estudio. Decorativa (aria-hidden): las mismas
// cifras están en el resto de la página.

import { gsap } from '../ui/gsap-env';
import { prefersReducedMotion } from '../ui/motion';
import { formatMetric } from '../data/format';
import { FUNNEL } from '../data/study';

const SPEED = 45; // segundos por vuelta completa
const COPIES = 4; // par de copias por mitad: animar a -50% encadena el loop sin costura en 1920px

const GLYPH =
  '<svg class="aa-band__glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
  '<path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round"/></svg>';

function phrases(): string[] {
  return FUNNEL.map(({ step, share }) => {
    const decimals = Number.isInteger(share) ? 0 : share < 1 ? 2 : 1;
    return `${formatMetric({ value: share, decimals, unit: '%' })} ${step.toLowerCase()}`;
  });
}

function buildLine(items: string[]): HTMLElement {
  const line = document.createElement('p');
  line.className = 'aa-band__line';
  for (let i = 0; i < COPIES; i++) {
    items.forEach((text) => {
      const span = document.createElement('span');
      span.textContent = text;
      line.appendChild(span);
      line.insertAdjacentHTML('beforeend', GLYPH);
    });
  }
  return line;
}

export function renderMarqueeBand(root: Element): void {
  const band = document.createElement('section');
  band.className = 'aa-band';
  band.setAttribute('data-aa-band', '');
  band.setAttribute('aria-hidden', 'true');

  const items = phrases();
  const rows = document.createElement('div');
  rows.className = 'aa-band__rows';
  (['1', '2'] as const).forEach((n) => {
    const sentence = document.createElement('div');
    sentence.className = n === '2' ? 'aa-band__sentence is--2' : 'aa-band__sentence';
    sentence.appendChild(buildLine(items));
    rows.appendChild(sentence);
  });

  band.appendChild(rows);
  root.appendChild(band);
}

export function initMarqueeBand(scope: Element): void {
  const band = scope.querySelector<HTMLElement>('[data-aa-band]');
  if (!band || prefersReducedMotion()) return;
  const [line1, line2] = Array.from(band.querySelectorAll<HTMLElement>('.aa-band__line'));
  if (!line1 || !line2) return;

  gsap.to(line1, { xPercent: -50, ease: 'none', duration: SPEED, repeat: -1 });

  // Fila 2: arranca un renglón abajo (oculta por el overflow) y corre en sentido opuesto.
  gsap.set(line2, { yPercent: 100 });
  gsap.fromTo(line2, { xPercent: -50 }, { xPercent: 0, ease: 'none', duration: SPEED, repeat: -1 });

  // Swap vertical atado al paso de la banda por el viewport, sin pin.
  gsap.to([line1, line2], {
    yPercent: '-=100',
    ease: 'none',
    scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
  });
}
