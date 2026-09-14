// Datos del estudio "Performance en WhatsApp" (PDF v3, corrida del 3 de septiembre de 2026).
// Fuente única de números: el copy y las gráficas leen de aquí, nunca escriben cifras a mano.
// Porcentajes en puntos (69.1 = 69,1 %). test/study.test.ts cruza las métricas derivadas.

export const BASE = {
  messages: 11_481_784, // mensajes de campaña procesados
  recipients: 5_250_000, // destinatarios alcanzados
  environments: 438, // ambientes de empresas en LATAM
  countries: 14,
  days: 45,
} as const;

export type FunnelStepName = 'Procesados' | 'Entregados' | 'Leídos' | 'Respondidos' | 'Con venta';

export interface FunnelStep {
  step: FunnelStepName;
  share: number; // % sobre el total de mensajes procesados
}

export const FUNNEL: FunnelStep[] = [
  { step: 'Procesados', share: 100 },
  { step: 'Entregados', share: 69.1 },
  { step: 'Leídos', share: 40.3 },
  { step: 'Respondidos', share: 10.7 },
  { step: 'Con venta', share: 0.81 },
];

// Tasas sobre entregados (no sobre procesados) que cita el texto.
export const READ_OF_DELIVERED = 58.3;
export const REPLY_OF_DELIVERED = 15.5;
export const DELIVERED_PER_REPLY = 6.5;

export interface CountryRow {
  name: string;
  environments: number;
  messages: number;
  delivery: number; // % del procesado con entrega confirmada
  read: number; // % del procesado con lectura confirmada
  reply: number; // % del procesado que genera respuesta
  fail: number; // % del procesado que no pudo entregarse
  perReply: number; // mensajes entregados por respuesta
}

// Orden del PDF: volumen de mensajes descendente.
export const COUNTRIES: CountryRow[] = [
  { name: 'Colombia', environments: 76, messages: 5_612_755, delivery: 64.0, read: 34.5, reply: 7.7, fail: 30.0, perReply: 8.3 },
  { name: 'México', environments: 104, messages: 1_565_765, delivery: 63.3, read: 36.7, reply: 15.1, fail: 27.3, perReply: 4.2 },
  { name: 'Panamá', environments: 56, messages: 793_907, delivery: 79.6, read: 50.7, reply: 18.3, fail: 15.2, perReply: 4.3 },
  { name: 'Guatemala', environments: 17, messages: 664_466, delivery: 73.3, read: 50.9, reply: 12.5, fail: 22.8, perReply: 5.9 },
  { name: 'Costa Rica', environments: 27, messages: 561_284, delivery: 79.9, read: 52.4, reply: 15.5, fail: 14.3, perReply: 5.2 },
  { name: 'Chile', environments: 34, messages: 527_042, delivery: 77.5, read: 43.6, reply: 9.2, fail: 15.6, perReply: 8.4 },
  { name: 'Nicaragua', environments: 17, messages: 424_836, delivery: 85.6, read: 58.7, reply: 11.1, fail: 11.3, perReply: 7.7 },
  { name: 'El Salvador', environments: 20, messages: 348_396, delivery: 81.9, read: 55.7, reply: 11.1, fail: 11.2, perReply: 7.4 },
  { name: 'Perú', environments: 17, messages: 187_769, delivery: 72.1, read: 39.7, reply: 8.7, fail: 24.8, perReply: 8.3 },
  { name: 'Honduras', environments: 7, messages: 153_302, delivery: 81.5, read: 41.1, reply: 7.8, fail: 15.3, perReply: 10.4 },
  { name: 'Argentina', environments: 11, messages: 116_141, delivery: 50.4, read: 26.5, reply: 8.9, fail: 43.5, perReply: 5.7 },
  { name: 'Paraguay', environments: 5, messages: 79_552, delivery: 84.9, read: 54.4, reply: 24.6, fail: 11.9, perReply: 3.5 },
  { name: 'Brasil', environments: 12, messages: 78_175, delivery: 77.9, read: 45.6, reply: 24.6, fail: 14.0, perReply: 3.2 },
  { name: 'Ecuador', environments: 10, messages: 56_611, delivery: 75.5, read: 47.6, reply: 10.4, fail: 21.7, perReply: 7.3 },
];

export interface IndustryRow {
  name: string;
  perReply: number; // mensajes entregados por respuesta
  reply: number; // % de respuesta
}

export const INDUSTRIES: IndustryRow[] = [
  { name: 'Seguros', perReply: 2.4, reply: 31.2 },
  { name: 'Construcción', perReply: 3.2, reply: 26.0 },
  { name: 'Retail', perReply: 4.8, reply: 16.5 },
  { name: 'Automotriz', perReply: 5.0, reply: 15.5 },
  { name: 'Servicios financieros', perReply: 5.9, reply: 11.1 },
  { name: 'Inmobiliario', perReply: 6.4, reply: 10.3 },
  { name: 'Educación superior', perReply: 7.9, reply: 8.4 },
  { name: 'Educación', perReply: 8.0, reply: 9.2 },
  { name: 'Salud', perReply: 16.5, reply: 4.3 },
];

export interface Quartiles {
  low: number; // cuartil inferior
  median: number;
  high: number; // cuartil superior
}

// Ambientes con al menos 1.000 envíos, ordenados por tasa de respuesta.
export const DISTRIBUTION: { environments: number; minSends: number; reply: Quartiles; fail: Quartiles } = {
  environments: 276,
  minSends: 1_000,
  reply: { low: 6.8, median: 12.2, high: 22.0 },
  fail: { low: 9.3, median: 14.6, high: 23.1 },
};

export function funnelShare(step: FunnelStepName): number {
  const found = FUNNEL.find((s) => s.step === step);
  if (!found) throw new Error(`Paso de embudo inexistente: ${step}`);
  return found.share;
}

export function country(name: string): CountryRow {
  const found = COUNTRIES.find((c) => c.name === name);
  if (!found) throw new Error(`País inexistente en el estudio: ${name}`);
  return found;
}
