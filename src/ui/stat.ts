// Stat — valor + etiqueta con filete (estructura de Relume Stats 2/14/44 sobre el DS).
// El valor final se escribe en el HTML: legible sin JS y para lectores de pantalla. El conteo
// animado corre sobre un nodo aria-hidden para no narrar cada frame.

import { gsap } from './gsap-env';
import { prefersReducedMotion } from './motion';
import { formatMetric, type Metric } from '../data/format';

export interface StatItem {
  metric: Metric;
  label: string;
  note?: string;
}

export type StatSize = 'm' | 'l' | 'xl';

const COUNT_DURATION = 1.6;
const COUNT_EASE = 'expo.out';

// El metric viaja por referencia del nodo en vez de serializarse en data-attributes.
const counters = new WeakMap<HTMLElement, Metric>();

export function renderStat(item: StatItem, size: StatSize): HTMLElement {
  // Sin data-aa-fade propio: el reveal lo pone quien contiene la lista, para no anidar tweens.
  const wrap = document.createElement('div');
  wrap.className = `aa-stat aa-stat--${size}`;

  const label = document.createElement('dt');
  label.className = 'aa-stat__label';
  label.textContent = item.label;

  const text = formatMetric(item.metric);
  const value = document.createElement('dd');
  value.className = 'aa-stat__value';

  const counter = document.createElement('span');
  counter.setAttribute('aria-hidden', 'true');
  counter.setAttribute('data-aa-count', '');
  counter.textContent = text;
  counters.set(counter, item.metric);

  const spoken = document.createElement('span');
  spoken.className = 'aa-sr-only';
  spoken.textContent = text;

  value.append(counter, spoken);
  wrap.append(label, value);

  if (item.note) {
    const note = document.createElement('dd');
    note.className = 'aa-stat__note';
    note.textContent = item.note;
    wrap.appendChild(note);
  }
  return wrap;
}

export function renderStatList(items: StatItem[], size: StatSize, className?: string): HTMLElement {
  const list = document.createElement('dl');
  list.className = className ? `aa-stats ${className}` : 'aa-stats';
  items.forEach((item) => list.appendChild(renderStat(item, size)));
  return list;
}

export function initCountUp(scope: Element): void {
  if (prefersReducedMotion()) return;

  scope.querySelectorAll<HTMLElement>('[data-aa-count]').forEach((el) => {
    const metric = counters.get(el);
    if (!metric) return;
    const state = { value: 0 };
    el.textContent = formatMetric({ ...metric, value: 0 });
    gsap.to(state, {
      value: metric.value,
      duration: COUNT_DURATION,
      ease: COUNT_EASE,
      onUpdate: () => {
        el.textContent = formatMetric({ ...metric, value: state.value });
      },
      scrollTrigger: { trigger: el, start: 'clamp(top 85%)', once: true },
    });
  });
}
