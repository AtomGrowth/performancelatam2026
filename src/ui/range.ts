// Barra de rango de cuartiles (la gráfica de Relume Layout 637, reducida a una fila): el tramo
// entre cuartil inferior y superior en acento, la mediana como marca y los tres valores
// etiquetados directo en tinta de texto. Una sola serie, así que no lleva leyenda. Los valores van
// en un <dl> para que el lector de pantalla reciba las cifras sin depender de la geometría.

import { formatMetric, type MetricUnit } from '../data/format';
import type { Quartiles } from '../data/study';
import { renderStatList, type StatItem } from './stat';

export interface RangeOptions {
  caption: string;
  quartiles: Quartiles;
  unit: MetricUnit;
  decimals: number;
  labels: { low: string; median: string; high: string };
  gap?: StatItem; // cifra de contraste junto al título (ej. 3,2× entre cuartiles)
  note?: string;
}

// Techo en múltiplos de 5: el eje arranca en 0 y termina en un valor redondo y legible.
export function rangeMax(high: number): number {
  return Math.max(5, Math.ceil(high / 5) * 5);
}

export function rangePosition(value: number, max: number): number {
  return Math.min(100, Math.max(0, (value / max) * 100));
}

export function renderQuartileRange(o: RangeOptions): HTMLElement {
  const max = rangeMax(o.quartiles.high);
  const at = (value: number): string => `${rangePosition(value, max)}%`;
  const fmt = (value: number, decimals = o.decimals): string =>
    formatMetric({ value, decimals, unit: o.unit });

  const figure = document.createElement('figure');
  figure.className = 'aa-range';

  // figcaption debe ser primer o último hijo de <figure>: por eso envuelve título y cifra de contraste.
  const head = document.createElement('figcaption');
  head.className = 'aa-range__head';
  const caption = document.createElement('span');
  caption.className = 'aa-range__caption';
  caption.textContent = o.caption;
  head.appendChild(caption);
  if (o.gap) head.appendChild(renderStatList([o.gap], 'm', 'aa-range__gap'));

  const axis = document.createElement('div');
  axis.className = 'aa-range__axis';
  axis.setAttribute('aria-hidden', 'true');
  [0, max].forEach((tick) => {
    const span = document.createElement('span');
    span.textContent = fmt(tick, 0);
    axis.appendChild(span);
  });

  const track = document.createElement('div');
  track.className = 'aa-range__track';
  track.setAttribute('aria-hidden', 'true');
  const iqr = document.createElement('span');
  iqr.className = 'aa-range__iqr';
  iqr.style.setProperty('--aa-from', at(o.quartiles.low));
  iqr.style.setProperty('--aa-to', at(o.quartiles.high));
  const median = document.createElement('span');
  median.className = 'aa-range__median';
  median.style.setProperty('--aa-at', at(o.quartiles.median));
  track.append(iqr, median);

  const marks = document.createElement('dl');
  marks.className = 'aa-range__marks';
  (['low', 'median', 'high'] as const).forEach((key) => {
    const mark = document.createElement('div');
    mark.className = `aa-range__mark is--${key}`;
    mark.style.setProperty('--aa-at', at(o.quartiles[key]));
    const dt = document.createElement('dt');
    dt.className = 'aa-range__label';
    dt.textContent = o.labels[key];
    const dd = document.createElement('dd');
    dd.className = 'aa-range__value';
    dd.textContent = fmt(o.quartiles[key]);
    mark.append(dt, dd);
    marks.appendChild(mark);
  });

  const plot = document.createElement('div');
  plot.className = 'aa-range__plot';
  plot.append(axis, track, marks);

  figure.append(head, plot);
  if (o.note) {
    const note = document.createElement('p');
    note.className = 'aa-range__note';
    note.textContent = o.note;
    figure.appendChild(note);
  }
  return figure;
}
