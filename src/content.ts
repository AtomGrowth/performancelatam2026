// Contenido de la página (estudio "Performance en WhatsApp", PDF v3). Una sola fuente de copy.
// Las cifras salen de data/study.ts; aquí solo se formatean. El ritmo lo dan las superficies
// (ver Surface en ui/layout.ts): canvas, card, sheet, accent, card-dark y media.
// Embudo, barras, tabla y cuartiles llegan en F2-F3.

import type { Surface } from './ui/layout';
import type { StatItem } from './ui/stat';
import { companyImage, deliveryImage } from './assets/r2';
import { formatMetric, formatNumber } from './data/format';
import { BASE, DELIVERED_PER_REPLY, country, funnelShare } from './data/study';

export interface ProseContent {
  kind: 'prose' | 'statement';
  id?: string;
  surface: Surface;
  join?: boolean; // se funde con la sección anterior en un solo bloque
  eyebrow?: string;
  heading: string;
  // Palabra rotatoria opcional en el heading: before + (words ciclando) + after.
  // `heading` se mantiene como fallback/SEO; si hay `rotate`, manda el rotatorio.
  rotate?: { before: string; words: string[]; after?: string; block?: boolean };
  figure?: StatItem; // cifra protagonista bajo el heading
  // split = Content 17 de Relume: heading | párrafos en la retícula de .aa-split-head, para
  // alinearse con un bloque Stats 2 dentro de la misma card. Ignora rotate, figure, faq y media.
  layout?: 'split';
  paragraphs: string[];
  // FAQ opcional embebido (acordeón) dentro del mismo bloque, antes del CTA.
  faq?: { q: string; a: string }[];
  cta?: { label: string; href: string };
  // Layout con imagen lateral (opcional). ratio = aspect-ratio CSS (ej. '1 / 1'); sin él manda split.css.
  media?: { side: 'left' | 'right'; src?: string; alt?: string; ratio?: string };
}

export interface ChecklistContent {
  kind: 'checklist';
  id?: string;
  surface: Surface;
  join?: boolean; // se funde con la sección anterior en un solo bloque
  eyebrow?: string;
  heading: string;
  intro?: string[];
  items: string[];
  marker?: 'check' | 'dot';
  outro?: string[];
  cta?: { label: string; href: string };
  media?: { side: 'left' | 'right'; src?: string; alt?: string };
}

export interface StatCard extends StatItem {
  title?: string; // encabezado de la card (variante cards)
}

// Variantes con estructura de Relume: row = Stats 2 (encabezado partido + fila),
// aside = Stats 14 (texto + cifra grande), cards = Stats 44 (texto + cards de cifra).
// map = texto + cards compactas | mapa de OSMO con los países de las cards resaltados.
export interface StatsContent {
  kind: 'stats';
  id?: string;
  surface: Surface;
  join?: boolean; // se funde con la sección anterior en un solo bloque
  variant: 'row' | 'aside' | 'cards' | 'map';
  mapCaption?: string; // título del mapa (variante map)
  mapNote?: string; // aclaración bajo la leyenda: qué entra en el corte que muestra el mapa
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  list?: { intro: string; items: string[] };
  // aside con imagen: la cifra va en placa blanca anclada abajo a la izquierda del marco.
  // Sin src queda el placeholder.
  media?: { src?: string; alt?: string };
  stats: StatCard[];
}

export interface InfoContent {
  kind: 'info';
  id?: string;
  surface: Surface;
  join?: boolean; // se funde con la sección anterior en un solo bloque
  heading: string; // statement largo de la columna izquierda
  rotate?: { before: string; words: string[]; after?: string; block?: boolean };
  items: { title: string; desc: string }[]; // filas label (izq) + párrafo (der)
  form?: boolean; // columna derecha con el formulario de descarga (#aa-descarga)
}

// Ficha técnica (Description List 1 de Relume): pares término/descripción. Reemplaza al acordeón
// de metodología: cada nota vive junto a las cifras que explica, no en un anexo plegado.
export interface FactsContent {
  kind: 'facts';
  id?: string;
  surface: Surface;
  join?: boolean; // se funde con la sección anterior en un solo bloque
  eyebrow?: string;
  heading: string;
  items: { term: string; desc: string }[];
}

export interface FaqContent {
  kind: 'faq';
  id?: string;
  surface: Surface;
  join?: boolean; // se funde con la sección anterior en un solo bloque
  eyebrow?: string;
  heading: string;
  items: { q: string; a: string }[];
}

export interface CtaContent {
  kind: 'cta';
  id?: string;
  surface: Surface;
  join?: boolean; // se funde con la sección anterior en un solo bloque
  heading: string;
  paragraphs?: string[];
  cta: { label: string; href: string };
  // Video de fondo hospedado en R2 (no se inlina: el bundle es público).
  bgVideo?: { webm: string; mp4: string; poster: string };
}

