// Letter ripple (port de MWG 041, el mismo efecto del HeroHoverList del portfolio): al pasar el
// cursor por una letra, las letras ruedan una línea hacia abajo con rebote, en cascada desde la
// letra bajo el cursor, y una copia idéntica entra desde arriba.
//
// El texto vive una sola vez en el DOM: la copia que entra desde arriba se crea en el primer hover.
// Construida al render, el texto quedaba tres veces (copia accesible + dos capas) y Google indexaba
// el H1 como "PerformancePerformancePerformance".

import { gsap } from './gsap-env';
import { prefersReducedMotion } from './motion';

function fillLetters(layer: HTMLElement, text: string): void {
  Array.from(text).forEach((char) => {
    const span = document.createElement('span');
    if (char === ' ') {
      // NBSP: un espacio normal dentro de un span inline-block colapsa a ancho cero.
      span.textContent = '\u00A0';
    } else {
      span.className = 'aa-ripple__letter';
      span.textContent = char;
    }
    layer.appendChild(span);
  });
}

export function renderRipple(text: string, className?: string): HTMLElement {
  const item = document.createElement('span');
  item.className = className ? `aa-ripple ${className}` : 'aa-ripple';
  item.setAttribute('data-aa-ripple', '');

  const layer = document.createElement('span');
  layer.className = 'aa-ripple__layer';
  fillLetters(layer, text);

  item.appendChild(layer);
  return item;
}

function buildHiddenLayer(item: HTMLElement, visible: HTMLElement): HTMLElement[] {
  const hidden = visible.cloneNode(true) as HTMLElement;
  hidden.classList.add('is--hidden');
  hidden.setAttribute('aria-hidden', 'true');
  item.insertBefore(hidden, visible);
  return Array.from(hidden.children) as HTMLElement[];
}

export function initLetterRipple(scope: Element): void {
  if (prefersReducedMotion()) return;

  scope.querySelectorAll<HTMLElement>('[data-aa-ripple]').forEach((item) => {
    const layer = item.querySelector<HTMLElement>('.aa-ripple__layer');
    if (!layer) return;
    const visible = Array.from(layer.children) as HTMLElement[];
    let hidden: HTMLElement[] | null = null;

    item.addEventListener('mouseover', (event) => {
      // Mientras rueda, las letras ignoran el puntero (.is--hovered): el siguiente mouseover llega
      // al contenedor y, si ya terminó, rearma el efecto.
      if (!gsap.isTweening(visible) && item.classList.contains('is--hovered')) {
        item.classList.remove('is--hovered');
      }

      const target = event.target as HTMLElement;
      if (!target.classList.contains('aa-ripple__letter')) return;

      hidden ??= buildHiddenLayer(item, layer);
      const hiddenLetters = hidden;

      item.classList.add('is--hovered');
      const from = visible.indexOf(target) >= 0 ? visible.indexOf(target) : hiddenLetters.indexOf(target);
      const roll = { yPercent: 100, ease: 'back.out(2)', duration: 0.6, stagger: { each: 0.023, from } };

      gsap.to(visible, roll);
      gsap.to(hiddenLetters, {
        ...roll,
        onComplete: () => gsap.set([...visible, ...hiddenLetters], { clearProps: 'all' }),
      });
    });
  });
}
