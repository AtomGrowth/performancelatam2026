// Mapa de Latinoamérica con la geometría del mapa de comunidad de OSMO (scripts/latam-map.py).
// Resalta los países que compara la sección; el resto del estudio queda en neutro y lo que está
// fuera del estudio, en contexto. El tooltip aparece en hover y en foco de teclado (mismo
// contenido); el valor nunca depende solo del tooltip: va en aria-label y en las cards.

import { LATAM_CONTEXT, LATAM_COUNTRIES, LATAM_VIEWBOX } from '../data/latam-map';
import { COUNTRIES, type CountryRow } from '../data/study';
import { formatMetric } from '../data/format';

const SVG_NS = 'http://www.w3.org/2000/svg';
const [VB_X, VB_Y, VB_W, VB_H] = LATAM_VIEWBOX.split(' ').map(Number);

const pct = (value: number): string => formatMetric({ value, decimals: 1, unit: '%' });
const ratio = (value: number): string => formatMetric({ value, decimals: 1 });

function summary(row: CountryRow): string {
  return `${row.name}: ${pct(row.delivery)} de entrega, ${pct(row.reply)} de respuesta, ${ratio(row.perReply)} mensajes entregados por respuesta`;
}

// Fracción (0-1) del lienzo para un punto en coordenadas del mapa. El SVG ocupa el ancho del
// lienzo con height:auto, así que las proporciones del viewBox y del lienzo coinciden.
function toFraction([x, y]: [number, number]): [number, number] {
  return [(x - VB_X) / VB_W, (y - VB_Y) / VB_H];
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function buildPin(row: CountryRow, anchor: [number, number]): HTMLElement {
  const [fx, fy] = toFraction(anchor);
  const pin = document.createElement('div');
  pin.className = 'aa-map__pin';
  pin.setAttribute('aria-hidden', 'true'); // el dato ya está en aria-label del país y en las cards
  pin.style.left = `${fx * 100}%`;
  pin.style.top = `${fy * 100}%`;

  const label = document.createElement('span');
  label.className = 'aa-map__pin-label';
  const name = document.createElement('strong');
  name.textContent = row.name;
  const value = document.createElement('span');
  value.className = 'aa-map__pin-value';
  value.textContent = `${pct(row.reply)} resp.`;
  label.append(name, value);

  pin.appendChild(label);
  return pin;
}

function buildLegend(): HTMLElement {
  const items: [string, string][] = [
    ['highlight', 'Países comparados'],
    ['study', 'Resto del estudio'],
    ['context', 'Fuera del estudio'],
  ];
  const ul = document.createElement('ul');
  ul.className = 'aa-map__legend';
  items.forEach(([mod, text]) => {
    const li = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.className = `aa-map__swatch aa-map__swatch--${mod}`;
    swatch.setAttribute('aria-hidden', 'true');
    li.append(swatch, document.createTextNode(text));
    ul.appendChild(li);
  });
  return ul;
}

export function renderLatamMap(highlight: string[], caption: string, note?: string): HTMLElement {
  const focus = new Set(highlight);

  const figure = document.createElement('figure');
  figure.className = 'aa-map';
  figure.setAttribute('data-aa-map', '');

  const canvas = document.createElement('div');
  canvas.className = 'aa-map__canvas';

  const svg = svgEl('svg', { viewBox: LATAM_VIEWBOX, class: 'aa-map__svg', role: 'group', 'aria-label': caption });
  svg.appendChild(svgEl('path', { d: LATAM_CONTEXT, class: 'aa-map__context', 'aria-hidden': 'true' }));

  COUNTRIES.forEach((row) => {
    const shape = LATAM_COUNTRIES[row.name];
    if (!shape) return;
    svg.appendChild(
      svgEl('path', {
        d: shape.d,
        class: focus.has(row.name) ? 'aa-map__country is--highlight' : 'aa-map__country',
        role: 'img',
        tabindex: '0',
        'aria-label': summary(row),
        'data-aa-map-country': row.name,
      }),
    );
  });
  canvas.appendChild(svg);

  COUNTRIES.filter((row) => focus.has(row.name) && LATAM_COUNTRIES[row.name]).forEach((row) => {
    canvas.appendChild(buildPin(row, LATAM_COUNTRIES[row.name].label));
  });

  const tip = document.createElement('div');
  tip.className = 'aa-map__tip';
  tip.setAttribute('aria-hidden', 'true');
  tip.hidden = true;
  canvas.appendChild(tip);

  const figcaption = document.createElement('figcaption');
  figcaption.className = 'aa-map__caption';
  const captionText = document.createElement('p');
  captionText.className = 'aa-map__caption-text';
  captionText.textContent = caption;
  figcaption.append(captionText, buildLegend());
  if (note) {
    const noteText = document.createElement('p');
    noteText.className = 'aa-map__note';
    noteText.textContent = note;
    figcaption.appendChild(noteText);
  }

  figure.append(canvas, figcaption);
  return figure;
}

function tipContent(row: CountryRow): Node[] {
  const title = document.createElement('strong');
  title.className = 'aa-map__tip-title';
  title.textContent = row.name;

  const dl = document.createElement('dl');
  dl.className = 'aa-map__tip-list';
  const pairs: [string, string][] = [
    ['Entrega', pct(row.delivery)],
    ['Respuesta', pct(row.reply)],
    ['Msj. por respuesta', ratio(row.perReply)],
  ];
  pairs.forEach(([k, v]) => {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    dl.append(dt, dd);
  });
  return [title, dl];
}

export function initLatamMap(scope: Element): void {
  const rows = new Map(COUNTRIES.map((row) => [row.name, row]));

  scope.querySelectorAll<HTMLElement>('[data-aa-map]').forEach((figure) => {
    const canvas = figure.querySelector<HTMLElement>('.aa-map__canvas');
    const tip = figure.querySelector<HTMLElement>('.aa-map__tip');
    if (!canvas || !tip) return;

    const nameOf = (target: EventTarget | null): string | null =>
      target instanceof Element
        ? target.closest('[data-aa-map-country]')?.getAttribute('data-aa-map-country') ?? null
        : null;

    const show = (name: string, x: number, y: number): void => {
      const row = rows.get(name);
      if (!row) return;
      tip.replaceChildren(...tipContent(row));
      tip.style.left = `${x}px`;
      tip.style.top = `${y}px`;
      tip.hidden = false;
    };
    const hide = (): void => {
      tip.hidden = true;
    };

    canvas.addEventListener('pointermove', (e) => {
      const name = nameOf(e.target);
      if (!name) return hide();
      const box = canvas.getBoundingClientRect();
      show(name, e.clientX - box.left, e.clientY - box.top);
    });
    canvas.addEventListener('pointerleave', hide);

    // Foco de teclado: mismo tooltip, anclado al punto de etiqueta del país.
    canvas.addEventListener('focusin', (e) => {
      const name = nameOf(e.target);
      const shape = name ? LATAM_COUNTRIES[name] : undefined;
      if (!name || !shape) return;
      const [fx, fy] = toFraction(shape.label);
      const box = canvas.getBoundingClientRect();
      show(name, fx * box.width, fy * box.height);
    });
    canvas.addEventListener('focusout', hide);
  });
}
