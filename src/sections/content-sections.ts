// Renderers genéricos por tipo de sección + ensamblado en orden desde content.ts.
// Reutiliza el lenguaje OSMO: container/section, headings con SplitText, reveals,
// checklist, info y accordion. Las variantes de stats siguen la estructura de Relume.

import { renderSection, renderContainer, themeOf, type ContainerSize } from '../ui/layout';
import { renderEyebrow, renderHeading, renderParagraph } from '../ui/text';
import { renderButton } from '../ui/atoms/button';
import { renderRotatingHeading } from '../ui/rotating-text';
import { renderAccordion } from '../ui/accordion';
import { renderStatList } from '../ui/stat';
import { renderLatamMap } from '../ui/latam-map';
import { renderDownloadForm } from './download-form';
import {
  SECTIONS,
  type SectionContent,
  type ProseContent,
  type ChecklistContent,
  type StatsContent,
  type StatCard,
  type InfoContent,
  type FactsContent,
  type FaqContent,
  type CtaContent,
} from '../content';

const CHECK_ICON =
  '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M2.5 7.5 5.5 10.5 11.5 3.5" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"/></svg>';

function stack(center = false): HTMLElement {
  const el = document.createElement('div');
  el.className = center ? 'aa-stack aa-stack--center' : 'aa-stack';
  return el;
}

function fadeParagraph(text: string): HTMLElement {
  const p = renderParagraph({ size: 'l', text });
  p.setAttribute('data-aa-fade', '');
  return p;
}

function fadeEyebrow(text: string): HTMLElement {
  const e = renderEyebrow(text);
  e.setAttribute('data-aa-fade', '');
  return e;
}

function withFade(el: HTMLElement): HTMLElement {
  el.setAttribute('data-aa-fade', '');
  return el;
}

function ctaRow(cta: { label: string; href: string }): HTMLElement {
  const row = document.createElement('div');
  row.className = 'aa-cta-row';
  row.setAttribute('data-aa-fade', '');
  row.appendChild(renderButton({ label: cta.label, href: cta.href, variant: 'primary' }));
  return row;
}

type MediaCfg = NonNullable<ProseContent['media']>;

function mediaOf(c: SectionContent): MediaCfg | undefined {
  return c.kind === 'prose' || c.kind === 'statement' || c.kind === 'checklist' ? c.media : undefined;
}

// Envuelve el contenido (texto) + una imagen lateral en dos columnas. side=left → imagen
// primero. Si no hay src, deja un placeholder (para cambiar por la imagen real después).
function twoCol(textEl: HTMLElement, media: MediaCfg): HTMLElement {
  const row = document.createElement('div');
  row.className = `aa-split aa-split--${media.side}`;

  const textCol = document.createElement('div');
  textCol.className = 'aa-split__text';
  textCol.appendChild(textEl);

  const mediaCol = document.createElement('div');
  mediaCol.className = 'aa-split__media';
  mediaCol.setAttribute('data-aa-fade', '');
  if (media.ratio) mediaCol.style.aspectRatio = media.ratio;
  if (media.src) {
    const img = document.createElement('img');
    img.src = media.src;
    img.alt = media.alt ?? '';
    img.loading = 'lazy';
    img.decoding = 'async';
    mediaCol.appendChild(img);
  } else {
    mediaCol.classList.add('aa-split__media--placeholder');
    const label = document.createElement('span');
    label.className = 'aa-split__placeholder-label';
    label.textContent = 'Imagen';
    mediaCol.appendChild(label);
  }

  row.append(textCol, mediaCol);
  return row;
}

// Content 17: misma retícula que la cabecera de Stats 2, así una sección unida a un bloque de
// cifras comparte columnas con él.
function buildProseSplit(c: ProseContent): HTMLElement {
  const head = stack();
  if (c.eyebrow) head.appendChild(fadeEyebrow(c.eyebrow));
  head.appendChild(renderHeading({ size: 'l', text: c.heading, split: true }));
  const body = stack();
  c.paragraphs.forEach((p) => body.appendChild(fadeParagraph(p)));
  if (c.cta) body.appendChild(ctaRow(c.cta));
  const row = document.createElement('div');
  row.className = 'aa-split-head';
  row.append(head, body);
  return row;
}

