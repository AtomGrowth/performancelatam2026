// Letter ripple (port de MWG 041, el mismo efecto del HeroHoverList del portfolio): al pasar el
// cursor por una letra, las letras ruedan una línea hacia abajo con rebote, en cascada desde la
// letra bajo el cursor, y una copia idéntica entra desde arriba. Las dos capas son aria-hidden; el
// lector de pantalla lee una copia oculta del texto.

import { gsap } from './gsap-env';
import { prefersReducedMotion } from './motion';

function fillLetters(layer: HTMLElement, text: string): void {
  Array.from(text).forEach((char) => {
    const span = document.createElement('span');
    if (char === ' ') {
      span.textContent = ' ';
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

  const label = document.createElement('span');
  label.className = 'aa-sr-only';
  label.textContent = text;

  const hidden = document.createElement('span');
  hidden.className = 'aa-ripple__layer is--hidden';
  hidden.setAttribute('aria-hidden', 'true');
  fillLetters(hidden, text);

  const visible = document.createElement('span');
  visible.className = 'aa-ripple__layer';
  visible.setAttribute('aria-hidden', 'true');
  fillLetters(visible, text);

  item.append(label, hidden, visible);
  return item;
}

export function initLetterRipple(scope: Element): void {
  if (prefersReducedMotion()) return;

  scope.querySelectorAll<HTMLElement>('[data-aa-ripple]').forEach((item) => {
    const visible = Array.from(item.querySelectorAll<HTMLElement>('.aa-ripple__layer:not(.is--hidden) > span'));
    const hidden = Array.from(item.querySelectorAll<HTMLElement>('.aa-ripple__layer.is--hidden > span'));

    item.addEventListener('mouseover', (event) => {
      // Mientras rueda, las letras ignoran el puntero (.is--hovered): el siguiente mouseover llega
      // al contenedor y, si ya terminó, rearma el efecto.
      if (!gsap.isTweening(visible) && item.classList.contains('is--hovered')) {
        item.classList.remove('is--hovered');
      }

      const target = event.target as HTMLElement;
      if (!target.classList.contains('aa-ripple__letter')) return;

      item.classList.add('is--hovered');
      const from = visible.indexOf(target) >= 0 ? visible.indexOf(target) : hidden.indexOf(target);
      const roll = { yPercent: 100, ease: 'back.out(2)', duration: 0.6, stagger: { each: 0.023, from } };

      gsap.to(visible, roll);
      gsap.to(hidden, {
        ...roll,
        onComplete: () => gsap.set([...visible, ...hidden], { clearProps: 'all' }),
      });
    });
  });
}
