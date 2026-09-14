// Formato numérico del estudio (es-LATAM): miles con punto, decimales con coma.
// No usa Intl: es-ES no agrupa números de 4 cifras ("1000") y el PDF sí ("1.000").
// Sin imports en runtime: lo cargan tanto el bundle como node --test.

export type MetricUnit = '%' | '×';

export interface Metric {
  value: number;
  decimals: number;
  unit?: MetricUnit;
}

const THOUSANDS = /\B(?=(\d{3})+(?!\d))/g;
// Espacio duro: "69,1 %" nunca se parte entre líneas.
const NBSP = '\u00a0';

export function formatNumber(value: number, decimals = 0): string {
  const [int, frac] = Math.abs(value).toFixed(decimals).split('.');
  const grouped = int.replace(THOUSANDS, '.');
  const sign = value < 0 ? '-' : '';
  return frac ? `${sign}${grouped},${frac}` : `${sign}${grouped}`;
}

export function formatMetric(metric: Metric): string {
  const n = formatNumber(metric.value, metric.decimals);
  if (metric.unit === '%') return `${n}${NBSP}%`;
  if (metric.unit === '×') return `${n}×`;
  return n;
}