function buildProse(c: ProseContent): HTMLElement {
  if (c.layout === 'split') return buildProseSplit(c);
  const center = c.kind === 'statement';
  const s = stack(center);
  if (c.eyebrow) s.appendChild(fadeEyebrow(c.eyebrow));
  if (c.rotate) {
    s.appendChild(
      renderRotatingHeading({
        size: center ? 'xl' : 'l',
        before: c.rotate.before,
        words: c.rotate.words,
        after: c.rotate.after,
        block: c.rotate.block,
      }),
    );
  } else {
    s.appendChild(
      renderHeading({
        size: center ? 'xl' : 'l',
        text: c.heading,
        split: true,
        className: center ? 'aa-text-balance' : undefined,
      }),
    );
  }
  if (c.figure) {
    s.appendChild(withFade(renderStatList([c.figure], 'xl', center ? 'aa-stats--center' : undefined)));
  }
  c.paragraphs.forEach((p) => s.appendChild(fadeParagraph(p)));
  if (c.faq?.length) {
    s.appendChild(fadeEyebrow('Preguntas frecuentes'));
    const acc = renderAccordion(c.faq);
    acc.setAttribute('data-aa-fade', '');
    s.appendChild(acc);
  }
  if (c.cta) s.appendChild(ctaRow(c.cta));
  return c.media ? twoCol(s, c.media) : s;
}

function buildList(items: string[], marker: 'check' | 'dot'): HTMLElement {
  const ul = document.createElement('ul');
  ul.className = `aa-list aa-list--${marker}`;
  ul.setAttribute('data-aa-fade', '');
  items.forEach((text) => {
    const li = document.createElement('li');
    li.className = 'aa-list__item';
    const m = document.createElement('span');
    m.className = 'aa-list__marker';
    if (marker === 'check') m.innerHTML = CHECK_ICON;
    const t = document.createElement('span');
    t.textContent = text;
    li.append(m, t);
    ul.appendChild(li);
  });
  return ul;
}

function buildChecklist(c: ChecklistContent): HTMLElement {
  const s = stack();
  if (c.eyebrow) s.appendChild(fadeEyebrow(c.eyebrow));
  s.appendChild(renderHeading({ size: 'l', text: c.heading, split: true }));
  (c.intro ?? []).forEach((p) => s.appendChild(fadeParagraph(p)));
  s.appendChild(buildList(c.items, c.marker ?? 'check'));
  (c.outro ?? []).forEach((p) => s.appendChild(fadeParagraph(p)));
  if (c.cta) s.appendChild(ctaRow(c.cta));
  return c.media ? twoCol(s, c.media) : s;
}

// Stats 44: cada card lleva su título arriba y una sola cifra con nota bajo filete.
// compact = fila de cards junto a un visual (variante map).
function buildStatCards(stats: StatCard[], compact = false): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = compact ? 'aa-stat-cards aa-stat-cards--row' : 'aa-stat-cards';
  stats.forEach((stat) => {
    const card = document.createElement('article');
    card.className = 'aa-stat-card';
    card.setAttribute('data-aa-fade', '');
    if (stat.title) {
      card.appendChild(
        renderHeading({ size: 'm', text: stat.title, tag: 'h3', className: 'aa-stat-card__title' }),
      );
    }
    card.appendChild(renderStatList([stat], compact ? 'm' : 'l'));
    wrap.appendChild(card);
  });
  return wrap;
}

// Cifra sobre imagen: el marco estira a la altura de la fila (la columna de texto manda) y la
// placa blanca se ancla abajo a la izquierda, a ras del borde, para que el squircle la recorte.
// La imagen va como <img> de fondo y no como background-image para conservar alt y lazy load.
function buildStatMedia(stats: StatCard[], media: NonNullable<StatsContent['media']>): HTMLElement {
  const frame = document.createElement('div');
  frame.className = 'aa-stat-media';
  frame.setAttribute('data-aa-fade', '');
  if (media.src) {
    const img = document.createElement('img');
    img.className = 'aa-stat-media__img';
    img.src = media.src;
    img.alt = media.alt ?? '';
    img.loading = 'lazy';
    img.decoding = 'async';
    frame.appendChild(img);
  } else {
    frame.classList.add('aa-stat-media--placeholder');
    const label = document.createElement('span');
    label.className = 'aa-split__placeholder-label';
    label.textContent = 'Imagen';
    frame.appendChild(label);
  }
  // Tamaño l, no xl: la placa debe dejar ver la imagen, no taparla de lado a lado.
  frame.appendChild(renderStatList(stats, 'l', 'aa-stat-media__plate'));
  return frame;
}

