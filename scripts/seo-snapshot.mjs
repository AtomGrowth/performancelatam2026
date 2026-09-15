// Snapshot semántico del contenido para el embed de Webflow.
//
// La landing se renderiza con JS dentro de [data-aa-mount]; el HTML servido quedaba vacío y los
// crawlers de IA (GPTBot, ClaudeBot, PerplexityBot) no ejecutan JS. Este script arma, desde la
// misma fuente de copy (src/content.ts), el texto de la página como HTML plano oculto con
// `hidden`, para pegarlo dentro del div de montaje. El bundle lo reemplaza al arrancar
// (mount.replaceChildren), así que nadie lo ve y Google indexa el render real.
//
// Solo se incluye lo que la página muestra: contenido que exista únicamente en el snapshot
// sería cloaking.
//
// Uso: node scripts/seo-snapshot.mjs > public/seo-snapshot.html
// Tras cambiar copy o cifras, regenerar y volver a pegar en el embed.

import * as esbuild from 'esbuild';

const EMBED_LIMIT = 50_000; // caracteres por Embed de Webflow

const bundled = await esbuild.build({
  stdin: {
    contents: "export { SECTIONS } from './src/content.ts'; export { formatMetric } from './src/data/format.ts';",
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  write: false,
});
const code = bundled.outputFiles[0].text;
const { SECTIONS, formatMetric } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const p = (text) => `<p>${esc(text)}</p>`;
const stat = (s) => {
  const lead = s.title ? `${esc(s.title)}: ` : '';
  const note = s.note ? ` (${esc(s.note)})` : '';
  return `<li>${lead}<strong>${esc(formatMetric(s.metric))}</strong> ${esc(s.label)}${note}</li>`;
};

function section(c) {
  const out = [];
  if (c.eyebrow) out.push(p(c.eyebrow));
  out.push(`<h2>${esc(c.heading)}</h2>`);

  switch (c.kind) {
    case 'prose':
    case 'statement':
      if (c.figure) out.push(`<p><strong>${esc(formatMetric(c.figure.metric))}</strong> ${esc(c.figure.label)}</p>`);
      c.paragraphs.forEach((t) => out.push(p(t)));
      break;
    case 'stats':
      c.paragraphs.forEach((t) => out.push(p(t)));
      if (c.list) out.push(p(c.list.intro), `<ul>${c.list.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`);
      out.push(`<ul>${c.stats.map(stat).join('')}</ul>`);
      if (c.mapCaption) out.push(p(c.mapCaption));
      if (c.mapNote) out.push(p(c.mapNote));
      break;
    case 'facts':
      out.push(`<dl>${c.items.map((i) => `<dt>${esc(i.term)}</dt><dd>${esc(i.desc)}</dd>`).join('')}</dl>`);
      break;
    case 'info':
      c.items.forEach((i) => out.push(`<h3>${esc(i.title)}</h3>`, p(i.desc)));
      if (c.form) {
        out.push('<h3>Descarga el estudio completo</h3>');
        out.push(p('Déjanos tus datos y accede al PDF con los resultados por país e industria.'));
      }
      break;
    default:
      throw new Error(`seo-snapshot: kind sin serializar: ${c.kind}`);
  }
  return `<section>${out.join('')}</section>`;
}

const html =
  '<div data-aa-seo hidden><article>' +
  '<h1>Performance en WhatsApp LATAM 2026</h1>' +
  SECTIONS.map(section).join('') +
  '</article></div>';

if (html.length > EMBED_LIMIT) {
  console.error(`seo-snapshot: ${html.length} caracteres, supera el límite del Embed (${EMBED_LIMIT})`);
  process.exit(1);
}
process.stdout.write(html);
console.error(`seo-snapshot: ${html.length} caracteres`);