export type SectionContent =
  | ProseContent
  | ChecklistContent
  | StatsContent
  | InfoContent
  | FactsContent
  | FaqContent
  | CtaContent;

const pct = (value: number): string => formatMetric({ value, decimals: 1, unit: '%' });

const delivered = funnelShare('Entregados');
const brasil = country('Brasil');
const chile = country('Chile');

export const SECTIONS: SectionContent[] = [
  {
    kind: 'prose',
    id: 'aa-eficiencia',
    surface: 'card',
    layout: 'split',
    eyebrow: 'Introducción',
    heading: 'Medir eficiencia importa cada vez más',
    paragraphs: [
      'A partir del 1 de octubre de 2026, el nuevo esquema de precios de Meta ha cambiado la forma en que las empresas deben pensar el costo de operar WhatsApp.',
      'Cuando cada mensaje adicional puede tener un impacto económico, ya no alcanza con saber cuántos mensajes se envían. También se vuelve necesario entender cuántos mensajes hacen falta para conseguir una respuesta.',
      'Ese es el punto de partida de WhatsApp Performance: medir no solo actividad, sino la eficiencia con la que una operación transforma mensajes en interacción y resultado.',
    ],
  },
  {
    kind: 'stats',
    id: 'aa-base',
    surface: 'card',
    join: true,
    variant: 'row',
    heading: 'Base analizada',
    paragraphs: [
      'El resultado en WhatsApp no depende únicamente del canal, depende de la disciplina operativa con la que cada empresa gestiona su estrategia. El mismo canal puede producir resultados radicalmente distintos, y esto es lo que queremos demostrarte a continuación.',
      'Este estudio está construido sobre datos operativos reales y propone una lectura distinta de la realidad actual: seguir el recorrido completo del mensaje, desde que es procesado hasta que genera una venta o conversión.',
    ],
    stats: [
      { metric: { value: BASE.messages, decimals: 0 }, label: 'mensajes de campaña procesados' },
      { metric: { value: BASE.recipients, decimals: 0 }, label: 'destinatarios alcanzados' },
      { metric: { value: BASE.environments, decimals: 0 }, label: 'ambientes de empresas en LATAM' },
      { metric: { value: BASE.countries, decimals: 0 }, label: 'países' },
    ],
  },
  {
    kind: 'facts',
    id: 'aa-ficha',
    surface: 'card',
    join: true,
    eyebrow: 'Metodología',
    heading: 'Ficha del estudio',
    items: [
      {
        term: 'Datos',
        desc: `${formatNumber(BASE.messages)} mensajes de campaña salientes, enviados desde Atom por ${BASE.environments} ambientes empresariales en LATAM.`,
      },
      {
        term: 'Periodo',
        desc: `Del 20 de julio al 3 de septiembre de 2026: ${BASE.days} días. Datos extraídos el 3 de septiembre.`,
      },
      {
        term: 'Cómo medimos',
        desc: 'Entrega, lectura y respuesta son eventos confirmados por Meta, calculados sobre el total de mensajes procesados. Mensajes por respuesta = mensajes entregados ÷ respuestas recibidas.',
      },
      {
        term: 'Privacidad',
        desc: 'Todo se publica de forma agregada. Ningún corte permite identificar una cuenta, un contacto, un número ni el contenido de un mensaje.',
      },
    ],
  },
  {
    kind: 'stats',
    id: 'aa-entrega',
    surface: 'sheet',
    variant: 'aside',
    media: { src: deliveryImage, alt: 'Mujer con boina mirando su smartphone en una calle de la ciudad' },
    eyebrow: 'Entrega',
    heading: 'Qué ocurre después de enviar un mensaje',
    paragraphs: [
      'Enviar un mensaje no significa que haya llegado al destinatario, y que haya llegado no significa que haya sido leído o que haya generado una respuesta, una oportunidad o una venta.',
    ],
    list: {
      intro: 'La no entrega puede tener distintas causas:',
      items: [
        'Calidad de la base de contactos.',
        'Números inválidos o desactualizados.',
        'Bloqueos.',
        'Baja interacción con mensajes anteriores.',
        'Exceso de frecuencia.',
        'Restricciones asociadas a templates.',
      ],
    },
    stats: [
      {
        metric: { value: delivered, decimals: 1, unit: '%' },
        label: 'de los mensajes procesados registra entrega confirmada por Meta.',
      },
    ],
  },
  {
    kind: 'prose',
    id: 'aa-empresa',
    surface: 'sheet',
    join: true,
    media: { side: 'left', ratio: '1 / 1', src: companyImage, alt: 'Hombre joven explicando un plan de negocio a sus colegas' },
    heading: '¿Qué puede hacer una empresa?',
    paragraphs: [
      'La tasa de entrega también se puede trabajar. Mantener una base de contactos limpia, evitar contactar a usuarios que no interactúan, revisar la calidad de los templates y monitorear los códigos de error permite detectar dónde se está perdiendo volumen antes de llegar a la etapa de lectura o respuesta.',
      'La primera optimización de WhatsApp empieza antes de la respuesta: empieza por mejorar las condiciones para que el mensaje llegue.',
    ],
  },
  {
    kind: 'statement',
    id: 'aa-metrica',
    surface: 'accent',
    eyebrow: 'La métrica',
    heading: 'La métrica que cambia la conversación',
    figure: {
      metric: { value: DELIVERED_PER_REPLY, decimals: 1 },
      label: 'mensajes entregados para obtener una respuesta, en promedio.',
    },
    paragraphs: [
      '“Mensajes entregados por respuesta” responde una pregunta simple: ¿cuántos mensajes necesita entregar una empresa para obtener una respuesta? Cuanto menor es el número, mayor es la eficiencia de la operación para generar interacción.',
      'Ese número cambia de forma importante según el país, la industria y la propia operación: el promedio sirve de referencia, pero el rango es amplio.',
    ],
  },
  {
    kind: 'stats',
    id: 'aa-recorrido',
    surface: 'card',
    variant: 'map',
    mapCaption: `Los ${BASE.countries} países del estudio`,
    mapNote: `Un país entra con al menos ${formatNumber(20_000)} mensajes; una industria, con ${formatNumber(20_000)} mensajes y 10 ambientes empresariales. Estados Unidos y República Dominicana quedan fuera por tener menos de 3 ambientes.`,
    eyebrow: 'Recorrido completo',
    heading: 'Entregar el mensaje es apenas el comienzo',
    paragraphs: [
      'No hay una sola métrica que explique la performance: dos países pueden tener tasas de entrega similares y, sin embargo, terminar con niveles de respuesta muy diferentes.',
      `Brasil y Chile entregan prácticamente lo mismo (${pct(brasil.delivery)} y ${pct(chile.delivery)}), pero el resultado posterior es muy distinto.`,
    ],
    stats: [
      {
        title: brasil.name,
        metric: { value: brasil.reply, decimals: 1, unit: '%' },
        label: 'de respuesta',
        note: `${pct(brasil.delivery)} de entrega`,
      },
      {
        title: chile.name,
        metric: { value: chile.reply, decimals: 1, unit: '%' },
        label: 'de respuesta',
        note: `${pct(chile.delivery)} de entrega`,
      },
    ],
  },
  {
    kind: 'prose',
    id: 'aa-aprender',
    surface: 'sheet',
    layout: 'split',
    eyebrow: 'Benchmark',
    heading: '¿Cuánto esfuerzo de mensajería necesita mi operación para generar una respuesta?',
    paragraphs: [
      'Durante años, muchas empresas han evaluado WhatsApp principalmente por volumen. A partir de esta pregunta, puedes comparar tu tasa de entrega, lectura y respuesta, además de los mensajes que necesitas para conseguir una respuesta, frente a referencias de tu país, industria u operaciones con distintos niveles de desempeño.',
      'No debes enfocarte solamente en conocer el promedio, sino en encontrar el punto de referencia para entender dónde te encuentras y cuánto margen de mejora puede existir.',
      'Estos resultados describen las operaciones incluidas en ese periodo. Úsalos como punto de referencia para comparar tu operación con tu país, tu industria y otras empresas.',
    ],
  },
  {
    kind: 'info',
    id: 'aa-mejorar',
    surface: 'canvas',
    form: true,
    heading: 'De medir la performance a mejorarla',
    items: [
      {
        title: 'Trazabilidad de principio a fin',
        desc: 'Conecta las conversaciones de WhatsApp con la información comercial de cada cliente para entender qué campaña originó una conversación, qué ocurrió dentro de ella y qué resultado terminó generando. Así entiendes mejor a tu perfil de clientes y enfocas el esfuerzo en oportunidades reales.',
      },
      {
        title: 'Automatiza tareas repetitivas dentro de la conversación',
        desc: 'La IA en WhatsApp puede identificar intención, calificar oportunidades, cotizar, agendar y activar el siguiente paso de una conversación. Esto ayuda a avanzar más rápido hacia un resultado y a reducir interacciones innecesarias.',
      },
      {
        title: 'Recuperación de oportunidades',
        desc: 'Identifica conversaciones que se detuvieron y activa seguimientos para volver a ponerlas en movimiento. Así dejas de perder leads que demostraron interés pero no avanzaron en algún momento.',
      },
      {
        title: 'Información para optimizar la inversión',
        desc: 'La conexión entre WhatsApp, CRM y plataformas publicitarias permite entender qué campañas terminan generando oportunidades y ventas, para que marketing pueda optimizar su inversión en función de resultados comerciales.',
      },
    ],
  },
];