function buildStats(c: StatsContent): HTMLElement {
  const text = stack();
  if (c.eyebrow) text.appendChild(fadeEyebrow(c.eyebrow));
  text.appendChild(renderHeading({ size: 'l', text: c.heading, split: true }));

  // Stats 2: encabezado partido (título | párrafos) y la fila de cifras debajo.
  if (c.variant === 'row') {
    const body = stack();
    c.paragraphs.forEach((p) => body.appendChild(fadeParagraph(p)));
    const head = document.createElement('div');
    head.className = 'aa-split-head';
    head.append(text, body);

    const block = document.createElement('div');
    block.className = 'aa-stats-block';
    block.append(head, withFade(renderStatList(c.stats, 'm', 'aa-stats--row')));
    return block;
  }

  // Stats 14 / 44 / mapa: texto a la izquierda, cifra grande, cards o mapa a la derecha.
  c.paragraphs.forEach((p) => text.appendChild(fadeParagraph(p)));
  if (c.list) {
    text.appendChild(fadeParagraph(c.list.intro));
    text.appendChild(buildList(c.list.items, 'dot'));
  }

  let visual: HTMLElement;
  if (c.variant === 'map') {
    text.appendChild(buildStatCards(c.stats, true));
    const names = c.stats.flatMap((s) => (s.title ? [s.title] : []));
    visual = withFade(renderLatamMap(names, c.mapCaption ?? c.heading, c.mapNote));
  } else if (c.variant === 'cards') {
    visual = buildStatCards(c.stats);
  } else if (c.media) {
    visual = buildStatMedia(c.stats, c.media);
  } else {
    visual = withFade(renderStatList(c.stats, 'xl'));
  }

  const aside = document.createElement('div');
  aside.className = 'aa-stat-aside';
  aside.append(text, visual);
  return aside;
}

// Layout info — réplica de la sección .info de OSMO: statement grande + lista de
// filas label/párrafo.
function buildInfo(c: InfoContent): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'aa-info__wrap';

  const large = document.createElement('div');
  large.className = 'aa-info__large-col';

  large.appendChild(
    c.rotate
      ? renderRotatingHeading({
          size: 'l',
          tag: 'h3',
          before: c.rotate.before,
          words: c.rotate.words,
          after: c.rotate.after,
          block: c.rotate.block,
          className: 'aa-info__title',
        })
      : renderHeading({ size: 'l', text: c.heading, tag: 'h3', split: true, className: 'aa-info__title' }),
  );

  // Con formulario la lista abierta dejaba la columna mucho más alta que el form: en accordion
  // queda a su altura y el detalle se abre a demanda.
  if (c.form) {
    const acc = renderAccordion(
      c.items.map((item) => ({ q: item.title, a: item.desc })),
      { openFirst: true, idPrefix: `${c.id ?? 'aa-info'}-item` },
    );
    acc.classList.add('aa-info__accordion');
    acc.setAttribute('data-aa-fade', '');
    large.appendChild(acc);
  } else {
    const ul = document.createElement('ul');
    ul.className = 'aa-info__list';
    c.items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'aa-info__li';
      li.setAttribute('data-aa-fade', '');
      const liTitle = document.createElement('div');
      liTitle.className = 'aa-info__li-title';
      liTitle.appendChild(renderHeading({ size: 'm', text: item.title, tag: 'h4' }));
      const desc = renderParagraph({ size: 'm', text: item.desc, className: 'aa-info__li-desc' });
      li.append(liTitle, desc);
      ul.appendChild(li);
    });
    large.appendChild(ul);
  }

  wrap.appendChild(large);
  // Con formulario: la lista baja a una columna y el form ocupa la derecha, fijo mientras se lee.
  if (c.form) {
    wrap.classList.add('aa-info__wrap--form');
    const aside = document.createElement('div');
    aside.className = 'aa-info__aside';
    aside.appendChild(renderDownloadForm());
    wrap.appendChild(aside);
  }
  return wrap;
}

// Description List 1: la lista usa dos columnas con el mismo gap que .aa-split-head, así la
// segunda columna cae alineada con los párrafos de las secciones unidas encima.
function buildFacts(c: FactsContent): HTMLElement {
  const head = stack();
  if (c.eyebrow) head.appendChild(fadeEyebrow(c.eyebrow));
  head.appendChild(renderHeading({ size: 'ml', text: c.heading, split: true }));

  const dl = document.createElement('dl');
  dl.className = 'aa-facts__list';
  dl.setAttribute('data-aa-fade', '');
  c.items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'aa-facts__item';
    const dt = document.createElement('dt');
    dt.className = 'aa-facts__term';
    dt.textContent = item.term;
    const dd = document.createElement('dd');
    dd.className = 'aa-facts__desc';
    dd.textContent = item.desc;
    row.append(dt, dd);
    dl.appendChild(row);
  });

  const wrap = document.createElement('div');
  wrap.className = 'aa-facts';
  wrap.append(head, dl);
  return wrap;
}

function buildFaq(c: FaqContent): HTMLElement {
  const s = stack();
  if (c.eyebrow) s.appendChild(fadeEyebrow(c.eyebrow));
  s.appendChild(renderHeading({ size: 'l', text: c.heading, split: true }));
  const acc = renderAccordion(c.items);
  acc.setAttribute('data-aa-fade', '');
  s.appendChild(acc);
  return s;
}

function buildCta(c: CtaContent): HTMLElement {
  const s = stack(true);
  s.appendChild(renderHeading({ size: 'xl', text: c.heading, split: true, className: 'aa-text-balance' }));
  (c.paragraphs ?? []).forEach((p) => s.appendChild(fadeParagraph(p)));
  s.appendChild(ctaRow(c.cta));
  return s;
}

function renderBgVideo(m: NonNullable<CtaContent['bgVideo']>): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'aa-section__media';
  wrap.setAttribute('aria-hidden', 'true');

  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.poster = m.poster;

  const webm = document.createElement('source');
  webm.src = m.webm;
  webm.type = 'video/webm';
  const mp4 = document.createElement('source');
  mp4.src = m.mp4;
  mp4.type = 'video/mp4';
  video.append(webm, mp4);

  wrap.appendChild(video);
  return wrap;
}

function buildInner(c: SectionContent): HTMLElement {
  switch (c.kind) {
    case 'prose':
    case 'statement':
      return buildProse(c);
    case 'checklist':
      return buildChecklist(c);
    case 'stats':
      return buildStats(c);
    case 'info':
      return buildInfo(c);
    case 'facts':
      return buildFacts(c);
    case 'faq':
      return buildFaq(c);
    case 'cta':
      return buildCta(c);
  }
}

function sizeFor(c: SectionContent): ContainerSize {
  // split reparte dos columnas: necesita el ancho completo, como info y stats.
  if (c.kind === 'info' || c.kind === 'stats' || (c.kind === 'prose' && c.layout === 'split')) return 'default';
  if (c.kind === 'statement') return 'm';
  return 'sm';
}

export function renderContentSections(root: Element): void {
  SECTIONS.forEach((c, i) => {
    const bgVideo = c.kind === 'cta' ? c.bgVideo : undefined;
    const isHead = !c.join;
    const isTail = !SECTIONS[i + 1]?.join;
    const isCard = c.surface === 'card' || c.surface === 'card-dark';
    const container = renderContainer({
      size: mediaOf(c) || isCard ? 'default' : sizeFor(c),
      className: isCard ? 'aa-container--card' : undefined,
      children: [buildInner(c)],
    });
    // La card oscura invierte los tokens dentro del container; la sección sigue siendo canvas.
    if (c.surface === 'card-dark') {
      container.setAttribute('data-aa-section-theme', 'dark');
      container.setAttribute('data-aa-surface', 'card-dark');
    }

    // head/tail marcan dónde abre y cierra un bloque (join funde secciones consecutivas).
    const classes = [
      bgVideo ? 'aa-section--media' : '',
      isHead ? 'is--head' : 'aa-section--joined',
      isTail ? 'is--tail' : '',
    ].filter(Boolean);

    const section = renderSection({
      theme: themeOf(c.surface),
      className: classes.join(' '),
      children: bgVideo ? [renderBgVideo(bgVideo), container] : [container],
    });
    if (!isCard) section.setAttribute('data-aa-surface', c.surface);
    if (c.id) section.id = c.id;
    root.appendChild(section);
  });
}
